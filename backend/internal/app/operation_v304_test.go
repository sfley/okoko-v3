package app

import (
	"context"
	"database/sql"
	"encoding/json"
	"net/http/httptest"
	"testing"
	"time"
)

func TestFlowMigrationPreservesOldHistoryAndMissingTemperatures(t *testing.T) {
	a := testApp(t)
	// Recreate the precise 3.0.3 layout to exercise an upgrade, not a fresh schema.
	_, err := a.db.Exec(`DROP TABLE operation_samples; CREATE TABLE operation_samples(ts INTEGER PRIMARY KEY,hk1 REAL,hk2 REAL,ww1 REAL,outdoor REAL,modulation REAL,hk1_pump INTEGER,hk2_pump INTEGER,ww1_pump INTEGER,interval_seconds INTEGER NOT NULL); INSERT INTO operation_samples(ts,hk1,interval_seconds) VALUES(1,19.6,60)`)
	if err != nil {
		t.Fatal(err)
	}
	for i := 0; i < 2; i++ {
		if err = a.initOperationFlow(); err != nil {
			t.Fatal(err)
		}
	}
	var room float64
	var flow sql.NullFloat64
	if err = a.db.QueryRow(`SELECT hk1,hk1_flow FROM operation_samples WHERE ts=1`).Scan(&room, &flow); err != nil || room != 19.6 || flow.Valid {
		t.Fatal("old samples rewritten or flow invented", err, room, flow)
	}
	rawBoiler(t, a)
	if err = a.recordOperation(context.Background(), a.live, time.Now().Add(-time.Minute)); err != nil {
		t.Fatal(err)
	}
	out := getJSON(t, a, "/api/v3/operation?days=1")
	point := out["points"].([]any)[0].(map[string]any)
	if point["hk1_flow"] != 27.7 || point["hk2_flow"] != 29.0 || point["ww1"] != 39.7 || point["hk1"] != 19.6 {
		t.Fatal("wrong sensor mapping", point)
	}
	delete(a.live["hk1"].(map[string]any), "L_flowtemp_act")
	if err = a.recordOperation(context.Background(), a.live, time.Now()); err != nil {
		t.Fatal(err)
	}
	out = getJSON(t, a, "/api/v3/operation?days=1")
	points := out["points"].([]any)
	if points[len(points)-1].(map[string]any)["hk1_flow"] != nil {
		t.Fatal("missing flow replaced with a room temperature")
	}
}

func TestFlowExtremaAndPumpEdgesSurviveSampling(t *testing.T) {
	start := time.Now().UTC().Truncate(time.Second)
	plot := operationPlot{from: start, to: start.Add(30 * 24 * time.Hour)}
	for i := 0; i < 20; i++ {
		entry := operationReading{at: start.Add(time.Duration(i) * time.Minute), interval: 60, pumps: [3]int{0, -1, -1}}
		entry.values[5] = sql.NullFloat64{Float64: 30, Valid: true}
		if i == 4 {
			entry.values[5].Float64 = 68
		}
		if i == 10 {
			entry.pumps[0] = 1
		}
		plot.add(entry)
	}
	plot.flush()
	peak, before, on, after := false, false, false, false
	for _, point := range plot.points {
		peak = peak || point["hk1_flow"] == float64(68)
		before = before || point["ts"] == operationTime(start.Add(9*time.Minute))
		on = on || point["ts"] == operationTime(start.Add(10*time.Minute))
		after = after || point["ts"] == operationTime(start.Add(11*time.Minute))
	}
	if !peak || !before || !on || !after {
		t.Fatal("thermal peak or pump edge lost", plot.points)
	}
}

func TestOperationZoomReadsActualFineSamples(t *testing.T) {
	a := testApp(t)
	start := time.Now().Add(-2 * time.Hour)
	for i := 0; i < 120; i++ {
		_, err := a.db.Exec(`INSERT INTO operation_samples(ts,hk1_flow,hk1_pump,interval_seconds) VALUES(?,?,1,60)`, start.Add(time.Duration(i)*time.Minute).UnixMilli(), 30+i%15)
		if err != nil {
			t.Fatal(err)
		}
	}
	out := getJSON(t, a, "/api/v3/operation?days=30&hours=1")
	points := out["points"].([]any)
	if len(points) < 58 || len(points) > 60 {
		t.Fatal("zoom reused the month sampling", len(points))
	}
	from, _ := time.Parse(time.RFC3339Nano, out["from"].(string))
	to, _ := time.Parse(time.RFC3339Nano, out["to"].(string))
	if to.Sub(from) != time.Hour {
		t.Fatal("incorrect zoom range")
	}
	for _, hours := range []string{"0", "2", "bad", "24"} {
		w := httptest.NewRecorder()
		a.Handler().ServeHTTP(w, httptest.NewRequest("GET", "/api/v3/operation?hours="+hours, nil))
		if w.Code != 400 {
			t.Fatal("invalid zoom accepted", hours)
		}
	}
	// Historical CSV already contains real flow temperatures, so no backfill is needed.
	a.db.Exec(`DELETE FROM operation_samples`)
	stamp := time.Now().Add(-time.Minute).In(a.location()).Format("2006-01-02T15:04:05")
	if _, err := a.db.Exec(`INSERT INTO measurements(ts,date,time,hk1_room,hk1_flow,hk2_flow) VALUES(?,?,?,20,41.5,32.5)`, stamp, stamp[:10], stamp[11:]); err != nil {
		t.Fatal(err)
	}
	w := httptest.NewRecorder()
	a.Handler().ServeHTTP(w, httptest.NewRequest("GET", "/api/v3/operation?hours=1", nil))
	var csv map[string]any
	if err := json.Unmarshal(w.Body.Bytes(), &csv); err != nil {
		t.Fatal(err)
	}
	point := csv["points"].([]any)[0].(map[string]any)
	if point["hk1_flow"] != 41.5 || point["hk2_flow"] != 32.5 {
		t.Fatal("CSV flow ignored", point)
	}
}
