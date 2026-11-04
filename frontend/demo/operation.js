// Build a synthetic operating plot for the explicitly labelled demo and browser tests.
export function demoOperation(history,days=1,now=Date.now()) {
  const from=now-days*86400000,to=now,step=600000*days;
  const points=history.filter((_,i)=>i<60||i>66).map((row,i,rows)=>({...row,ts:new Date(now-(143-history.indexOf(row))*step).toISOString()}));
  const pumps={hk1:[],hk2:[],ww1:[]};let previous=null;
  const chart=[];
  for(const point of points) {
    const at=Date.parse(point.ts),gap=previous&&at-Date.parse(previous.ts)>3*step;
    if(gap)chart.push({ts:new Date(Date.parse(previous.ts)+1).toISOString(),hk1:null,hk2:null,ww1:null,outdoor:null,modulation:null,hk1_flow:null,hk2_flow:null});
    chart.push(point);
    for(const id of Object.keys(pumps)) {
      const state=point[id+'_pump'];if(state!==0&&state!==1)continue;
      const list=pumps[id],last=list.at(-1);
      if(last&&!gap&&last.state===state)last.end=point.ts;
      else {if(last&&!gap)last.end=point.ts;list.push({start:point.ts,end:point.ts,state});}
    }
    previous=point;
  }
  return {from:new Date(from).toISOString(),to:new Date(to).toISOString(),points:chart,pumps,pump_limited:false,points_limited:false,sources:{json:true,csv:false},timezone:'Europe/Paris'};
}
