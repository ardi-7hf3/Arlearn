import React, { useEffect, useState } from 'react';

export default function ProgressChart({ persentase }) {
  const [displayed, setDisplayed] = useState(0);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayed / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setDisplayed(persentase), 200);
    return () => clearTimeout(timer);
  }, [persentase]);

  const color = persentase >= 80 ? '#10B981' : persentase >= 60 ? '#F59E0B' : '#EF4444';
  const label = persentase >= 80 ? 'Luar Biasa!' : persentase >= 60 ? 'Cukup Baik' : 'Perlu Latihan';

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        <svg width="144" height="144" viewBox="0 0 144 144">
          {/* Track */}
          <circle cx="72" cy="72" r={radius} fill="none" stroke="#1E293B" strokeWidth="10" />
          {/* Progress */}
          <circle
            cx="72" cy="72" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="circle-progress circle-progress-bar"
            style={{ filter: `drop-shadow(0 0 8px ${color}80)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-black text-3xl" style={{ color }}>{Math.round(displayed)}</span>
          <span className="text-xs font-medium" style={{ color: '#64748B' }}>/ 100</span>
        </div>
      </div>
      <div className="mt-2 text-sm font-semibold" style={{ color }}>{label}</div>
    </div>
  );
}
