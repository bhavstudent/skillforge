export default function VoiceInput({ setText }) {

    const startListening  = () => {

        if(!("webkitSpeechRecognition" in window)) {
            alert("Speech Recognition not supported");
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.lang = "en-IN";
        recognition.start();

        recognition.onresult = (event) => {

            setText(event.results[0][0].transcript);
        };
    };

    return <button onClick={startListening}>🎤 Speak</button>
}