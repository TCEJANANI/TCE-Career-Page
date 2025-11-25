import React from "react";
import "./Sidebar.css";

const MONTHS = [
  { n: 1, label: "Jan" }, { n: 2, label: "Feb" }, { n: 3, label: "Mar" },
  { n: 4, label: "Apr" }, { n: 5, label: "May" }, { n: 6, label: "Jun" },
  { n: 7, label: "Jul" }, { n: 8, label: "Aug" }, { n: 9, label: "Sep" },
  { n: 10, label: "Oct" }, { n: 11, label: "Nov" }, { n: 12, label: "Dec" },
];

export default function Sidebar({
  years,
  selectedYear,
  onSelectYear,
  selectedMonth,
  onSelectMonth,
  onExportZip,
  onLogout
}) {
  return (
    <aside className="admin-sidebar">
      <div className="brand">
        <img src="/tce_logo.jpeg" alt="TCE Logo" className="tce-logo" />
        <div className="brand-text">
          <h3>TCE Careers</h3>
          <span>Admin Console</span>
        </div>
      </div>

      <div className="side-section">
        <h4>Year</h4>
        <div className="year-list">
          {years?.length ? years.map(y => (
            <button
              key={y}
              className={`pill ${selectedYear === y ? "active" : ""}`}
              onClick={() => onSelectYear(y)}
            >
              {y}
            </button>
          )) : <div className="muted small">No years yet</div>}
        </div>
      </div>

      <div className="side-section">
        <h4>Month</h4>
        <div className="month-grid">
          {MONTHS.map(m => (
            <button
              key={m.n}
              className={`month ${selectedMonth === m.n ? "active" : ""}`}
              onClick={() => onSelectMonth(m.n)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="side-section">
        <button onClick={onExportZip} className="export-btn">
  Export Resumes (ZIP)
</button>


        <button onClick={onLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </aside>
  );
}
