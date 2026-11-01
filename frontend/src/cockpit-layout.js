export const LIBRARY = [
  {id:'boiler',name:'Chaudière',sub:'Température et état de fonctionnement',w:6,h:4},
  {id:'pellets',name:'Réserve de pellets',sub:'Un œil sur votre silo',w:3,h:4},
  {id:'weather',name:'Météo',sub:'Aujourd’hui et les trois prochains jours',w:3,h:4},
  {id:'hk1',name:'Circuit HK1',sub:'Température, consigne et pompe',w:4,h:3},
  {id:'hk2',name:'Circuit HK2',sub:'Température, consigne et pompe',w:4,h:3},
  {id:'ecs',name:'Eau chaude',sub:'Ballon sanitaire et température programmée',w:4,h:3},
  {id:'activity',name:'Journal de l’installation',sub:'Les cinq derniers changements observés',w:12,h:6},
  {id:'temperatures',name:'Températures',sub:'Historique CSV · module facultatif',w:8,h:4},
];
const currentIds=['boiler','pellets','weather','hk1','hk2','ecs','activity'];
const oldIds=['boiler','pellets','weather','hk1','hk2','ecs','temperatures','activity'];
function layouts(legacy=false) {
  const ids=legacy?oldIds:currentIds;
  const lg=[{i:'boiler',x:0,y:0,w:6,h:4},{i:'pellets',x:6,y:0,w:3,h:4},{i:'weather',x:9,y:0,w:3,h:4},
    {i:'hk1',x:0,y:4,w:4,h:3},{i:'hk2',x:4,y:4,w:4,h:3},{i:'ecs',x:8,y:4,w:4,h:3},
    ...(legacy?[{i:'temperatures',x:0,y:7,w:8,h:4},{i:'activity',x:8,y:7,w:4,h:4}]:[{i:'activity',x:0,y:7,w:12,h:6}])];
  const bounds=(rows,minW)=>rows.map(row=>({...row,minW,minH:3,maxH:7}));
  const make=columns=>{
    if(columns===1) {
      let y=0;return ids.map(id=>{const item=LIBRARY.find(i=>i.id===id);const h=legacy&&id==='activity'?4:item.h;const row={i:id,x:0,y,w:1,h,minW:1,minH:3,maxH:7};y+=h;return row;});
    }
    const half=columns/2;
    return bounds([{i:'boiler',x:0,y:0,w:columns,h:4},{i:'pellets',x:0,y:4,w:half,h:4},{i:'weather',x:half,y:4,w:half,h:4},
      {i:'hk1',x:0,y:8,w:half,h:3},{i:'hk2',x:half,y:8,w:half,h:3},{i:'ecs',x:0,y:11,w:columns,h:3},
      ...(legacy?[{i:'temperatures',x:0,y:14,w:columns,h:4},{i:'activity',x:0,y:18,w:columns,h:3}]:[{i:'activity',x:0,y:14,w:columns,h:6}])],columns===2?1:2);
  };
  return {lg:bounds(lg,2),md:make(6),sm:make(2),xs:make(1)};
}
export const defaultConfig=()=>({ids:[...currentIds],layouts:layouts()});
const coordinates=rows=>(rows||[]).map(({i,x,y,w,h})=>({i,x,y,w,h})).sort((a,b)=>a.i.localeCompare(b.i));
export function readCockpitConfig(storage,key) {
  try {
    const raw=storage.getItem(key), saved=JSON.parse(raw);
    if(![1,2].includes(saved?.version)||!Array.isArray(saved.ids)||new Set(saved.ids).size!==saved.ids.length||!saved.layouts||typeof saved.layouts!=='object') return defaultConfig();
    const allowed=new Set([...LIBRARY.map(i=>i.id),'modulation','system']);
    if(!saved.ids.every(id=>allowed.has(id))) return defaultConfig();
    const legacy=layouts(true);
    const originalDefault=saved.version===1 && JSON.stringify(saved.ids)===JSON.stringify(oldIds) && Object.keys(legacy).every(bp=>JSON.stringify(coordinates(saved.layouts[bp]))===JSON.stringify(coordinates(legacy[bp])));
    const ids=saved.ids.filter(id=>LIBRARY.some(i=>i.id===id));
    if(originalDefault || ids.length!==saved.ids.length) {
      try {if(!storage.getItem(key+'.before-3.0.2'))storage.setItem(key+'.before-3.0.2',raw);}catch {}
      if(originalDefault)return defaultConfig();
    }
    const cleaned={};
    for(const [bp,rows] of Object.entries(saved.layouts)) {
      if(!['lg','md','sm','xs'].includes(bp)||!Array.isArray(rows))continue;
      cleaned[bp]=rows.filter(row=>row && ids.includes(row.i) && ['x','y','w','h'].every(k=>Number.isFinite(row[k])&&row[k]>=0) && row.w>=1 && row.h>=3)
        .map(row=>({...row,minW:bp==='xs'||bp==='sm'?1:2,minH:3,maxH:7}));
      if(new Set(cleaned[bp].map(r=>r.i)).size!==cleaned[bp].length)return defaultConfig();
    }
    if(cleaned.lg?.length!==ids.length)return defaultConfig();
    if(saved.ids.length!==ids.length && !ids.includes('activity')) {
      ids.push('activity');
      for(const [bp,rows] of Object.entries(cleaned))rows.push({i:'activity',x:0,y:Math.max(0,...rows.map(r=>r.y+r.h)),w:{lg:12,md:6,sm:2,xs:1}[bp],h:6,minW:bp==='xs'?1:2,minH:3,maxH:7});
    }
    return {ids,layouts:cleaned};
  } catch {return defaultConfig();}
}
