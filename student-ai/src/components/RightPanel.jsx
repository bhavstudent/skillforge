import { useState } from "react";
import "../styles/rightpanel.css";

const COMPANIES = [
  "Google",
  "Amazon",
  "Microsoft",
  "Meta",
  "Apple",
  "Netflix",
  "Uber",
  "Adobe",
];

export default function RightPanel() {
  const today = new Date();

  const [view, setView] = useState("date");
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();

  const months = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"
  ];

  const years = Array.from({ length: 12 }, (_, i) => currentYear - 6 + i);

  return (
    <aside className="right-panel">
      
      {/* CALENDAR */}
      <div className="calendar-card">
        <div className="calendar-header">
          <button onClick={() => setView("month")}>{months[month]}</button>
          <button onClick={() => setView("year")}>{year}</button>
        </div>

      <div className={`calendar-view ${view}`}>

        {view === "date" && (
          <div className="calendar-grid fade-slide">
            {["S","M","T","W","T","F","S"].map((d, i) => (
              <div key={i} className="day-name">{d}</div>
            ))}

            {Array(startDay).fill("").map((_, i) => <div key={i} />)}

            {Array(daysInMonth).fill("").map((_, i) => {
              const day = i + 1;
              const isToday =
                day === currentDay &&
                month === currentMonth &&
                year === currentYear;

              return (
                <div
                  key={day}
                  className={`calendar-day ${isToday ? "today" : ""}`}
                >
                  {day}
                </div>
              );
            })}
          </div>
        )}

        {view === "month" && (
          <div className="calendar-box-grid fade-slide">
            {months.map((m, i) => (
              <div
                key={m}
                className="calendar-box"
                onClick={() => {
                  setMonth(i);
                  setView("date");
                }}
              >
                {m}
              </div>
            ))}
          </div>
        )}

        {view === "year" && (
          <div className="calendar-box-grid fade-slide">
            {years.map(y => (
              <div
                key={y}
                className="calendar-box"
                onClick={() => {
                  setYear(y);
                  setView("month");
                }}
              >
                {y}
              </div>
            ))}
          </div>
        )}
      </div>
      </div>

      {/* COMPANY SECTION */}
      <div className="company-card">
        <h3>Interview Companies</h3>

        <div className="company-list">
          {COMPANIES.map(name => (
            <div key={name} className="company-item">
              {name}
            </div>
          ))}

          <div className="company-placeholder">
            Problems will load from server
          </div>
        </div>
      </div>
    </aside>
  );
}
