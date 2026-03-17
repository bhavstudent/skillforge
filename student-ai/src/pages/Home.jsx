import Calender from "./Calender";


export default function home() {
    const handleDaySelect  = (day) => {
        console.log("Selected Day:", day);
    };

    return(

    <div>
        <h1>Your Learning Calender</h1>
        <Calender onSelect = {handleDaySelect} />
    </div>
    );
}
