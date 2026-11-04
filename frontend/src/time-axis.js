const minute=60000,hour=60*minute,day=24*hour;
const steps=[5*minute,10*minute,15*minute,30*minute,hour,2*hour,3*hour,6*hour,12*hour,day,2*day,5*day,7*day,14*day];
const zone='Europe/Paris';
const clock=new Intl.DateTimeFormat('fr-FR',{timeZone:zone,hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
const date=new Intl.DateTimeFormat('fr-FR',{timeZone:zone,day:'2-digit',month:'short'});
const offsetFormat=new Intl.DateTimeFormat('en-US',{timeZone:zone,timeZoneName:'longOffset'});
function offset(at) {
  const part=offsetFormat.formatToParts(at).find(part=>part.type==='timeZoneName').value;
  const match=part.match(/GMT([+-])(\d{2}):(\d{2})/);
  return match?(match[1]==='-'?-1:1)*(Number(match[2])*60+Number(match[3]))*minute:0;
}
export function timeTicks(domain,width=800) {
  const [from,to]=domain||[];
  if(!Number.isFinite(from)||!Number.isFinite(to)||to<=from)return [];
  const count=Math.max(4,Math.min(10,Math.floor(width/95)));
  const step=steps.find(step=>step>=(to-from)/count)||14*day;
  const shift=offset(from),ticks=[];
  for(let rounded=Math.ceil((from+shift)/step)*step;rounded<=to+2*hour;rounded+=step) {
    const at=step>=day?rounded-offset(rounded):rounded-shift;
    if(at>=from&&at<=to&&!ticks.includes(at))ticks.push(at);
  }
  return ticks;
}
export function tickLabel(at,domain,ticks=[]) {
  const range=(domain?.[1]||0)-(domain?.[0]||0);
  const time=clock.format(at),dayLabel=date.format(at);
  if(range>2*day)return {main:dayLabel,detail:''};
  const repeated=ticks.some(other=>other!==at&&clock.format(other)===time&&date.format(other)===dayLabel);
  const zoneLabel=repeated?`UTC${offset(at)/hour>=0?'+':''}${offset(at)/hour}`:'';
  return {main:time,detail:range>=18*hour?`${dayLabel}${zoneLabel?' · '+zoneLabel:''}`:zoneLabel};
}
