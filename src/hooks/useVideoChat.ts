import { useEffect, useRef, useState } from 'react';
import { socket } from '../lib/socket';
import { useUserStore } from '../store/userStore';

export function useVideoChat() {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const { username } = useUserStore();

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      setIsCameraOn(true);
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      return null;
    }
  };

  const createPeerConnection = async () => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
      ],
    });

    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', { 
          candidate: event.candidate,
          to: peerConnection.current?.remoteDescription ? socket.id : undefined
        });
      }
    };

    peerConnection.current = pc;
    return pc;
  };

  const initiateCall = async (strangerId: string) => {
    const pc = await createPeerConnection();
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit('video-offer', { offer, to: strangerId });
  };

  const handleOffer = async (offer: RTCSessionDescriptionInit, from: string) => {
    const pc = await createPeerConnection();
    await pc.setRemoteDescription(offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.emit('video-answer', { answer, to: from });
  };

  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    if (peerConnection.current) {
      await peerConnection.current.setRemoteDescription(answer);
    }
  };

  const toggleCamera = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsCameraOn(!isCameraOn);
    }
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnection.current) {
      peerConnection.current.close();
    }
    setLocalStream(null);
    setRemoteStream(null);
    setIsCameraOn(false);
    setIsMuted(false);
  };

  useEffect(() => {
    socket.on('stranger-found', async ({ strangerId }) => {
      await initiateCall(strangerId);
    });

    socket.on('video-offer', async ({ offer, from }) => {
      await handleOffer(offer, from);
    });

    socket.on('video-answer', async ({ answer }) => {
      await handleAnswer(answer);
    });

    socket.on('ice-candidate', async ({ candidate }) => {
      if (peerConnection.current) {
        await peerConnection.current.addIceCandidate(candidate);
      }
    });

    return () => {
      socket.off('stranger-found');
      socket.off('video-offer');
      socket.off('video-answer');
      socket.off('ice-candidate');
      cleanup();
    };
  }, []);

  return {
    localStream,
    remoteStream,
    isCameraOn,
    isMuted,
    initializeMedia,
    toggleCamera,
    toggleMute,
    cleanup,
  };
}