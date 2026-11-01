export const circuitLabels = snapshot => ({pe1:'Chaudière',hk1:'HK1',hk2:'HK2',ww1:'Eau chaude',...Object.fromEntries(Object.entries(snapshot?.circuits || {}).filter(([,c])=>c.name).map(([id,c])=>[id,c.name]))});
export const eventLabel = event => event.kind === 'pump' ? 'Pompe' : 'Mode / état';
export function eventValue(event, raw) {
  if (event.kind !== 'pump') return raw || '—';
  if (['1','true','on'].includes(String(raw).toLowerCase())) return 'En marche';
  if (['0','false','off'].includes(String(raw).toLowerCase())) return 'À l’arrêt';
  return raw || '—';
}
export function journalData(data) {
  if (!Array.isArray(data)) return data || {events:[],pagination:null,summary:{}};
  return {events:data,pagination:null,summary:{events:data.length,pump_changes:data.filter(e=>e.kind==='pump').length,status_changes:data.filter(e=>e.kind!=='pump').length}};
}
