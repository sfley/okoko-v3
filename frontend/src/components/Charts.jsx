import React, { useId, useState, useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Empty } from "./UI";
import { dateLabel, value } from "../api";
const colors = {
  hk1: "#5bbcb4",
  hk2: "#8e9af1",
  ww1: "#f6a665",
  outdoor: "#b2c9da",
  modulation: "#f6a665",
  stock: "#5bbcb4",
};
const names = {
  hk1: "HK1",
  hk2: "HK2",
  ww1: "Eau chaude",
  outdoor: "Extérieur",
  modulation: "Modulation",
  stock: "Stock",
};
function ChartTooltip({ active, payload, label, unit = "°C" }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <strong>
        {dateLabel(typeof label === "number" ? new Date(label).toISOString() : label, {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </strong>
      {payload.map((p) => (
        <div key={p.dataKey}>
          <i style={{ background: p.color }} />
          <span>{p.name}</span>
          <b>
            {value(p.value)} {unit}
          </b>
        </div>
      ))}
    </div>
  );
}
export function HistoryChart({
  data = [],
  keys = ["hk1", "hk2", "ww1", "outdoor"],
  snapshot,
  compact = false,
  unit = "°C",
  domain = ["auto", "auto"],
  timeDomain,
  cursorTime = null,
  onSelectTime,
}) {
  const [hidden, setHidden] = useState([]);
  const id = useId().replaceAll(":", "");
  const chartData = useMemo(() => data.map(row => ({...row,_time:Date.parse(row.ts)})).filter(row=>Number.isFinite(row._time)),[data]);
  const labels = { ...names, ...Object.fromEntries(Object.entries(snapshot?.circuits || {}).filter(([, c]) => c.name).map(([id, c]) => [id, c.name])) };
  if (!data.some((row) => keys.some((k) => typeof row[k] === "number")))
    return (
      <Empty compact={compact} title="L’historique prend forme ici">
        Les relevés disponibles alimenteront ce graphique.
      </Empty>
    );
  return (
    <div className={`history-chart ${compact ? "compact-chart" : ""}`}>
      <div className="chart-legend">
        {keys.map((k) => (
          <button
            key={k}
            aria-pressed={!hidden.includes(k)}
            onClick={() =>
              setHidden((h) =>
                h.includes(k) ? h.filter((x) => x !== k) : [...h, k],
              )
            }
          >
            <i style={{ background: colors[k] }} />
            {labels[k]}
          </button>
        ))}
        <span>{unit}</span>
      </div>
      <div className="chart-canvas">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <AreaChart
            data={chartData}
            onClick={event=>{if(typeof event?.activeLabel === 'number')onSelectTime?.(event.activeLabel);}}
            margin={{ left: -22, right: 10, top: 12, bottom: 0 }}
          >
            <defs>
              {keys.map((k) => (
                <linearGradient
                  key={k}
                  id={`${id}-${k}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={colors[k]} stopOpacity={0.13} />
                  <stop offset="100%" stopColor={colors[k]} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid
              stroke="#24313d"
              strokeDasharray="3 5"
              vertical={false}
            />
            <XAxis
              dataKey="_time"
              type="number"
              scale="time"
              domain={timeDomain || ['dataMin','dataMax']}
              axisLine={false}
              tickLine={false}
              minTickGap={45}
              tick={{ fill: "#8495a5", fontSize: 11 }}
              tickFormatter={(t) =>
                dateLabel(new Date(t).toISOString(), { hour: "2-digit", minute: "2-digit" })
              }
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#8495a5", fontSize: 11 }}
              domain={domain}
            />
            <Tooltip
              content={<ChartTooltip unit={unit} />}
              cursor={{ stroke: "#647684", strokeDasharray: "3 3" }}
            />
            {cursorTime !== null && <ReferenceLine x={cursorTime} stroke="#abc7ce" strokeDasharray="4 4" />}
            {keys.map((k) => (
              <Area
                key={k}
                type="monotone"
                dataKey={k}
                name={labels[k]}
                stroke={colors[k]}
                strokeWidth={2}
                fill={`url(#${id}-${k})`}
                hide={hidden.includes(k)}
                connectNulls={false}
                isAnimationActive={false}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
export function MonthlyChart({ rows = [], year }) {
  const months = [
    "Jan.",
    "Fév.",
    "Mars",
    "Avr.",
    "Mai",
    "Juin",
    "Juil.",
    "Août",
    "Sept.",
    "Oct.",
    "Nov.",
    "Déc.",
  ];
  const data = months.map((month, i) => ({
    month,
    kg:
      rows.find((r) => r.year === Number(year) && r.month === i + 1)?.kg ??
      null,
  }));
  if (!data.some((x) => x.kg !== null))
    return (
      <Empty title="Aucun bilan pour cette année">
        Sélectionnez une année disposant de mesures ou d’archives.
      </Empty>
    );
  return (
    <div className="monthly-chart">
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <BarChart
          data={data}
          margin={{ left: -15, top: 20, right: 12, bottom: 0 }}
        >
          <CartesianGrid
            stroke="#24313d"
            strokeDasharray="3 5"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tick={{ fill: "#94a4b3", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#8495a5", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "#ffffff05" }}
            contentStyle={{
              background: "#172430",
              border: "1px solid #344452",
              borderRadius: 12,
            }}
            formatter={(v) => [`${value(v)} kg`, "Consommation"]}
          />
          <Bar
            dataKey="kg"
            fill="#d9915f"
            radius={[5, 5, 0, 0]}
            maxBarSize={38}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
