import React from "react";

export default function SideItem({ label, icon, active, onClick }) {
  const isActive = active === label;
  return (
    <button
      onClick={() => onClick(label)}
      className={[
        "flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold transition",
        isActive
          ? "bg-blue-600 text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-50",
      ].join(" ")}
    >
      <span className="text-base">{icon}</span>
      {label}
    </button>
  );
}

