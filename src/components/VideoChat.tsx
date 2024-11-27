import React, { useEffect, useRef } from 'react';
import { Camera, CameraOff, Mic, MicOff, SkipForward, X } from 'lucide-react';
import { Button } from './Button';
import { useVideoChat } from '../hooks/useVideoChat';
import { useChat } from '../hooks/useChat';
import { connectSocket, disconnectSocket } from '../lib/socket';

export function VideoChat() {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  const {
    localStream,
    remoteStream,
    isCameraOn,
    isMuted,
    initializeMedia,
    toggleCamera,
    toggleMute,
    cleanup
  } = useVideoChat();

  const { 
    isConnected,
    isFinding,
    strangerId,
    findStranger,
    nextStranger,
    leaveChat 
  } = useChat();

  useEffect(() => {
    connectSocket();
    initializeMedia().then(() => {
      findStranger('video');
    });

    return () => {
      cleanup();
      leaveChat();
      disconnectSocket();
    };
  }, []);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const handleNext = () => {
    cleanup();
    nextStranger();
    initializeMedia().then(() => {
      findStranger('video');
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <div className="bg-gray-800 shadow-md p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-200">
            {isFinding ? 'Finding a stranger...' : 
             strangerId ? 'Video Chat with Stranger' : 
             'Disconnected'}
          </h2>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              icon={isCameraOn ? Camera : CameraOff}
              onClick={toggleCamera}
              className="!py-2 !px-3 sm:!px-4"
            >
              <span className="hidden sm:inline">
                {isCameraOn ? 'Stop Camera' : 'Start Camera'}
              </span>
            </Button>
            <Button
              variant="secondary"
              icon={isMuted ? MicOff : Mic}
              onClick={toggleMute}
              className="!py-2 !px-3 sm:!px-4"
            >
              <span className="hidden sm:inline">
                {isMuted ? 'Unmute' : 'Mute'}
              </span>
            </Button>
            <Button
              variant="secondary"
              icon={SkipForward}
              onClick={handleNext}
              disabled={isFinding}
              className="!py-2 !px-3 sm:!px-4"
            >
              <span className="hidden sm:inline">Next</span>
            </Button>
            <Button
              variant="secondary"
              icon={X}
              onClick={() => window.location.href = '/'}
              className="!py-2 !px-3 sm:!px-4"
            >
              <span className="hidden sm:inline">Leave</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:grid md:grid-cols-2 overflow-hidden">
        <div className="relative h-[50vh] md:h-auto md:flex-1 bg-black">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-4 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
            Stranger
          </div>
        </div>

        <div className="relative h-[50vh] md:h-auto md:flex-1 bg-black">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-4 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
            You
          </div>
        </div>

        <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-2 bg-black bg-opacity-50 rounded-full p-2">
          <button
            onClick={toggleCamera}
            className="p-2 rounded-full hover:bg-gray-700"
          >
            {isCameraOn ? (
              <Camera className="w-6 h-6 text-white" />
            ) : (
              <CameraOff className="w-6 h-6 text-red-500" />
            )}
          </button>
          <button
            onClick={toggleMute}
            className="p-2 rounded-full hover:bg-gray-700"
          >
            {isMuted ? (
              <MicOff className="w-6 h-6 text-red-500" />
            ) : (
              <Mic className="w-6 h-6 text-white" />
            )}
          </button>
          <button
            onClick={handleNext}
            disabled={isFinding}
            className="p-2 rounded-full hover:bg-gray-700 disabled:opacity-50"
          >
            <SkipForward className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="p-2 rounded-full hover:bg-gray-700"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}