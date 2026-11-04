package app

// This server exists only in the Go test binary. It never contacts real hardware.
import (
	"context"
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"
)

func TestBrowserFixtureServer(t *testing.T) {
	if os.Getenv("OKOKO_BROWSER_FIXTURE") != "1" {
		t.Skip("optional isolated browser fixture server")
	}
	a := testApp(t)
	rawBoiler(t, a)
	t.Setenv("OKOKO_INSTANCE_LABEL", "BANC DE VALIDATION · JSON FOURNI DU 23 OCTOBRE 2026")
	for i := 1; i <= 25; i++ {
		a.logRun(fmt.Sprintf("CSV test %02d", i), i, i, nil)
	}
	for i := 0; i <= 8; i++ {
		hk2, ecs := 0, 0
		if i >= 4 {
			hk2 = 1
		}
		if i >= 2 && i <= 5 {
			ecs = 1
		}
		modulation := (i % 3) * 20
		if i == 8 {
			modulation = 0
		}
		_, err := a.db.Exec(`INSERT INTO operation_samples(ts,hk1,hk2,ww1,outdoor,modulation,hk1_pump,hk2_pump,ww1_pump,interval_seconds) VALUES(?,19.6,20.6,39.7,13.1,?,?,?,?,60)`, time.Now().Add(time.Duration(i-8)*time.Minute).UnixMilli(), modulation, (i+1)%2, hk2, ecs)
		if err != nil {
			t.Fatal(err)
		}
	}
	mux := http.NewServeMux()
	// Freeze only the fixture's calendar metadata, keeping the real JSON parsing path.
	mux.HandleFunc("/api/v3/weather", func(w http.ResponseWriter, r *http.Request) {
		recorder := httptest.NewRecorder()
		a.Handler().ServeHTTP(recorder, r)
		var data map[string]any
		if err := json.Unmarshal(recorder.Body.Bytes(), &data); err != nil {
			t.Error(err)
			http.Error(w, "fixture", 500)
			return
		}
		data["current_day"] = "2026-10-23"
		writeJSON(w, data)
	})
	done := make(chan struct{})
	mux.HandleFunc("/test-fixture/stop", func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(204); close(done) })
	mux.Handle("/", a.Handler())
	listener, err := net.Listen("tcp", "127.0.0.1:8889")
	if err != nil {
		t.Fatal(err)
	}
	server := &http.Server{Handler: mux, ReadHeaderTimeout: 3 * time.Second}
	go server.Serve(listener)
	defer server.Close()
	fmt.Println("Isolated raw-JSON fixture ready on 127.0.0.1:8889")
	select {
	case <-done:
	case <-time.After(3 * time.Minute):
		t.Fatal("browser fixture timed out")
	}
	server.Shutdown(context.Background())
}
