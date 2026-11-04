import React, { useLayoutEffect, useRef, useState } from 'react';
import { timeTicks, tickLabel } from '../time-axis.js';
import { usePlotArea } from 'recharts';
import { dateLabel } from '../api';

export function useChartWidth() {
  const ref=useRef(null),[width,setWidth]=useState(800);
  useLayoutEffect(()=>{
    const element=ref.current;if(!element)return;
    const update=()=>setWidth(element.clientWidth);
    update();const observer=new ResizeObserver(update);observer.observe(element);
    return()=>observer.disconnect();
  });
  return [ref,width];
}

export function TimeTick({x,y,payload,domain,ticks}) {
  const label=tickLabel(payload.value,domain,ticks);
  return <text x={x} y={y+14} textAnchor="middle" fill="#9db0bf" fontSize={11} className="time-axis-tick">
    <tspan x={x}>{label.main}</tspan>{label.detail&&<tspan x={x} dy={15} fill="#778f9f" fontSize={10}>{label.detail}</tspan>}
  </text>;
}

export function timeAxisProps(domain,width) {
  const ticks=timeTicks(domain,width-64);
  return {dataKey:'_time',type:'number',scale:'time',domain,allowDataOverflow:true,
    ticks,interval:0,axisLine:false,tickLine:false,height:46,
    tick:<TimeTick domain={domain} ticks={ticks}/>};
}

export function TimeCursor({viewBox,at}) {
  const plot=usePlotArea();if(!plot||!viewBox)return null;
  const x=Math.max(plot.x+54,Math.min(plot.x+plot.width-54,viewBox.x)),y=plot.y+plot.height-28;
  return <g className="time-cursor-label" pointerEvents="none"><rect x={x-54} y={y-14} width={108} height={22} rx={5} fill="#263e4a" stroke="#63818e"/><text x={x} y={y+1} textAnchor="middle" fill="#e4f0f2" fontSize={10}>{dateLabel(new Date(at).toISOString(),{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}</text></g>;
}
