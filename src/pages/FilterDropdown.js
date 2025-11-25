import React from "react";

export default function FilterDropdown({ label, value, options, onChange }) {
  return (
    <label className="filter">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt === "" ? "All" : opt}</option>
        ))}
      </select>
    </label>
  );
}
