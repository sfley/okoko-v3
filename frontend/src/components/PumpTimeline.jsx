import React, { useState } from 'react';
import { dateLabel } from '../api';
import { Empty } from './UI';
import { circuitLabels } from '../journal';
const label = raw => dateLabel(raw,{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});
function Lane({name,spans,from,to,cursor,onSelect}) {
  const [active,setActive]=useState(Math.max(0,spans.length-1));
  const percent=instant=>Math.max(0,Math.min(100,(new Date(instant)-from)/(to-from)*100));
  function inspect(event,span) {
    event.stopPropagation();
    const track=event.currentTarget.parentElement.getBoundingClientRect();
    onSelect(event.detail ? from+(event.clientX-track.x)/track.width*(to-from) : +new Date(span.start));
  }
  return <div className="pump-lane"><strong>{name}</strong><div className="pump-track" role="group" aria-label={`États de pompe · ${name}`} onClick={event=>{const bounds=event.currentTarget.getBoundingClientRect();onSelect(from+(event.clientX-bounds.x)/bounds.width*(to-from));}}>
    {spans.map((span,i)=><button key={`${span.start}-${i}`} type="button" className={`pump-segment ${span.state===1?'running':'stopped'}`} tabIndex={i===Math.min(active,spans.length-1)?0:-1}
      style={{left:`${percent(span.start)}%`,width:span.start===span.end?'1px':`${Math.max(0,percent(span.end)-percent(span.start))}%`}}
      aria-label={`${name} · ${span.state===1?'Marche':'Arrêt'} · ${label(span.start)} à ${label(span.end)}`} title={`${name} · ${span.state===1?'Marche':'Arrêt'}\n${label(span.start)} → ${label(span.end)} (relevés)`}
      onFocus={()=>setActive(i)} onClick={event=>inspect(event,span)} onKeyDown={event=>{if(!['ArrowLeft','ArrowRight'].includes(event.key))return;event.preventDefault();const next=Math.max(0,Math.min(spans.length-1,i+(event.key==='ArrowRight'?1:-1)));event.currentTarget.parentElement.querySelectorAll('button')[next]?.focus();onSelect(+new Date(spans[next].start));}}/>) }
    {cursor!==null&&cursor>=from&&cursor<=to&&<i className="pump-cursor" style={{left:`${percent(cursor)}%`}}/>}
  </div></div>;
}
export default function PumpTimeline({operation,snapshot,cursor,onSelect}) {
  const from=+new Date(operation?.from),to=+new Date(operation?.to), names=circuitLabels(snapshot);
  const lanes=['hk1','hk2','ww1'];
  if(operation?.pump_limited)return <Empty title="Choisissez une période plus courte">La période contient trop de changements pour une frise lisible.</Empty>;
  if(!Number.isFinite(from)||!Number.isFinite(to)||to<=from||!lanes.some(id=>operation?.pumps?.[id]?.length))return <Empty title="Les états des pompes apparaîtront ici">Les archives disponibles sont utilisées. Les nouveaux relevés commenceront avec cette version, sans reconstituer le passé.</Empty>;
  return <div className="pump-timeline">
    <div className="pump-timeline-legend"><span><i className="running"/>Marche</span><span><i className="stopped"/>Arrêt</span><span><i className="unknown"/>Sans relevé</span></div>
    {lanes.map(id=><Lane key={id} name={names[id]} spans={operation?.pumps?.[id]||[]} from={from} to={to} cursor={cursor} onSelect={onSelect}/>)}
    <div className="pump-axis"><span/>{Array.from({length:5},(_,i)=><time key={i}>{dateLabel(new Date(from+(to-from)*i/4).toISOString(),{...(to-from>86400000?{day:'2-digit',month:'short'}:{}),hour:'2-digit',minute:'2-digit'})}</time>)}</div>
    <p className="small-note">Le dernier état déclaré est prolongé entre des relevés rapprochés. Les interruptions restent grisées ; les horaires ne donnent pas l’instant exact d’une commutation.</p>
  </div>;
}
