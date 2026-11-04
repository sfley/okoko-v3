// The controller's on/off measurements describe control roles, not sensor height.
// Show another reading only when different sensor selections are explicitly provided.
export function otherDHWReading(circuit) {
  const on=circuit?.sensor_on, off=circuit?.sensor_off, measurement=circuit?.temperature_off;
  return Number.isInteger(on) && on>=0 && Number.isInteger(off) && off>=0 && on!==off && Number.isFinite(measurement)
    ? measurement : null;
}
