import React, { useId } from "react";
import "./LimitRing.css";

interface LimitRingProps {
  /** 0–100; 100-dən çox olsa da tam dairə çəkilir. */
  percent: number;
  colors: [from: string, to: string];
  size?: number;
  stroke?: number;
  children?: React.ReactNode;
}

/** Nazik, yumru uclu limit halqası (Smart Customs üslubu). */
const LimitRing: React.FC<LimitRingProps> = ({ percent, colors, size = 168, stroke = 12, children }) => {
  // React useId ":r1:" kimi id verir; SVG url(#...) üçün iki nöqtələri çıxarırıq.
  const gradientId = `ring${useId().replace(/:/g, "")}`;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (Math.min(100, Math.max(0, percent)) / 100) * circumference;
  const center = size / 2;

  return (
    <div className="limit-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors[0]} />
            <stop offset="100%" stopColor={colors[1]} />
          </linearGradient>
        </defs>
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#f1f1f4" strokeWidth={stroke} />
        {filled > 0 && (
          <circle
            className="limit-ring__value"
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circumference}`}
            transform={`rotate(-90 ${center} ${center})`}
          />
        )}
      </svg>
      <div className="limit-ring__center">{children}</div>
    </div>
  );
};

export default LimitRing;
