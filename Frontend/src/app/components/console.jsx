import React, { useEffect, useState } from "react";

export function OutputConsole({ status }) {
  const [message, setMessage] = useState(null);

  useEffect(() => {
    // Check the status whenever it changes
    if (status.description == "Accepted") {
      setMessage( "✅ Code Accepted!");
    }
    if(status.description == "Processing"){
        setMessage( "✅ in process!");
    }
  }, [status]); // Re-run the effect when 'status' changes

  if (!message) return null;

  return (
    <div
      className={`mt-2 p-2 rounded text-white text-sm font-semibold ${
        status === "accepted" ? "bg-green-600" : "bg-red-600"
      }`}
    >
      {message}
    </div>
  );
}
