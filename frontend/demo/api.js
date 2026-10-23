import { createDemoData } from './data.js';
export const DEMO_STORAGE = 'okoko.demo.refills.v1';
const data = createDemoData();
let extraRefills = [];
try { const saved = JSON.parse(localStorage.getItem(DEMO_STORAGE)); if (Array.isArray(saved)) extraRefills = saved.filter(r=>r && typeof r.kg==='number' && r.kg>0 && /^\d{4}-\d{2}-\d{2}/.test(r.date)); } catch { /* A blocked store must not break the demo. */ }
const copy = (value) => JSON.parse(JSON.stringify(value));
export async function demoRequest(path, options = {}) {
  if (options.signal?.aborted) throw new DOMException('Aborted','AbortError');
  const url = new URL(path, 'https://demo.invalid/');
  const name = url.pathname.replace(/^\//,'');
  if (options.method === 'POST') {
    if (name === 'refills') {
      let record;
      try { record = JSON.parse(options.body); } catch { throw new Error('Recharge invalide.'); }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(record.date) || !Number.isFinite(record.kg) || record.kg<=0 || record.kg>50000) throw new Error('Vérifiez la date et la quantité.');
      if ([...extraRefills,...data.pellets.refills].some(r=>r.date.slice(0,10)===record.date && r.kg===record.kg)) throw new Error('Cette recharge existe déjà dans la démonstration.');
      extraRefills.unshift({date:record.date,kg:record.kg,supplier:String(record.supplier||''),kind:String(record.kind||''),note:String(record.note||'')});
      try { localStorage.setItem(DEMO_STORAGE,JSON.stringify(extraRefills)); } catch { /* In-memory demo still works. */ }
      return { saved:true, demo:true };
    }
    if (name === 'import') {
      data.system.runs.unshift({id:data.system.runs[0].id+1,at:new Date().toISOString(),time_known:true,source:'Import simulé · Démo',read:0,added:0,duplicates:0,error:''});
      return { started:true, demo:true };
    }
    throw new Error('Cette commande n’est pas disponible en démonstration.');
  }
  if (name === 'snapshot') return copy({...data.snapshot,last_seen:new Date().toISOString()});
  if (name === 'pellets') return copy({...data.pellets,refills:[...extraRefills,...data.pellets.refills]});
  if (name === 'history') {
    const days = Math.min(730,Math.max(1,Number(url.searchParams.get('days'))||1));
    return copy(data.history.map((row,i)=>({...row,ts:new Date(Date.now()-(143-i)*600000*days).toISOString()})));
  }
  if (name === 'system') {
    const total=data.system.runs.length, pages=Math.max(1,Math.ceil(total/10));
    const page=Math.min(pages,Math.max(1,Number(url.searchParams.get('page'))||1));
    return copy({...data.system,runs:data.system.runs.slice((page-1)*10,page*10),pagination:{page,page_size:10,total,pages}});
  }
  if (Object.hasOwn(data,name)) return copy(data[name]);
  throw new Error('Cette fonction nécessite votre installation locale.');
}
export function resetDemo() {
  for (const key of ['okoko.demo.refills.v1','okoko.demo.cockpit.v1']) { try { localStorage.removeItem(key); } catch {} }
  location.reload();
}
export function installDemoDownloads() {
  document.addEventListener('click',event=>{
    const anchor=event.target.closest?.('a[href]');
    if (!anchor) return;
    const url=new URL(anchor.href,location.href);
    if (url.pathname!=='/api/v3/export') return;
    event.preventDefault();
    const monthly=url.searchParams.get('type')==='monthly';
    const rows=monthly?data.pellets.monthly:data.history;
    const columns=monthly?['year','month','kg']:['ts','hk1','hk2','ww1','outdoor','modulation','stock'];
    const csv=[columns.join(';'),...rows.map(row=>columns.map(key=>row[key]??'').join(';'))].join('\r\n');
    const blob=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}));
    const download=document.createElement('a'); download.href=blob;download.download=`okoko-demo-${monthly?'bilan':'temperatures'}.csv`;download.click();
    setTimeout(()=>URL.revokeObjectURL(blob),1000);
  });
}
