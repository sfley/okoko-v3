import { parseForecastDate, forecastNumber, windLabel } from "../weather-data";
import React from "react";
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  ChevronRight,
  Cloud,
  Clock3,
  Flame,
  Leaf,
  Radio,
  Sun,
  Thermometer,
  Wind,
} from "lucide-react";
import {
  Badge,
  BoilerVisual,
  Empty,
  KeyValue,
  Metric,
  Pump,
  StatusText,
  WeatherIcon,
} from "./UI";
import { pageHref } from "../mode";
import { circuitLabels, eventLabel, eventValue, journalData } from "../journal";
import { ErrorNotice } from "./UI";
import { dateLabel, value } from "../api";
export function BoilerWidget({ snapshot: s }) {
  const b = s?.boiler || {};
  return (
    <div className="boiler-widget">
      <div className="boiler-info">
        <Badge tone={s?.connected ? "green" : "muted"} dot>
          {s?.demo ? "Chaudière simulée" : s?.connected ? "Collecte active" : "En attente"}
        </Badge>
        <div className="boiler-reading">
          {value(b.temperature)}
          <span>°C</span>
        </div>
        <StatusText text={b.status} />
        <div className="boiler-bottom">
          <div>
            <span>Modulation</span>
            <strong>
              {value(b.modulation, 0)} <small>%</small>
            </strong>
          </div>
          <div>
            <span>Foyer</span>
            <strong>
              {value(b.flame, 0)} <small>°C</small>
            </strong>
          </div>
        </div>
      </div>
      <BoilerVisual active={s?.connected && b.modulation > 0} />
    </div>
  );
}
export function CircuitWidget({ snapshot, circuit, detailed = false }) {
  const c = snapshot?.circuits?.[circuit] || {};
  return (
    <div className="circuit-widget">
      <div className="circuit-reading">
        <div><span className="circuit-measure-label">{circuit === "ww1" ? "Sonde haute du ballon" : "Température ambiante"}</span><div className="big-reading">
          {value(c.temperature)}
          <small>°C</small>
        </div></div>
        <span className={`circuit-symbol ${circuit}`}>
          <Thermometer size={28} strokeWidth={1.2} />
        </span>
      </div>
      <div className="setpoint">
        <span>
          {circuit === "ww1" ? "Minimum programmé" : "Consigne programmée"}
        </span>
        <strong>{c.setpoint || "—"}</strong>
      </div>
      {typeof c.flow === 'number' && <div className="circuit-flow"><span>Départ du circuit</span><strong>{value(c.flow)} °C</strong></div>}
      {circuit === "ww1" && typeof c.temperature_low === 'number' && !detailed && <div className="circuit-flow"><span>Sonde basse du ballon</span><strong>{value(c.temperature_low)} °C</strong></div>}
      <div className="circuit-footer">
        <Pump on={c.pump} />
        <span>{c.status?.split("|")[0] || "Mode inconnu"}</span>
      </div>
      {detailed && (
        <div className="detail-rows">
          {c.status?.includes("|") && <StatusText text={c.status.split("|").slice(1).join("|")} />}
          {typeof c.flow_setpoint === 'number' && <KeyValue label="Départ demandé">{value(c.flow_setpoint)} °C</KeyValue>}
          {circuit === "ww1" && <>
            {typeof c.temperature_low === 'number' && <KeyValue label="Sonde basse du ballon">{value(c.temperature_low)} °C</KeyValue>}
            {typeof c.maximum === 'number' && <KeyValue label="Maximum programmé">{value(c.maximum)} °C</KeyValue>}
            {typeof c.flow !== "number" && <p className="small-note">Le JSON de cette installation ne fournit pas de température de départ ECS.</p>}
          </>}
        </div>
      )}
    </div>
  );
}
export function PelletGauge({ stock, capacity }) {
  const percent =
    typeof stock === "number" && typeof capacity === "number" && capacity > 0
      ? Math.min(100, Math.max(0, (stock / capacity) * 100))
      : null;
  return (
    <div className="pellet-gauge">
      <svg
        viewBox="0 0 230 145"
        aria-label={
          percent === null
            ? "Niveau inconnu"
            : `Niveau ${Math.round(percent)} pour cent`
        }
        role="img"
      >
        <path
          d="M26 119a89 89 0 0 1 178 0"
          fill="none"
          stroke="#23323b"
          strokeWidth="14"
          strokeLinecap="round"
        />
        {percent !== null && (
          <path
            d="M26 119a89 89 0 0 1 178 0"
            pathLength="100"
            fill="none"
            stroke={percent < 20 ? "#e78076" : "#61bbb0"}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${percent} 100`}
          />
        )}
        <text
          x="115"
          y="102"
          textAnchor="middle"
          fill="#edf1f2"
          fontSize="32"
          fontWeight="500"
        >
          {value(stock, 0)}
        </text>
        <text x="115" y="123" textAnchor="middle" fill="#90a4af" fontSize="11">
          kg disponibles
        </text>
      </svg>
      <span className="gauge-caption">
        {percent === null
          ? "Capacité non renseignée"
          : `${Math.round(percent)} % du silo · ${value(capacity, 0)} kg`}
      </span>
    </div>
  );
}
export function PelletsWidget({ snapshot }) {
  const p = snapshot?.pellets || {};
  return (
    <div className="pellets-widget">
      <PelletGauge stock={p.stock} capacity={p.capacity} />
      <div className="pellet-today">
        <span>
          <Leaf size={15} /> Aujourd’hui
        </span>
        <strong>
          {value(p.today)} <small>kg</small>
        </strong>
      </div>
    </div>
  );
}
export function WeatherWidget({ weather, snapshot }) {
  const today = parseForecastDate(weather?.current_day)?.date || new Date();
  const dayKey = d => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  const days = Array.from({length:4},(_,i)=>{
    const date=new Date(today);date.setDate(date.getDate()+i);
    const forecast=weather?.forecast?.find(f=>{const parsed=parseForecastDate(f.date);return parsed&&dayKey(parsed.date)===dayKey(date);});
    return {date,forecast};
  });
  const current=days[0].forecast;
  const number=forecastNumber(current?.temp);
  return <div className="weather-widget weather-four-days">
    <div className="weather-now"><WeatherIcon condition={current?.condition} size={43}/><div className="big-reading">{value(number!==null?number:snapshot?.outdoor)}<small>°C</small></div></div>
    <strong>{current?.condition || 'Prévisions en attente'}</strong>
    <div className="widget-forecast" aria-label="Météo sur quatre jours">
      {days.map(({date,forecast},i)=><div key={i} className="widget-forecast-day">
        <span>{i===0?'Auj.':date.toLocaleDateString('fr-FR',{weekday:'short'})}</span>
        {forecast?<><WeatherIcon condition={forecast.condition} size={20}/><strong>{value(forecastNumber(forecast.temp))}°</strong></>:<span className="forecast-unavailable" title="Prévision indisponible">—</span>}
      </div>)}
    </div>
    <a className="text-link widget-weather-link" href={pageHref('/meteo')}>Prévisions détaillées <ChevronRight size={13}/></a>
  </div>;
}
export function ActivityWidget({ data, snapshot, error, retry }) {
  const journal=journalData(data), names=circuitLabels(snapshot);
  return <div className="installation-journal-widget">
    <ErrorNotice error={error} retry={retry}/>
    {journal.events.length?<ol className="journal-preview">
      {journal.events.slice(0,5).map((event,i)=><li key={event.id || `${event.ts}-${i}`}>
        <span className={`activity-dot ${event.circuit}`}/>
        <div className="journal-event-content"><div className="journal-event-heading"><strong>{names[event.circuit] || event.circuit}</strong><span>{eventLabel(event)}</span></div>
          <p><span>{eventValue(event,event.before)}</span><ArrowUpRight size={13}/><strong>{eventValue(event,event.after)}</strong></p>
        </div>
        <time dateTime={event.ts}>{dateLabel(event.ts,{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}</time>
      </li>)}
    </ol>:!error&&<Empty compact title="Aucun changement observé">Les prochains changements de mode et de pompe apparaîtront ici.</Empty>}
    <div className="journal-widget-footer"><span>Changements observés lors des lectures</span><a className="text-link" href={pageHref('/analyse')}>Ouvrir le journal <ChevronRight size={14}/></a></div>
  </div>;
}
