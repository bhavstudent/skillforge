import "../styles/calendar.css";

export default function Calender() {
  return (
    <div className="calendar">
      <h2>This Month</h2>
      <div className="calendar-grid">
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className="day">{i + 1}</div>
        ))}
      </div>
    </div>
  );
}