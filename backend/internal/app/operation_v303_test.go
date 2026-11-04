package app

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http/httptest"
	"testing"
	"time"
)

func TestOperatingHistoryPreservesSwitchesGapsAndModulationPeaks(t *testing.T) {
	a := testApp(t)
	start := time.Now().UTC().Add(-30 * time.Minute).Truncate(time.Second)
	for _, r := range []struct {
		minute int
		pump   any
		mod    any
	}{{0, 0, 20}, {1, 1, 99}, {2, 0, 30}, {20, 1, 0}, {21, 1, 35}} {
		_, err := a.db.Exec(`INSERT INTO operation_samples(ts,hk1,modulation,hk1_pump,interval_seconds) VALUES(?,20.5,?,?,60)`, start.Add(time.Duration(r.minute)*time.Minute).UnixMilli(), r.mod, r.pump)
		if err != nil {
			t.Fatal(err)
		}
	}
	out := getJSON(t, a, "/api/v3/operation?days=1")
	lanes := out["pumps"].(map[string]any)
	spans := lanes["hk1"].([]any)
	if len(spans) != 4 || len(lanes["ww1"].([]any)) != 0 {
		t.Fatal(lanes)
	}
	if spans[2].(map[string]any)["end"] != operationTime(start.Add(2*time.Minute)) || spans[3].(map[string]any)["start"] != operationTime(start.Add(20*time.Minute)) {
		t.Fatal("outage was filled with an invented state", spans)
	}
	if spans[3].(map[string]any)["end"] != operationTime(start.Add(21*time.Minute)) {
		t.Fatal("last state extrapolated beyond last reading")
	}
	peak, gap := false, false
	for _, v := range out["points"].([]any) {
		point := v.(map[string]any)
		peak = peak || point["modulation"] == float64(99)
		gap = gap || point["modulation"] == nil
	}
	if !peak || !gap {
		t.Fatal("peak or missing-data gap lost")
	}
}
func TestOperatingHistoryUsesCSVBeforeJSONWithoutChangingPelletInputs(t *testing.T) {
	a := testApp(t)
	rawBoiler(t, a)
	at := time.Now().Add(-2 * time.Minute)
	old := at.Add(-time.Hour).In(a.location()).Format("2006-01-02T15:04:05")
	_, err := a.db.Exec(`INSERT INTO measurements(ts,date,time,hk1_room,modulation,hk1_pump,stock_kg) VALUES(?,?,?,20.5,45,1,850)`, old, old[:10], old[11:])
	if err != nil {
		t.Fatal(err)
	}
	a.live["hk1"].(map[string]any)["L_pump"] = json.Number("0")
	if err := a.recordOperation(context.Background(), a.live, at); err != nil {
		t.Fatal(err)
	}
	out := getJSON(t, a, "/api/v3/operation?days=1")
	if out["sources"].(map[string]any)["csv"] != true || out["sources"].(map[string]any)["json"] != true {
		t.Fatal(out)
	}
	points := out["points"].([]any)
	if points[0].(map[string]any)["hk1"] != 20.5 || points[len(points)-1].(map[string]any)["hk1"] != 19.6 {
		t.Fatal(points)
	}
	var count int
	var stock float64
	if err := a.db.QueryRow(`SELECT COUNT(*),MAX(stock_kg) FROM measurements`).Scan(&count, &stock); err != nil || count != 1 || stock != 850 {
		t.Fatal("pellet source modified", err)
	}
	for _, raw := range []string{"0", "31", "bad"} {
		w := httptest.NewRecorder()
		a.Handler().ServeHTTP(w, httptest.NewRequest("GET", "/api/v3/operation?days="+raw, nil))
		if w.Code != 400 {
			t.Fatalf("invalid period %s accepted", raw)
		}
	}
}
func TestOperatingHistoryEmptyAndDenseRangesStayExplicit(t *testing.T) {
	a := testApp(t)
	out := getJSON(t, a, "/api/v3/operation?days=1")
	if len(out["points"].([]any)) != 0 {
		t.Fatal("empty history became data")
	}
	start := time.Now().UTC().Add(-8 * 24 * time.Hour)
	p := operationPlot{from: start, to: time.Now().UTC()}
	for i := 0; i < 6500; i++ {
		p.add(operationReading{at: start.Add(time.Duration(i) * 50 * time.Second), interval: 10, pumps: [3]int{1, -1, -1}})
	}
	p.flush()
	if !p.limited || !p.pointLimited || len(p.points) > 6000 {
		t.Fatal("dense plot was not bounded", fmt.Sprint(len(p.points)))
	}
}

func TestMissingSensorReadingsDoNotBridgeUnknownIntervals(t *testing.T) {
	start := time.Now().UTC().Truncate(time.Second)
	p := operationPlot{from: start, to: start.Add(24 * time.Hour)}
	for i := 0; i < 3; i++ {
		r := operationReading{at: start.Add(time.Duration(i) * time.Minute), interval: 60, pumps: [3]int{1, -1, -1}}
		r.values[4] = sql.NullFloat64{Float64: 30, Valid: true}
		if i != 1 {
			r.values[0] = sql.NullFloat64{Float64: 20.5, Valid: true}
		} else {
			r.pumps[0] = -1
		}
		p.add(r)
	}
	p.flush()
	if len(p.points) != 3 || p.points[1]["hk1"] != nil || p.points[1]["modulation"] != float64(30) {
		t.Fatal("missing room reading was silently joined through", p.points)
	}
	if len(p.spans[0]) != 2 || p.spans[0][0].End != operationTime(start) || p.spans[0][1].Start != operationTime(start.Add(2*time.Minute)) {
		t.Fatal("unknown pump state was prolonged", p.spans[0])
	}
}

func TestOperatingMonthReturnsBoundedDataWithoutLosingPumpChanges(t *testing.T) {
	a := testApp(t)
	start := time.Now().UTC().Add(-30 * 24 * time.Hour)
	tx, err := a.db.Begin()
	if err != nil {
		t.Fatal(err)
	}
	stmt, err := tx.Prepare(`INSERT INTO operation_samples(ts,hk1,hk2,ww1,outdoor,modulation,hk1_pump,hk2_pump,ww1_pump,interval_seconds) VALUES(?,20,21,50,10,?,?,1,0,60)`)
	if err != nil {
		t.Fatal(err)
	}
	for i := 0; i < 43200; i++ {
		if _, err = stmt.Exec(start.Add(time.Duration(i)*time.Minute).UnixMilli(), i%100, (i/60)%2); err != nil {
			t.Fatal(err)
		}
	}
	stmt.Close()
	if err = tx.Commit(); err != nil {
		t.Fatal(err)
	}
	w := httptest.NewRecorder()
	a.Handler().ServeHTTP(w, httptest.NewRequest("GET", "/api/v3/operation?days=30", nil))
	if w.Code != 200 || w.Body.Len() > 1<<20 {
		t.Fatal("month response failed or grew beyond 1 MiB", w.Code, w.Body.Len())
	}
	var out map[string]any
	if err = json.Unmarshal(w.Body.Bytes(), &out); err != nil {
		t.Fatal(err)
	}
	if len(out["points"].([]any)) > 6000 || out["points_limited"] != false || out["pump_limited"] != false {
		t.Fatal("month plot lost completeness")
	}
	if len(out["pumps"].(map[string]any)["hk1"].([]any)) < 700 {
		t.Fatal("hourly pump switches lost during chart sampling")
	}
	var count int
	a.db.QueryRow(`SELECT COUNT(*) FROM measurements`).Scan(&count)
	if count != 0 {
		t.Fatal("operating samples entered pellet calculation table")
	}
}
