'use client';

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AceEditor } from "../components/aceeditor";
import { QuestionDisplay } from "../components/quesdisplay";
import { selectRandomQuestion } from "../utils/selectquestion";
import { handlerun } from "../../../api/handlerun";
import Video from "../components/video";

export default function Home() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId") || "N/A";
  const name = searchParams.get("name") || "Anonymous";
  
  const [question, setQuestion] = useState(selectRandomQuestion());

  useEffect(() => {
    try {
      console.log(`User ${name} joined room ${roomId}`);
      localStorage.setItem('userName', name);
      localStorage.setItem('roomId', roomId);
    } catch (err) {
      console.error("Error in page initialization:", err);
    }
  }, [name, roomId]);

  return (
    <div className="bg-gray-950 min-h-screen flex flex-col">
      <div className="flex justify-between items-center p-2 bg-gray-950 border-b border-gray-800">
        <div className="text-white">Room: {roomId}</div>
        <div className="text-green-400">User: {name}</div>
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
              onClick={() => {
                try {
                  handlerun(question.id);
                } catch (err) {
                  console.log(`Failed to run code: ${err.message}`);
                }
              }}
            >
              Run
            </button>
            <button 
              className="bg-gray-600 hover:bg-gray-700 text-white py-1 px-4 rounded text-sm"
              onClick={() => {
                try {
                  console.log("Pass control functionality to be implemented");
                } catch (err) {
                  console.log(`Failed to pass control: ${err.message}`);
                }
              }}
            >
              Pass Control
            </button>
          </div>

          <div className="p-2 bg-gray-900 rounded">
            <div className="text-gray-300 text-xs">Output Console</div>
            <div className="text-green-400 text-sm">/* Output will go here */</div>
          </div>
        </div>

        <div className="w-1/4 bg-gray-900 p-2 flex flex-col gap-4 overflow-y-auto">
          <Video userName={name} roomId={roomId} />
        </div>
      </div>
    </div>
  );
}