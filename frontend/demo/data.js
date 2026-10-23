// Fictional data for the public demo only. Never imported into the production build.
const parisDay = (date) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
export function createDemoData(now = new Date()) {
  const instant = now.toISOString();
  const today = parisDay(now);
  const circuits = {
    hk1: { name: 'Chambres', temperature: 20.8, setpoint: '21.0 °C', status: 'Mode confort actif', pump: true, flow: 34.6 },
    hk2: { name: 'Plancher', temperature: 20.1, setpoint: '20.5 °C', status: 'Mode confort actif', pump: true, flow: 31.2 },
    ww1: { name: 'ECS', temperature: 52.4, setpoint: '48.0 °C', status: 'Température souhaitée atteinte', pump: false, minimum: 48, maximum: 60 },
  };
  const history = Array.from({ length: 144 }, (_, i) => ({
    ts: new Date(+now - (143-i)*600000).toISOString(), hk1: 20.3 + Math.sin(i/16)*0.5, hk2: 19.8 + Math.sin(i/20)*0.3,
    ww1: 48 + Math.sin(i/10)*5, outdoor: 11 + Math.sin(i/30)*3, modulation: 32 + Math.sin(i/13)*18, stock: 1500-i*0.2,
  }));
  const forecast = Array.from({ length: 4 }, (_, day) => {
    const date = new Date(`${today}T12:00:00Z`); date.setUTCDate(date.getUTCDate()+day);
    const calendar = date.toISOString().slice(0,10);
    return [8,12,18].map((hour, index) => ({ date: `${calendar} ${String(hour).padStart(2,'0')}:00`, day: calendar, hour,
      temp: String([13,15,11,14][day] + [0,2,-1][index]), wind: `${[8,12,7,10][day]} km/h`,
      condition: ['Peu nuageux','Ciel dégagé','Nuageux','Partiellement nuageux'][day], is_current: day===0 && index===0,
    }));
  }).flat();
  const monthly = Array.from({ length: Number(today.slice(5,7)) }, (_, i) => ({ year: Number(today.slice(0,4)), month: i+1, kg: [320,270,221,154,72,35,23,29,86,180,260,310][i] }));
  return {
    snapshot: { version:'3.0.1', demo:true, timezone:'Europe/Paris', configured:true, connected:true, stale:false, last_seen:instant, poll_seconds:60,
      boiler:{ temperature:64.2, modulation:36, flame:312, airflow:42, pressure:78, pump:40, runtime:18437, starts:4218, average_runtime:47, status:'Chauffage actif|Fonctionnement modulant' },
      outdoor:12.8, circuits, pellets:{stock:1470,capacity:2200,today:8.4,yesterday:10.2},
    },
    history,
    weather:{current_day:today,reference_day:today,timezone:'Europe/Paris',current:{Lever:'07:52',Coucher:'18:27'},forecast},
    transitions: ['hk1','pe1','hk2','ww1'].map((circuit,i)=>({ ts:new Date(+now-i*900000).toISOString(), circuit, kind:i===3?'pump':'status0', before:'Mode réduit', after:i===3?'0':'Mode confort' })),
    pellets:{monthly,refills:[{date:new Date(+now-30*86400000).toISOString(),kg:2000,supplier:'Fournisseur de démonstration',kind:'Vrac',note:'Recharge fictive'}]},
    system:{version:'3.0.1',timezone:'Europe/Paris',sqlite:true,measurements:184320,files:128,nas_configured:true,nas_mounted:true,import_active:false,import_minutes:60,
      runs:Array.from({length:25},(_,i)=>({id:25-i,at:new Date(+now-i*3600000).toISOString(),time_known:true,source:i%2?'CSV · Démo':'JSON · Démo',read:1440,added:i?1440:1420,duplicates:i?0:20,error:''})),
    },
  };
}
