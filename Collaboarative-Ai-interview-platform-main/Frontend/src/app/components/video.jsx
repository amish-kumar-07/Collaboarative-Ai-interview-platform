import { useState, useEffect, useRef } from 'react';
import socket from '../../socket';
import { createPeerConnection, initiateCall, handleIncomingCall, handleAnswer, handleIceCandidate,  
  setupIceCandidateHandler,
  setupTrackHandler
} from '../../Peer';

function Video() {
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [users, setUsers] = useState([]);
  const [roomId, setRoomId] = useState('');
  const [userName, setUserName] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const remoteSocketIdRef = useRef(null);
  const currentRoomRef = useRef(null);

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    const storedRoomId = localStorage.getItem('roomId');
    
    if (!storedName || !storedRoomId) {
      console.log("Error found");
      return;
    }
    
    setUserName(storedName);
    setRoomId(storedRoomId);
    currentRoomRef.current = storedRoomId;
    
    if (!socket.connected) {
      socket.connect();
    }

    socket.emit('join-room', { Name: storedName, roomId: storedRoomId });

    // Get user media (camera and microphone)
    setupLocalMedia();
    
    // Set up socket event listeners
    setupSocketListeners();
    
    // Cleanup on component unmount
    return () => {
      cleanupResources();
    };
  }, []);

  const setupLocalMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      localStreamRef.current = stream;
      
      // Ensure the video element is properly set up
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        // Ensure the video starts playing
        localVideoRef.current.play().catch(e => console.error('Error playing local video:', e));
      }
      
      setIsConnected(true);
      return stream;
    } catch (error) {
      console.error("Error accessing media devices:", error);
      alert("Failed to access camera and microphone. Please check your settings.");
      throw error;
    }
  };

  const setupSocketListeners = () => {
    socket.on('joined-room', ({ roomId, users: roomUsers }) => {
      console.log(`Successfully joined room: ${roomId}`);

      if (roomUsers && Array.isArray(roomUsers)) {
        setUsers(roomUsers);
      }
    });
    
    socket.on('user-joined', ({ Name, socketId }) => {
      console.log(`${Name} joined with socket ID: ${socketId}`);

      setUsers(prev => {
        const exists = prev.some(user => user.socketId === socketId);
        if (exists) return prev;
        return [...prev, { name: Name, socketId }];
      });
    });
    
    socket.on('incoming-call', async ({ from, offer, callerId }) => {
      console.log(`Incoming call from ${from}`);
      
      if (!peerConnectionRef.current) {
        const peerConnection = createPeerConnection(localStreamRef.current);
        peerConnectionRef.current = peerConnection;

        setupTrackHandler(peerConnection, (remoteStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
            remoteVideoRef.current.play().catch(e => console.error('Error playing remote video:', e));
          }
        });
        
        remoteSocketIdRef.current = callerId;
        setupIceCandidateHandler(peerConnection, callerId);
      }
      
      await handleIncomingCall(peerConnectionRef.current, offer, callerId);
      setIsCalling(true);
    });
    
    socket.on('answer-made', async ({ answer, answererId }) => {
      console.log('Call answered');
      remoteSocketIdRef.current = answererId;
      await handleAnswer(peerConnectionRef.current, answer);
      setIsCalling(true);
    });
    
    socket.on('ice-candidate', async ({ from, candidate }) => {
      if (peerConnectionRef.current) {
        await handleIceCandidate(peerConnectionRef.current, candidate);
      }
    });
    
    socket.on('user-disconnected', ({ socketId, name }) => {
      console.log(`${name} disconnected`);
      setUsers(prev => prev.filter(user => user.socketId !== socketId));
      
      if (remoteSocketIdRef.current === socketId) {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null;
        }
        
        if (peerConnectionRef.current) {
          peerConnectionRef.current.close();
          peerConnectionRef.current = null;
        }
        
        remoteSocketIdRef.current = null;
        setIsCalling(false);
      }
    });
    
    socket.on('connect', () => {
      console.log('Socket reconnected, rejoining room');
      if (currentRoomRef.current && userName) {
        socket.emit('join-room', { 
          Name: userName, 
          roomId: currentRoomRef.current 
        });
      }
    });
  };

  const callUser = async (socketId) => {
    try {
      setIsCalling(true);
      remoteSocketIdRef.current = socketId;
      
      if (!peerConnectionRef.current) {
        const peerConnection = createPeerConnection(localStreamRef.current);
        peerConnectionRef.current = peerConnection;
        
        setupTrackHandler(peerConnection, (remoteStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
            remoteVideoRef.current.play().catch(e => console.error('Error playing remote video:', e));
          }
        });
        
        setupIceCandidateHandler(peerConnection, socketId);
      }
      
      await initiateCall(socketId, peerConnectionRef.current);
    } catch (error) {
      console.error("Error calling user:", error);
      setIsCalling(false);
    }
  };

  const endCall = () => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    remoteSocketIdRef.current = null;
    setIsCalling(false);
  };
  /*
  const leaveRoom = () => {
    cleanupResources();
    localStorage.removeItem('userName');
    localStorage.removeItem('roomId');
    // Redirect to home page without using navigate
    window.location.href = '/';
  };*/

  const cleanupResources = () => {
    // Stop all tracks in local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    
    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    // Disconnect socket
    socket.disconnect();
    
    // Remove event listeners
    socket.off('user-joined');
    socket.off('incoming-call');
    socket.off('answer-made');
    socket.off('ice-candidate');
    socket.off('user-disconnected');
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        const isEnabled = !audioTracks[0].enabled;
        audioTracks[0].enabled = isEnabled;
        setIsAudioMuted(!isEnabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      if (videoTracks.length > 0) {
        const isEnabled = !videoTracks[0].enabled;
        videoTracks[0].enabled = isEnabled;
        setIsVideoOff(!isEnabled);
      }
    }
  };

  return (
    <div className="space-y-2">
    {/* Local Video */}
    <div className="bg-black rounded overflow-hidden aspect-video relative">
      <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
      <div className="absolute bottom-1 left-1 text-white text-xs bg-black bg-opacity-50 px-1 rounded">
        You ({userName})
      </div>
    </div>
  
    {/* Remote Video */}
    <div className="bg-gray-800 rounded overflow-hidden aspect-video relative">
      <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
      {remoteSocketIdRef.current ? (
        <div className="absolute bottom-1 left-1 text-white text-xs bg-black bg-opacity-50 px-1 rounded">
          {users.find(u => u.socketId === remoteSocketIdRef.current)?.name || 'Remote User'}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full text-white text-sm">No one connected</div>
      )}
    </div>
  
    {/* Controls */}
    <div className="flex flex-wrap gap-2 justify-center">
      <button onClick={toggleMute} className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded">
      Disable Mute
      </button>
      <button onClick={toggleVideo} className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded">
        Disable Video
      </button>
      {remoteSocketIdRef.current && (
        <button onClick={endCall} className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded">
          End Call
        </button>
      )}
    </div>
  
    {/* Users List */}
    <div className="bg-white text-gray-800 rounded p-2 text-sm">
      <p>You: {userName} (Room ID: {roomId})</p>
      {users.length === 0 ? (
        <p className="text-gray-500 mt-1">No other users in the room</p>
      ) : (
        <ul className="mt-1 space-y-1">
          {users.map(user => (
            <li key={user.socketId} className="flex justify-between items-center bg-gray-100 p-1 rounded">
              <span>{user.name}</span>
              {!isCalling && user.socketId !== remoteSocketIdRef.current && (
                <button
                  onClick={() => callUser(user.socketId)}
                  className="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-0.5 rounded"
                >
                  Call
                </button>
              )}
              {user.socketId === remoteSocketIdRef.current && (
                <span className="text-green-600 text-xs bg-green-100 px-2 py-0.5 rounded">Connected</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
  );
}

export default Video;