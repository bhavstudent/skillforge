import { useState } from "react";

export default function CodeEditor() {
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("javascript");

  const handleRun = () => {
    setOutput("Running...");
    setTimeout(() => {
      setOutput("Sample Output: 0,1");
    }, 800);
  };

  return (
    <div className="problem-right">

      <div className="editor-header">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
        </select>

        <button className= "run-btn" onClick={handleRun}>Run</button>
      </div>

      <textarea
        className="code-area"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Write your code here..."
      />

      <div className="output-box">
        {output}
      </div>

    </div>
  );
}
