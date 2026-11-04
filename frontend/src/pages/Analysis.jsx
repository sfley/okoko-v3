import React, { useState } from 'react';
import { ArrowRight, Download, Search, X } from 'lucide-react';
import { dateLabel, useResource } from '../api';
import { Badge, Card, Empty, ErrorNotice, PageHeading } from '../components/UI';
import { HistoryChart } from '../components/Charts';
import PumpChart from '../components/PumpChart';
import { circuitLabels, eventLabel, eventValue, journalData } from '../journal';
export default function Analysis({snapshot}) {
  const [days,setDays]=useState(1);
  const [cursor,setCursor]=useState(null);
  const [zoom,setZoom]=useState(0);
  const [filters,setFilters]=useState({circuit:'all',kind:'all',days:'selected',q:''});
  const [search,setSearch]=useState('');
  const [page,setPage]=useState(1);
  const params=new URLSearchParams({page:String(page),page_size:'10'});
  for(const [key,val] of Object.entries(filters))if(val&&val!=='all')params.set(key,val==='selected'?String(days):val);
  const transitions=useResource(`transitions?${params}`,30000);
  const operation=useResource(`operation?days=${days}${zoom?`&hours=${zoom}`:''}`,30000);
  const journal=journalData(transitions.data), names=circuitLabels(snapshot), pagination=journal.pagination;
  const end=Date.parse(operation.data?.to),start=Date.parse(operation.data?.from);
  const visibleStart=zoom&&Number.isFinite(end)?Math.max(start,end-zoom*3600000):start;
  const readings=(operation.data?.points || []).filter(point=>Date.parse(point.ts)>=visibleStart);
  const domain=operation.data?[visibleStart,end]:undefined;
  function change(key,val){setFilters(old=>({...old,[key]:val}));setPage(1);}
  function period(n){setDays(n);setPage(1);setCursor(null);setZoom(0);}
  return <>
    <PageHeading eyebrow="Comprendre le fonctionnement" title={<>Températures, circulation <span>et puissance.</span></>} description="Suivez la chaleur, les mises en route des pompes et la modulation sur une même échelle de temps.">
      <a className="button" href="/api/v3/export?type=measurements"><Download size={16}/>Exporter les mesures</a>
    </PageHeading>
    <div className="analysis-period"><span>Une même période pour tous les graphiques</span><div className="segmented" aria-label="Période des graphiques">{[[1,'24 h'],[7,'7 jours'],[30,'30 jours']].map(([n,label])=><button key={n} aria-pressed={days===n} onClick={()=>period(n)}>{label}</button>)}</div></div>
    <div className="analysis-zoom"><span>Zoom commun</span><div className="segmented" aria-label="Zoom des graphiques">{[[0,'Vue complète'],[6,'6 h'],[1,'1 h']].map(([n,label])=><button key={n} aria-pressed={zoom===n} onClick={()=>{setZoom(n);setCursor(null);}}>{label}</button>)}</div></div>
    <ErrorNotice error={operation.error} retry={operation.reload}/>
    <div className="analysis-inspection">{cursor!==null?<><span>Repère commun : <strong>{dateLabel(new Date(cursor).toISOString(),{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}</strong></span><button className="text-link" onClick={()=>setCursor(null)}><X size={13}/>Effacer le repère</button></>:<span>Cliquez sur une courbe ou une bande de pompe pour placer un repère commun.</span>}</div>
    <div className="analysis-charts">
      <Card title="L’équilibre thermique" eyebrow="Températures sur la période" icon="temperatures" className="global-temperatures-card">
        {operation.data?.points_limited?<Empty title="Choisissez une période plus courte">Trop de relevés discontinus pour tracer une courbe lisible.</Empty>:<HistoryChart data={readings} snapshot={snapshot} timeDomain={domain} cursorTime={cursor} onSelectTime={setCursor}/>}
        <p className="chart-footnote">Relevés de la chaudière et archives disponibles. Les valeurs manquantes restent absentes.</p>
      </Card>
      {[["ww1","ww1","#f6a665","Température du ballon"],["hk1","hk1_flow","#5bbcb4","Température de départ du circuit"],["hk2","hk2_flow","#8e9af1","Température de départ du circuit"]].map(([id,field,color,measure])=><Card key={id} title={`Pompe · ${names[id]}`} eyebrow={measure} icon="activity" className="thermal-pump-card" >
        {operation.data?.pump_limited||operation.data?.points_limited?<Empty title="Choisissez une période plus courte">Trop de relevés discontinus pour représenter cette période.</Empty>:domain?<PumpChart data={readings} spans={operation.data?.pumps?.[id]||[]} field={field} domain={domain} color={color} cursor={cursor} onSelect={setCursor} waterLabel={id==='ww1'?'Ballon ECS':'Eau du circuit'} roomField={id==='ww1'?undefined:id} roomName={names[id]}/>:<Empty title="Chargement des relevés…"/>}
        <p className="chart-footnote">{id==='ww1'?"La hauteur colorée suit la température du ballon. Aucune température de pièce n’est fournie pour l’ECS.":"La hauteur colorée suit la température de départ de l’eau ; les pointillés clairs suivent la température de la pièce, même quand la pompe est arrêtée."} La bande inférieure indique la marche ou l’arrêt de la pompe. Les hachures signalent l’absence de relevé.</p>
      </Card>)}
      <Card title="Modulation de la chaudière" eyebrow="Niveau de puissance" icon="modulation" className="modulation-card">
        {operation.data?.points_limited?<Empty title="Choisissez une période plus courte">Trop de relevés discontinus pour tracer une courbe lisible.</Empty>:<HistoryChart data={readings} keys={['modulation']} unit="%" domain={[0,100]} timeDomain={domain} cursorTime={cursor} onSelectTime={setCursor}/>}
        <p className="chart-footnote">Une pompe peut faire circuler la chaleur alors que la modulation vaut 0 %.</p>
        <details className="efficiency-note"><summary>Et le rendement ?</summary><p>La modulation est un niveau de puissance. Un rendement demande l’énergie thermique produite et l’énergie consommée sur la même période. Ces mesures ne sont pas fournies : aucun rendement n’est calculé.</p></details>
      </Card>
    </div>
    <p className="small-note operation-reading-note">Une zone colorée plus haute signifie une température plus élevée, pas un débit ou une puissance mesurés. L’état déclaré est maintenu entre relevés rapprochés ; les interruptions de collecte restent vides.</p>
    <Card title="Le journal de votre installation" eyebrow="Événements réels" icon="activity" className="installation-journal">
      <div className="journal-filters">
        <label>Circuit<select aria-label="Filtrer les transitions" value={filters.circuit} onChange={e=>change('circuit',e.target.value)}><option value="all">Tous les circuits</option>{Object.entries(names).map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label>
        <label>Événement<select aria-label="Type d’événement" value={filters.kind} onChange={e=>change('kind',e.target.value)}><option value="all">Tous les événements</option><option value="pump">Pompes</option><option value="status">Modes et états</option></select></label>
        <label>Période<select aria-label="Période du journal" value={filters.days} onChange={e=>change('days',e.target.value)}><option value="selected">{days===1?"Dernières 24 heures":`${days} derniers jours`}</option><option value="all">Tout l’historique</option></select></label>
        <form className="journal-search" onSubmit={e=>{e.preventDefault();change('q',search.trim());}}><label>État recherché<input aria-label="Rechercher un état" value={search} maxLength={120} onChange={e=>setSearch(e.target.value)} placeholder="Confort, arrêt…"/></label><button className="button icon-button" aria-label="Rechercher dans le journal"><Search size={17}/></button></form>
      </div>
      <ErrorNotice error={transitions.error} retry={transitions.reload}/>
      {journal.events.length?<div className="table-scroll"><table className="transitions-table"><thead><tr><th>Observation</th><th>Circuit</th><th>Événement</th><th>Changement</th></tr></thead><tbody>
        {journal.events.map((event,i)=><tr key={event.id || `${event.ts}-${i}`}><td><time dateTime={event.ts}>{dateLabel(event.ts,{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}</time></td><td><Badge tone="teal">{names[event.circuit] || event.circuit}</Badge></td><td>{eventLabel(event)}</td><td><div className="transition-values"><span>{eventValue(event,event.before)}</span><ArrowRight size={15}/><strong>{eventValue(event,event.after)}</strong></div></td></tr>)}
      </tbody></table></div>:!transitions.error&&<Empty title={transitions.loading?'Chargement du journal…':'Aucun événement pour ces filtres'}>Élargissez la période ou sélectionnez tous les circuits. Les observations anciennes restent conservées.</Empty>}
      {pagination&&pagination.total>0&&<nav className="import-pagination" aria-label="Pages du journal de l’installation"><span>{(pagination.page-1)*pagination.page_size+1}–{Math.min(pagination.page*pagination.page_size,pagination.total)} sur {pagination.total} événements</span><div><button className="button small" disabled={pagination.page<=1||transitions.loading} onClick={()=>setPage(pagination.page-1)}>Précédents</button><span>Page {pagination.page} / {pagination.pages}</span><button className="button small" disabled={pagination.page>=pagination.pages||transitions.loading} onClick={()=>setPage(pagination.page+1)}>Suivants</button></div></nav>}
      <p className="small-note">Les heures indiquent l’observation lors d’une collecte. Aucun changement ni durée de fonctionnement n’est reconstitué entre deux lectures. Les filtres s’appliquent au journal détaillé.</p>
    </Card>
  </>;
}
