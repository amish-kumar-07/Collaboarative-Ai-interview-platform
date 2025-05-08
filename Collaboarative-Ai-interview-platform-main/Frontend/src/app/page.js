'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import socket from '../socket';

function Home() {
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [joined, setJoined] = useState(false);
  const [log, setLog] = useState([]);
  const router = useRouter();

  useEffect(() => {
    // Connect socket when component mounts
    socket.connect();

    // Event listeners for socket events
    socket.on('joined-room', ({ roomId }) => {
      setLog(prev => [...prev, `You joined room: ${roomId}`]);
      setJoined(true);
      // Store user info in localStorage for persistence across pages
      localStorage.setItem('userName', name);
      localStorage.setItem('roomId', roomId);
      // Navigate to video call page after successfully joining room
      navigate("/video-call");
    });

    socket.on('user-joined', ({ Name }) => {
      setLog(prev => [...prev, `${Name} has joined the room.`]);
    });

    // Cleanup event listeners when component unmounts
    return () => {
      socket.off('joined-room');
      socket.off('user-joined');
    };
  }, [router, name]);

  function handleJoinRoom() {
    if (!name.trim() || !roomId.trim()) {
      alert('Please enter both name and room number.');
      return;
    }

    socket.emit('join-room', { Name: name, roomId });
    router.push(`/room?roomId=${roomId}&name=${name}`);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-900">
      <div className="p-10 bg-white rounded-2xl shadow-lg w-full max-w-md border border-gray-200">
        <h1 className="text-3xl font-semibold mb-6 text-center text-gray-800">Join Room</h1>

        <div className="mb-5">
          <label className="block text-gray-700 font-medium mb-2">Your Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter your name"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">Room ID</label>
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter room ID"
          />
        </div>

        <button
          onClick={handleJoinRoom}
          className="w-full bg-indigo-600 text-white font-medium py-3 rounded-lg hover:bg-indigo-700 transition duration-300"
        >
          Join Room
        </button>

        {log.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
            <h3 className="font-medium text-gray-800 mb-2">Activity Log</h3>
            <ul className="space-y-1 text-sm text-gray-700">
              {log.map((entry, index) => (
                <li key={index}>• {entry}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
