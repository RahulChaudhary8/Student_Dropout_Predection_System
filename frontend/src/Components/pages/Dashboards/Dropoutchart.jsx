import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Box, Typography, Paper, Chip } from "@mui/material";

const data = [
  { name: "Low Risk", value: 300, icon: "🟢" },
  { name: "Medium Risk", value: 100, icon: "🟡" },
  { name: "High Risk", value: 50, icon: "🔴" },
];

const COLORS = ["#22c55e", "#f59e0b", "#ef4444"];
const LIGHT_COLORS = ["#dcfce7", "#fef3c7", "#fee2e2"];

const total = data.reduce((sum, d) => sum + d.value, 0);

/* ── Custom Tooltip ── */
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0].payload;
    const pct = ((value / total) * 100).toFixed(1);
    const color = COLORS[data.findIndex((d) => d.name === name)];
    return (
      <Paper
        elevation={4}
        sx={{
          px: 2,
          py: 1.5,
          borderRadius: 2,
          border: `2px solid ${color}`,
          minWidth: 140,
        }}
      >
        <Typography
          variant="caption"
          sx={{ color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}
        >
          {name}
        </Typography>
        <Typography variant="h6" sx={{ color, fontWeight: 700, lineHeight: 1.2 }}>
          {value} students
        </Typography>
        <Typography variant="body2" sx={{ color: "#94a3b8" }}>
          {pct}% of total
        </Typography>
      </Paper>
    );
  }
  return null;
};

/* ── Custom Legend ── */
const CustomLegend = ({ activeIndex, onHover }) => (
  <Box className="flex flex-col gap-2 mt-2">
    {data.map((entry, i) => {
      const pct = ((entry.value / total) * 100).toFixed(1);
      const isActive = activeIndex === i;
      return (
        <Box
          key={entry.name}
          onMouseEnter={() => onHover(i)}
          onMouseLeave={() => onHover(null)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            px: 1.5,
            py: 0.8,
            borderRadius: 2,
            cursor: "pointer",
            backgroundColor: isActive ? LIGHT_COLORS[i] : "transparent",
            border: `1.5px solid ${isActive ? COLORS[i] : "transparent"}`,
            transition: "all 0.2s ease",
          }}
        >
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: COLORS[i],
              flexShrink: 0,
              transform: isActive ? "scale(1.4)" : "scale(1)",
              transition: "transform 0.2s ease",
            }}
          />
          <Typography
            variant="body2"
            sx={{ color: "#334155", fontWeight: isActive ? 700 : 500, flex: 1 }}
          >
            {entry.icon} {entry.name}
          </Typography>
          <Chip
            label={`${pct}%`}
            size="small"
            sx={{
              backgroundColor: COLORS[i],
              color: "#fff",
              fontWeight: 700,
              fontSize: "0.7rem",
              height: 20,
            }}
          />
        </Box>
      );
    })}
  </Box>
);

/* ── Center Label ── */
const CenterLabel = ({ activeIndex }) => {
  const entry = activeIndex !== null ? data[activeIndex] : null;
  const color = entry ? COLORS[activeIndex] : "#1e293b";
  const label = entry ? entry.value : total;
  const sub = entry ? entry.name : "Total Students";

  return (
    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
      <tspan
        x="50%"
        dy="-0.4em"
        style={{ fontSize: 26, fontWeight: 700, fill: color, transition: "fill 0.3s" }}
      >
        {label}
      </tspan>
      <tspan
        x="50%"
        dy="1.5em"
        style={{ fontSize: 11, fill: "#94a3b8", fontWeight: 500 }}
      >
        {sub}
      </tspan>
    </text>
  );
};

/* ── Main Component ── */
const Dropoutchart = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: "1px solid #e2e8f0",
        backgroundColor: "#fff",
        maxWidth: 380,
      }}
    >
      {/* Header */}
      <Box className="mb-4">
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a", lineHeight: 1 }}>
          Dropout Risk
        </Typography>
        <Typography variant="caption" sx={{ color: "#94a3b8" }}>
          Student risk distribution
        </Typography>
      </Box>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={230}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={68}
            outerRadius={95}
            paddingAngle={3}
            dataKey="value"
            animationBegin={0}
            animationDuration={900}
            onMouseEnter={(_, i) => setActiveIndex(i)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            {data.map((_, i) => (
              <Cell
                key={i}
                fill={COLORS[i]}
                stroke={activeIndex === i ? COLORS[i] : "transparent"}
                strokeWidth={activeIndex === i ? 3 : 0}
                style={{
                  filter: activeIndex === i ? `drop-shadow(0 0 6px ${COLORS[i]}88)` : "none",
                  transform: activeIndex === i ? "scale(1.05)" : "scale(1)",
                  transformOrigin: "center",
                  transition: "all 0.25s ease",
                  cursor: "pointer",
                  opacity: activeIndex !== null && activeIndex !== i ? 0.55 : 1,
                }}
              />
            ))}
            <CenterLabel activeIndex={activeIndex} />
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <CustomLegend activeIndex={activeIndex} onHover={setActiveIndex} />
    </Paper>
  );
};

export default Dropoutchart;