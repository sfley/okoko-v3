package app

import (
	"encoding/json"
	"fmt"
	"net/http/httptest"
	"testing"
	"time"
)

func TestJournalPaginationFiltersAndLegacyResponse(t *testing.T) {
	a := testApp(t)
	now := time.Now().UTC()
	for i := 0; i < 137; i++ {
		circuit, kind, before, after := "hk1", "status0", "Mode réduit", "Mode confort"
		if i%2 == 1 {
			circuit, kind, before, after = "ww1", "pump", "0", "1"
		}
		if _, err := a.db.Exec(`INSERT INTO okoko17_transitions(ts,circuit,kind,old_value,new_value) VALUES(?,?,?,?,?)`, now.Add(-time.Duration(i)*time.Minute).Format(time.RFC3339), circuit, kind, before, after); err != nil {
			t.Fatal(err)
		}
	}
	seen := map[float64]bool{}
	for page := 1; page <= 14; page++ {
		out := getJSON(t, a, fmt.Sprintf("/api/v3/transitions?page=%d&page_size=10", page))
		events := out["events"].([]any)
		expected := 10
		if page == 14 {
			expected = 7
		}
		if len(events) != expected || out["pagination"].(map[string]any)["total"] != float64(137) {
			t.Fatalf("page %d: %v", page, out)
		}
		for _, event := range events {
			id := event.(map[string]any)["id"].(float64)
			if seen[id] {
				t.Fatal("duplicate across pages")
			}
			seen[id] = true
		}
	}
	if len(seen) != 137 {
		t.Fatal("older events lost")
	}
	filtered := getJSON(t, a, "/api/v3/transitions?page=1&page_size=5&circuit=ww1&kind=pump&days=1")
	if filtered["summary"].(map[string]any)["pump_changes"] != float64(68) || filtered["summary"].(map[string]any)["status_changes"] != float64(0) {
		t.Fatal(filtered)
	}
	search := getJSON(t, a, "/api/v3/transitions?page=1&q=confort")
	if search["pagination"].(map[string]any)["total"] != float64(69) {
		t.Fatal(search)
	}
	literal := getJSON(t, a, "/api/v3/transitions?page=1&q=%25")
	if literal["pagination"].(map[string]any)["total"] != float64(0) {
		t.Fatal("search interpreted a SQL wildcard")
	}
	w := httptest.NewRecorder()
	a.Handler().ServeHTTP(w, httptest.NewRequest("GET", "/api/v3/transitions", nil))
	var old []map[string]any
	if err := json.Unmarshal(w.Body.Bytes(), &old); err != nil || len(old) != 100 {
		t.Fatalf("legacy clients broken: %v %d", err, len(old))
	}
}

func TestJournalUsesInstantsForOrderingAndRejectsBadFilters(t *testing.T) {
	a := testApp(t)
	// Lexical order differs from instant order during the change to winter time.
	for _, ts := range []string{"2026-10-25T02:50:00+02:00", "2026-10-25T02:10:00+01:00"} {
		if _, err := a.db.Exec(`INSERT INTO okoko17_transitions(ts,circuit,kind,old_value,new_value) VALUES(?,'pe1','status','Arrêt','Chauffage')`, ts); err != nil {
			t.Fatal(err)
		}
	}
	out := getJSON(t, a, "/api/v3/transitions?page=1&page_size=5")
	if out["events"].([]any)[0].(map[string]any)["ts"] != "2026-10-25T02:10:00+01:00" {
		t.Fatal("events sorted by string rather than real time")
	}
	for _, q := range []string{"page=0", "page=oops", "page_size=101", "circuit=unknown", "kind=unknown", "days=-1", "days=731"} {
		w := httptest.NewRecorder()
		a.Handler().ServeHTTP(w, httptest.NewRequest("GET", "/api/v3/transitions?"+q, nil))
		if w.Code != 400 {
			t.Fatalf("invalid filter accepted: %s (%d)", q, w.Code)
		}
	}
}

func TestECSUsesRealTankSensorsWithoutInventingFlow(t *testing.T) {
	a := testApp(t)
	rawBoiler(t, a)
	out := getJSON(t, a, "/api/v3/snapshot")
	ecs := out["circuits"].(map[string]any)["ww1"].(map[string]any)
	if ecs["flow"] != nil || ecs["temperature"] != 39.7 || ecs["temperature_low"] != nil {
		t.Fatal(ecs)
	}
	a.live["ww1"].(map[string]any)["L_offtemp_act"] = json.Number("365")
	a.live["hk1"].(map[string]any)["L_flowtemp_set"] = json.Number("330")
	updated := getJSON(t, a, "/api/v3/snapshot")
	if updated["circuits"].(map[string]any)["ww1"].(map[string]any)["temperature_low"] != 36.5 {
		t.Fatal("real lower sensor lost")
	}
	if updated["circuits"].(map[string]any)["hk1"].(map[string]any)["flow_setpoint"] != float64(33) {
		t.Fatal("flow target lost")
	}
	hk1 := out["circuits"].(map[string]any)["hk1"].(map[string]any)
	if hk1["flow_setpoint"] != nil {
		t.Fatal(hk1)
	}
}
