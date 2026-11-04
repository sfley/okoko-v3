package app

import (
	"context"
	"database/sql"
	"math"
	"net/http"
	"sort"
	"strconv"
	"time"
)

// This history is separate from measurements, which remains the pellet engine's input.
func (a *App) recordOperation(parent context.Context, m map[string]any, at time.Time) error {
	ctx, cancel := context.WithTimeout(parent, 2*time.Second)
	defer cancel()
	pump := func(c string) any {
		n, ok := number(m, c, "L_pump").(float64)
		if !ok || (n != 0 && n != 1) {
			return nil
		}
		return int(n)
	}
	_, err := a.db.ExecContext(ctx, `INSERT OR IGNORE INTO operation_samples(ts,hk1,hk2,ww1,outdoor,modulation,hk1_pump,hk2_pump,ww1_pump,interval_seconds) VALUES(?,?,?,?,?,?,?,?,?,?)`,
		at.UnixMilli(), temperature(m, "hk1", "L_roomtemp_act"), temperature(m, "hk2", "L_roomtemp_act"), temperature(m, "ww1", "L_ontemp_act"), temperature(m, "system", "L_ambient"), number(m, "pe1", "L_modulation"), pump("hk1"), pump("hk2"), pump("ww1"), max(10, a.cfg.PollSeconds))
	return err
}

type operationReading struct {
	at       time.Time
	values   [5]sql.NullFloat64
	pumps    [3]int
	interval int
}
type pumpSpan struct {
	Start string `json:"start"`
	End   string `json:"end"`
	State int    `json:"state"`
}
type operationPlot struct {
	pointLimited bool
	from, to     time.Time
	points       []map[string]any
	spans        [3][]pumpSpan
	active       [3]bool
	previous     *operationReading
	bucket       int64
	selected     []operationReading
	limited      bool
}

func operationTime(t time.Time) string { return t.UTC().Format("2006-01-02T15:04:05.000Z") }
func (p *operationPlot) point(r operationReading) {
	if len(p.points) >= 6000 {
		p.pointLimited = true
		return
	}
	item := map[string]any{"ts": operationTime(r.at)}
	for i, key := range []string{"hk1", "hk2", "ww1", "outdoor", "modulation"} {
		item[key] = nil
		if r.values[i].Valid && !math.IsNaN(r.values[i].Float64) && !math.IsInf(r.values[i].Float64, 0) {
			item[key] = r.values[i].Float64
		}
	}
	p.points = append(p.points, item)
}
func (p *operationPlot) flush() {
	sort.Slice(p.selected, func(i, j int) bool { return p.selected[i].at.Before(p.selected[j].at) })
	for i, r := range p.selected {
		if i == 0 || !r.at.Equal(p.selected[i-1].at) {
			p.point(r)
		}
	}
	p.selected = nil
}
func (p *operationPlot) add(r operationReading) {
	if r.at.Before(p.from) || r.at.After(p.to) || (p.previous != nil && !r.at.After(p.previous.at)) {
		return
	}
	gap := p.previous != nil && r.at.Sub(p.previous.at) > time.Duration(3*max(r.interval, p.previous.interval))*time.Second
	missingEdge := false
	if p.previous != nil {
		for i, value := range r.values {
			if value.Valid != p.previous.values[i].Valid {
				missingEdge = true
				break
			}
		}
	}
	if missingEdge && !gap {
		p.flush()
	}
	if gap {
		p.flush()
		p.point(operationReading{at: p.previous.at.Add(time.Millisecond)})
		p.active = [3]bool{}
	}
	for lane, state := range r.pumps {
		if state < 0 {
			p.active[lane] = false
			continue
		}
		spans := p.spans[lane]
		if p.active[lane] && len(spans) > 0 {
			last := &spans[len(spans)-1]
			if last.State == state {
				last.End = operationTime(r.at)
				continue
			}
			// Step-after is the last reported state, not an exact physical switching time.
			last.End = operationTime(r.at)
		}
		if len(spans) >= 2000 {
			p.limited = true
			p.active[lane] = false
			continue
		}
		p.spans[lane] = append(spans, pumpSpan{Start: operationTime(r.at), End: operationTime(r.at), State: state})
		p.active[lane] = true
	}
	bucket := r.at.Sub(p.from).Milliseconds() / max(int64(1), p.to.Sub(p.from).Milliseconds()/400)
	if len(p.selected) == 0 || bucket != p.bucket {
		p.flush()
		p.bucket = bucket
		p.selected = []operationReading{r, r, r, r}
	} else {
		p.selected[1] = r
		if r.values[4].Valid && (!p.selected[2].values[4].Valid || r.values[4].Float64 < p.selected[2].values[4].Float64) {
			p.selected[2] = r
		}
		if r.values[4].Valid && (!p.selected[3].values[4].Valid || r.values[4].Float64 > p.selected[3].values[4].Float64) {
			p.selected[3] = r
		}
	}
	copy := r
	p.previous = &copy
}
func (a *App) operationV3(w http.ResponseWriter, r *http.Request) {
	days := 1
	if raw := r.URL.Query().Get("days"); raw != "" {
		n, e := strconv.Atoi(raw)
		if e != nil || n < 1 || n > 30 {
			http.Error(w, "Période invalide (1 à 30 jours)", 400)
			return
		}
		days = n
	}
	ctx, cancel := context.WithTimeout(r.Context(), 4*time.Second)
	defer cancel()
	location := a.location()
	until := time.Now().UTC()
	from := until.Add(-time.Duration(days) * 24 * time.Hour)
	plot := operationPlot{from: from, to: until, points: []map[string]any{}, spans: [3][]pumpSpan{{}, {}, {}}}
	var first sql.NullInt64
	if err := a.db.QueryRowContext(ctx, `SELECT MIN(ts) FROM operation_samples WHERE ts<=?`, until.UnixMilli()).Scan(&first); err != nil {
		http.Error(w, "Historique indisponible", 503)
		return
	}
	csvEnd := until.Add(time.Second)
	if first.Valid {
		csvEnd = time.UnixMilli(first.Int64)
	}
	csvSeen, jsonSeen := false, false
	read := func(query string, args []any, jsonSource bool) error {
		rows, err := a.db.QueryContext(ctx, query, args...)
		if err != nil {
			return err
		}
		defer rows.Close()
		for rows.Next() {
			var raw string
			var entry operationReading
			var pumps [3]sql.NullFloat64
			if err := rows.Scan(&raw, &entry.values[0], &entry.values[1], &entry.values[2], &entry.values[3], &entry.values[4], &pumps[0], &pumps[1], &pumps[2], &entry.interval); err != nil {
				return err
			}
			if jsonSource {
				ms, e := strconv.ParseInt(raw, 10, 64)
				if e != nil {
					continue
				}
				entry.at = time.UnixMilli(ms)
			} else {
				date, e := time.ParseInLocation("2006-01-02T15:04:05", raw, location)
				if e != nil {
					continue
				}
				entry.at = date
			}
			if entry.at.Before(from) || entry.at.After(until) {
				continue
			}
			for i, v := range entry.values {
				if v.Valid && (math.IsNaN(v.Float64) || math.IsInf(v.Float64, 0) || (i < 4 && (v.Float64 == -32768 || v.Float64 == 32767))) {
					entry.values[i].Valid = false
				}
			}
			for i, pump := range pumps {
				entry.pumps[i] = -1
				if pump.Valid && (pump.Float64 == 0 || pump.Float64 == 1) {
					entry.pumps[i] = int(pump.Float64)
				}
			}
			plot.add(entry)
			if jsonSource {
				jsonSeen = true
			} else {
				csvSeen = true
			}
		}
		return rows.Err()
	}
	if csvEnd.After(from) {
		err := read(`SELECT ts,hk1_room,hk2_room,dhw_in,ext,modulation,hk1_pump,hk2_pump,dhw_pump,60 FROM measurements WHERE ts>=? AND ts<? ORDER BY ts`, []any{from.In(location).Format("2006-01-02T15:04:05"), csvEnd.In(location).Format("2006-01-02T15:04:05")}, false)
		if err != nil {
			http.Error(w, "Archives de fonctionnement indisponibles", 503)
			return
		}
	}
	if err := read(`SELECT CAST(ts AS TEXT),hk1,hk2,ww1,outdoor,modulation,hk1_pump,hk2_pump,ww1_pump,interval_seconds FROM operation_samples WHERE ts>=? AND ts<=? ORDER BY ts`, []any{from.UnixMilli(), until.UnixMilli()}, true); err != nil {
		http.Error(w, "Relevés de fonctionnement indisponibles", 503)
		return
	}
	plot.flush()
	if plot.pointLimited {
		plot.points = []map[string]any{}
	}
	if plot.limited {
		plot.spans = [3][]pumpSpan{{}, {}, {}}
	}
	writeJSON(w, map[string]any{"from": operationTime(from), "to": operationTime(until), "points": plot.points, "pumps": map[string]any{"hk1": plot.spans[0], "hk2": plot.spans[1], "ww1": plot.spans[2]}, "pump_limited": plot.limited, "points_limited": plot.pointLimited, "sources": map[string]bool{"json": jsonSeen, "csv": csvSeen}, "timezone": a.timeZone()})
}
