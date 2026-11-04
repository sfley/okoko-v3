import React, { useId, useState } from 'react';
import { Area, AreaChart, Line, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, usePlotArea } from 'recharts';
import { dateLabel, value } from '../api';
import { timeAxisProps, useChartWidth, TimeCursor } from './TimeAxis';

const stamp=at=>dateLabel(new Date(at).toISOString(),{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});

// The mask follows the raw state spans, independently of chart downsampling.
function PumpMask({id,spans,domain,color,onSelect}) {
  const plot=usePlotArea();if(!plot)return null;
  const x=at=>plot.x+(Math.max(domain[0],Math.min(domain[1],at))-domain[0])/(domain[1]-domain[0])*plot.width;
  const visible=spans.filter(span=>Date.parse(span.end)>=domain[0]&&Date.parse(span.start)<=domain[1]);
  return <g className="pump-state-overlay">
    <defs><clipPath id={id}>{visible.filter(span=>span.state===1).map((span,i)=><rect key={i} x={x(Date.parse(span.start))} y={plot.y} width={Math.max(1,x(Date.parse(span.end))-x(Date.parse(span.start)))} height={plot.height}/>)}</clipPath>
      <pattern id={`${id}-unknown`} width={6} height={6} patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width={3} height={6} fill="#9ab0c11a"/></pattern></defs>
    <rect x={plot.x} y={plot.y+plot.height-9} width={plot.width} height={8} fill={`url(#${id}-unknown)`}/>
    {visible.map((span,i)=>{
      const start=Date.parse(span.start),end=Date.parse(span.end),mid=Math.max(domain[0],start)+(Math.min(domain[1],end)-Math.max(domain[0],start))/2;
      const label=`${span.state===1?'En marche':'À l’arrêt'} · ${stamp(start)} → ${stamp(end)}`;
      return <rect key={i} className={`pump-segment ${span.state===1?'running':'stopped'}`} role="button" tabIndex={i===0?0:-1} aria-label={label}
        x={x(start)} y={plot.y+plot.height-9} width={Math.max(1,x(end)-x(start))} height={8} rx={1}
        fill={span.state===1?color:'#4a6073'} onClick={event=>{event.stopPropagation();onSelect?.(mid);}}
        onKeyDown={event=>{
          if(event.key==='Enter'||event.key===' '){event.preventDefault();event.stopPropagation();onSelect?.(mid);}
          if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) {
            event.preventDefault();event.stopPropagation();
            const next=event.key==='Home'?0:event.key==='End'?visible.length-1:Math.max(0,Math.min(visible.length-1,i+(event.key==='ArrowLeft'?-1:1)));
            event.currentTarget.parentElement.querySelectorAll('.pump-segment')[next]?.focus();
          }
        }}><title>{label}</title></rect>;
    })}
  </g>;
}

function PumpTooltip({active,payload,label,spans,field,waterLabel,roomField,roomName,roomVisible}) {
  if(!active||!payload?.length||!Number.isFinite(label))return null;
  const span=spans.findLast(span=>Date.parse(span.start)<=label&&Date.parse(span.end)>=label);
  const reading=payload[0]?.payload;
  const temperature=key=>typeof reading?.[key]==='number'?`${value(reading[key])} °C`:'Indisponible';
  return <div className="chart-tooltip pump-chart-tooltip"><strong>{stamp(label)}</strong><div><span>{span?(span.state===1?'Pompe en marche':'Pompe à l’arrêt'):'État de pompe inconnu'}</span></div><div><i style={{background:'#728b9c'}}/><span>{waterLabel}</span><b>{temperature(field)}</b></div>{roomField&&roomVisible&&<div><i style={{background:'#f0d4a0'}}/><span>Pièce · {roomName}</span><b>{temperature(roomField)}</b></div>}</div>;
}

export default function PumpChart({data=[],spans=[],field,domain,color,cursor,onSelect,waterLabel='Eau du circuit',roomField,roomName}) {
  const id=`pump-${useId().replaceAll(':','')}`,[ref,width]=useChartWidth();
  const [roomHidden,setRoomHidden]=useState(false);
  const rows=data.map(row=>({...row,_time:Date.parse(row.ts)}));
  const hasTemperature=rows.some(row=>typeof row[field]==='number');
  const hasRoom=Boolean(roomField)&&rows.some(row=>typeof row[roomField]==='number');
  return <>
    <div className="pump-chart-legend"><span><i style={{background:color}}/>{waterLabel} · pompe en marche</span>{roomField&&<button className="room-legend" aria-pressed={!roomHidden} disabled={!hasRoom} onClick={()=>setRoomHidden(hidden=>!hidden)}><i/>Pièce · {roomName}</button>}<span><i className="stopped"/>Pompe à l’arrêt</span><span><i className="unknown"/>Sans relevé</span><b>°C</b></div>
    {!hasTemperature&&<p className="pump-missing-temperature">{waterLabel} : température indisponible sur cette période.{hasRoom?' L’ambiance et l’état de la pompe restent visibles.':' Seul l’état de la pompe est représenté.'}</p>}
    {roomField&&!hasRoom&&<p className="pump-missing-room">Température de la pièce indisponible sur cette période.</p>}
    <div className="pump-chart-canvas chart-canvas" ref={ref}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <AreaChart data={rows} margin={{left:0,right:24,top:12,bottom:0}} onClick={event=>{if(typeof event?.activeLabel==='number')onSelect?.(event.activeLabel);}}>
          <defs><linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.55}/><stop offset="100%" stopColor={color} stopOpacity={0.10}/></linearGradient></defs>
          <CartesianGrid stroke="#24313d" strokeDasharray="3 5" vertical={false}/>
          <XAxis {...timeAxisProps(domain,width)}/>
          <YAxis width={42} domain={[0,max=>Math.max(60,Math.ceil(max/10)*10)]} axisLine={false} tickLine={false} tick={hasTemperature||(hasRoom&&!roomHidden)?{fill:'#9db0bf',fontSize:11}:false}/>
          <Tooltip filterNull={false} content={<PumpTooltip spans={spans} field={field} waterLabel={waterLabel} roomField={roomField} roomName={roomName} roomVisible={!roomHidden}/>} cursor={{stroke:'#647684',strokeDasharray:'3 3'}}/>
          {hasTemperature&&<Area dataKey={field} type="linear" name="Température mesurée" fill="none" stroke="#728b9c" strokeWidth={1.5} connectNulls={false} isAnimationActive={false} activeDot={false}/>}
          {hasTemperature&&<Area className="pump-thermal-area" dataKey={field} type="linear" name="Pompe en marche" fill={`url(#${id}-fill)`} stroke={color} strokeWidth={2.5} clipPath={`url(#${id})`} connectNulls={false} isAnimationActive={false} activeDot={false} tooltipType="none"/>}
          {hasRoom&&<Line className="pump-room-line" dataKey={roomField} name={`Pièce · ${roomName}`} type="linear" stroke="#f0d4a0" strokeWidth={2} strokeDasharray="5 4" dot={false} activeDot={{r:4,fill:'#f0d4a0',stroke:'#142430'}} hide={roomHidden} connectNulls={false} isAnimationActive={false}/>}
          <PumpMask id={id} spans={spans} domain={domain} color={color} onSelect={onSelect}/>
          {cursor!==null&&<ReferenceLine x={cursor} stroke="#abc7ce" strokeDasharray="4 4" label={<TimeCursor at={cursor}/>}/>}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </>;
}
