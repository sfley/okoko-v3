import React, { useState } from 'react';
import { ArrowRight, Download, Search } from 'lucide-react';
import { dateLabel, useResource } from '../api';
import { Badge, Card, Empty, ErrorNotice, Metric, PageHeading } from '../components/UI';
import { HistoryChart } from '../components/Charts';
import { circuitLabels, eventLabel, eventValue, journalData } from '../journal';
export default function Analysis({snapshot}) {
  const [filters,setFilters]=useState({circuit:'all',kind:'all',days:'7',q:''});
  const [search,setSearch]=useState('');
  const [page,setPage]=useState(1);
  const [showHistory,setShowHistory]=useState(false);
  const [days,setDays]=useState(1);
  const params=new URLSearchParams({page:String(page),page_size:'10'});
  for(const [key,val] of Object.entries(filters))if(val&&val!=='all')params.set(key,val);
  const transitions=useResource(`transitions?${params}`,30000);
  const history=useResource(showHistory?`history?days=${days}`:null,60000);
  const journal=journalData(transitions.data), names=circuitLabels(snapshot), pagination=journal.pagination;
  function change(key,val){setFilters(old=>({...old,[key]:val}));setPage(1);}
  return <>
    <PageHeading eyebrow="Comprendre ce qui se passe" title={<>Votre installation, <span>au fil des événements.</span></>} description="Les changements de mode, les pompes et les états réellement observés.">
      <a className="button" href="/api/v3/export?type=measurements"><Download size={16}/>Exporter les mesures</a>
    </PageHeading>
    <div className="journal-summary three-columns" aria-label="Bilan des événements filtrés">
      <section className="panel"><Metric label="Changements observés" number={transitions.data?journal.summary.events:null} accent="teal"/></section>
      <section className="panel"><Metric label="Changements de pompe" number={transitions.data?journal.summary.pump_changes:null}/></section>
      <section className="panel"><Metric label="Modes et états" number={transitions.data?journal.summary.status_changes:null}/></section>
    </div>
    <Card title="Le journal de votre installation" eyebrow="Événements réels" icon="activity" className="installation-journal">
      <div className="journal-filters">
        <label>Circuit<select aria-label="Filtrer les transitions" value={filters.circuit} onChange={e=>change('circuit',e.target.value)}><option value="all">Tous les circuits</option>{Object.entries(names).map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label>
        <label>Événement<select aria-label="Type d’événement" value={filters.kind} onChange={e=>change('kind',e.target.value)}><option value="all">Tous les événements</option><option value="pump">Pompes</option><option value="status">Modes et états</option></select></label>
        <label>Période<select aria-label="Période du journal" value={filters.days} onChange={e=>change('days',e.target.value)}><option value="1">Dernières 24 heures</option><option value="7">7 derniers jours</option><option value="30">30 derniers jours</option><option value="all">Tout l’historique</option></select></label>
        <form className="journal-search" onSubmit={e=>{e.preventDefault();change('q',search.trim());}}><label>État recherché<input aria-label="Rechercher un état" value={search} maxLength={120} onChange={e=>setSearch(e.target.value)} placeholder="Confort, arrêt…"/></label><button className="button icon-button" aria-label="Rechercher dans le journal"><Search size={17}/></button></form>
      </div>
      <ErrorNotice error={transitions.error} retry={transitions.reload}/>
      {journal.events.length?<div className="table-scroll"><table className="transitions-table"><thead><tr><th>Observation</th><th>Circuit</th><th>Événement</th><th>Changement</th></tr></thead><tbody>
        {journal.events.map((event,i)=><tr key={event.id || `${event.ts}-${i}`}><td><time dateTime={event.ts}>{dateLabel(event.ts,{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}</time></td><td><Badge tone="teal">{names[event.circuit] || event.circuit}</Badge></td><td>{eventLabel(event)}</td><td><div className="transition-values"><span>{eventValue(event,event.before)}</span><ArrowRight size={15}/><strong>{eventValue(event,event.after)}</strong></div></td></tr>)}
      </tbody></table></div>:!transitions.error&&<Empty title={transitions.loading?'Chargement du journal…':'Aucun événement pour ces filtres'}>Élargissez la période ou sélectionnez tous les circuits. Les observations anciennes restent conservées.</Empty>}
      {pagination&&pagination.total>0&&<nav className="import-pagination" aria-label="Pages du journal de l’installation"><span>{(pagination.page-1)*pagination.page_size+1}–{Math.min(pagination.page*pagination.page_size,pagination.total)} sur {pagination.total} événements</span><div><button className="button small" disabled={pagination.page<=1||transitions.loading} onClick={()=>setPage(pagination.page-1)}>Précédents</button><span>Page {pagination.page} / {pagination.pages}</span><button className="button small" disabled={pagination.page>=pagination.pages||transitions.loading} onClick={()=>setPage(pagination.page+1)}>Suivants</button></div></nav>}
      <p className="small-note">Les heures indiquent l’observation lors d’une collecte. Aucun changement ni durée de fonctionnement n’est reconstitué entre deux lectures. Les compteurs suivent les filtres sélectionnés.</p>
    </Card>
    <details className="analysis-history" onToggle={e=>setShowHistory(e.currentTarget.open)}><summary>Historique des températures <span>Archives CSV importées</span></summary>
      {showHistory&&<Card title="L’équilibre thermique" eyebrow="Données des fichiers importés" icon="temperatures" action={<div className="segmented" aria-label="Période">{[[1,'24 h'],[7,'7 jours'],[30,'30 jours']].map(([n,label])=><button key={n} aria-pressed={days===n} onClick={()=>setDays(n)}>{label}</button>)}</div>}>
        <ErrorNotice error={history.error} retry={history.reload}/><HistoryChart data={history.data||[]} snapshot={snapshot}/><p className="chart-footnote">Les valeurs affichées sont celles des fichiers CSV. Une série constante à zéro dans les archives ne remplace pas la température instantanée de la chaudière.</p>
      </Card>}
    </details>
  </>;
}
