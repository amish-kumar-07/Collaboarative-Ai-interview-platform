'use client';

import { useState } from "react";
import { AceEditor } from "./components/aceeditor";
import { QuestionDisplay } from "./components/quesdisplay";
import { OutputConsole } from "./components/console"; // Ensure OutputConsole is imported
import { selectRandomQuestion } from "../app/utils/selectquestion";
import { handlerun } from "../../api/handlerun";

export default function Home() {
  const [question, setQuestion] = useState(selectRandomQuestion());
  const [status, setStatus] = useState(null); // State for storing the result of the code execution

  const handleRunClick = async () => {
    try {
      const result = await handlerun(question.id);
      setStatus(result); // Set the status after the code execution result
    } catch (error) {
      console.error("Error running code:", error);
      setStatus("rejected"); // In case of an error, show "rejected"
    }
  };

  return (
    <div className="bg-gray-950 min-h-screen flex flex-col">
      <div className="flex justify-between items-center p-2 bg-gray-950 border-b border-gray-800">
        <div className="text-white">Room: coding-session-123</div>
        <div className="text-green-400">3 Users Online</div>
      </div>

      <div className="flex flex-1 gap-4">
        <div className="w-3/4 flex flex-col gap-4 p-4">
          <QuestionDisplay id={question.id} />

          <AceEditor 
            defaultValue="Start coding here..." 
            onCodeChange={(newCode) => console.log("Code changed:", newCode)}
          />

          <div className="flex gap-2">
            <button
              className="bg-green-500 hover:bg-green-600 text-white py-1 px-4 rounded text-sm"
              onClick={handleRunClick} // When clicked, call handleRunClick
            >
              Run
            </button>
            <button className="bg-gray-600 hover:bg-gray-700 text-white py-1 px-4 rounded text-sm">
              Pass Control
            </button>
          </div>

          <div className="p-2 bg-gray-900 rounded">
            <div className="text-gray-300 text-xs">Output Console</div>
            {/* Dynamically display output based on status */}
            <OutputConsole status={status} />
          </div>
        </div>

        <div className="w-1/4 bg-gray-900">{/* Video placeholder */}</div>
      </div>
    </div>
  );
}
