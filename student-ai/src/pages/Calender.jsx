import { useContext } from "react";
import { UserContext } from "../context/UserContext";
import "../styles/calendar.css"

export default function Calender() {
    const { user } = useContext(UserContext);

    if(!user) {
        return (
            <div className="empty-calendar">
                <h2>No Activity Yet 📅</h2>
                <p>Your Study Streak will appear here</p>
            </div>
        );
    }

    return(
        <div className="calendar">
            <h2>This Month</h2>

            <div className="calendar-grid">
                {Array.from({ length:30}).map((_,i) => (
                    <div key={i} className="day">
                        {i + 1}
                    </div>
                ))}
            </div>
        </div>
    );
}