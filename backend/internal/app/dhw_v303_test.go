package app

import (
	"encoding/json"
	"testing"
)

func TestDHWControlRolesDoNotAssertSensorHeight(t *testing.T) {
	a := testApp(t)
	rawBoiler(t, a)
	raw := a.live["ww1"].(map[string]any)
	raw["L_offtemp_act"] = json.Number("397")
	raw["sensor_on"] = json.Number("0")
	raw["sensor_off"] = json.Number("0")
	out := getJSON(t, a, "/api/v3/snapshot")
	dhw := out["circuits"].(map[string]any)["ww1"].(map[string]any)
	if dhw["temperature_on"] != 39.7 || dhw["temperature_off"] != 39.7 || dhw["sensor_on"] != float64(0) || dhw["sensor_off"] != float64(0) {
		t.Fatal(dhw)
	}
	raw["sensor_off"] = map[string]any{"val": json.Number("1")}
	out = getJSON(t, a, "/api/v3/snapshot")
	if out["circuits"].(map[string]any)["ww1"].(map[string]any)["sensor_off"] != float64(1) {
		t.Fatal("explicit sensor selection lost")
	}
	delete(raw, "sensor_on")
	delete(raw, "sensor_off")
	out = getJSON(t, a, "/api/v3/snapshot")
	dhw = out["circuits"].(map[string]any)["ww1"].(map[string]any)
	if dhw["sensor_on"] != nil || dhw["sensor_off"] != nil {
		t.Fatal("missing sensor choices invented")
	}
}
