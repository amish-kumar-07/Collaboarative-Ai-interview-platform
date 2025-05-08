import socket from "./socket";


const peerConfig = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" }
  ]
};


export function createPeerConnection(localStream) {
  const peer = new RTCPeerConnection(peerConfig);
  
  if (localStream) {
    localStream.getTracks().forEach(track => {
      peer.addTrack(track, localStream);
    });
  }
  
  return peer;
}

export async function initiateCall(targetSocketId, peerConnection) {
  try {
  
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    
    socket.emit("call-user", {
      to: targetSocketId,
      offer: peerConnection.localDescription
    });
  } catch (error) {
    console.error("Error initiating call:", error);
  }
}

export async function handleIncomingCall(peerConnection, offer, callerId) {
  try {
   
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    
    socket.emit("make-answer", {
      to: callerId,
      answer: peerConnection.localDescription
    });
  } catch (error) {
    console.error("Error handling incoming call:", error);
  }
}

export async function handleAnswer(peerConnection, answer) {
  try {
    if (!peerConnection.currentRemoteDescription) {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    }
  } catch (error) {
    console.error("Error handling answer:", error);
  }
}

export async function handleIceCandidate(peerConnection, candidate) {
  try {
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  } catch (error) {
    console.error("Error adding ICE candidate:", error);
  }
}

export function setupIceCandidateHandler(peerConnection, targetSocketId) {
  peerConnection.onicecandidate = (event) => {
    if (event.candidate && targetSocketId) {
      socket.emit("ice-candidate", {
        to: targetSocketId,
        candidate: event.candidate
      });
    }
  };
}

export function setupTrackHandler(peerConnection, onTrackCallback) {
  peerConnection.ontrack = (event) => {
    if (typeof onTrackCallback === 'function') {
      onTrackCallback(event.streams[0]);
    }
  };
}