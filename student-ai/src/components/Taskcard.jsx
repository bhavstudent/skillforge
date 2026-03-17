import "../styles/cards.css";

export default function TaskCard({ title, desc }) {

    return (
        <div className="task-card">
            <h2>{title}</h2>
            <p>{desc}</p>
            <button>Start</button>
        </div>
    );
}