"use client";

import { useEffect, useRef, useState } from "react";
import PeerConnection from "../utils/PeerConnection";
import { SignalMessage } from "../utils/types";

export default function Home() {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const [peer, setPeer] = useState<PeerConnection | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [localId, setLocalId] = useState<string>("");
  const [remoteId, setRemoteId] = useState<string>("");

  useEffect(() => {
    setLocalId(Math.floor(100000 + Math.random() * 900000).toString());

    const ws = new WebSocket("ws://localhost:8080/signal");
    ws.onmessage = async (event) => {
      const data: SignalMessage = JSON.parse(event.data);
      if (peer) {
        await peer.handleSignal(data);
      }
    };
    setSocket(ws);
  }, []);

  const startStream = async () => {
    try {
      if (!socket || !localId || !remoteId) {
        alert("Somethings missing");
        return;
      }

      const newPeer = new PeerConnection(
        localVideoRef,
        remoteVideoRef,
        socket,
        localId,
        remoteId
      );
      await newPeer.init();
      setPeer(newPeer);
    } catch (error) {
      console.log("Error:::", error);
      alert("Sorry we couldn't find camera or mic on your system");
    }
  };

  const callPeer = async () => {
    if (peer) {
      await peer.createOffer();
    } else {
      alert("Peer connection not set");
    }
  };

  const stopStream = async () => {
    try {
    } catch (error) {
      alert("Sorry we couldn't find camera or mic on your system");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white flex flex-col items-center justify-center px-6 py-10">
      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 drop-shadow-lg">
        Video Stream Interface
      </h1>
      <p className="text-lg text-gray-300 mb-8">
        Your ID:{" "}
        <span className="font-bold text-yellow-400 text-2xl">{localId}</span>
      </p>

      {/* Input */}
      <div className="flex items-center justify-center gap-2 mt-4 mb-4">
        <input
          type="text"
          placeholder="Enter Remote ID"
          value={remoteId}
          onChange={(e) => setRemoteId(e.target.value)}
          className="px-3 py-2 border border-gray-400 rounded-l-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          disabled={!peer}
          onClick={callPeer}
          className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl shadow-lg font-semibold transition transform hover:scale-105 disabled:opacity-50 cursor-pointer"
        >
          Call Remote ID
        </button>
      </div>

      {/* Video Containers */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-10 w-full max-w-6xl">
        <div className="w-full md:w-1/2 bg-gray-800 rounded-2xl overflow-hidden shadow-lg p-2 border border-gray-700 hover:scale-[1.02] transition">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            className="rounded-xl aspect-video w-full"
          />
        </div>
        <div className="w-full md:w-1/2 bg-gray-800 rounded-2xl overflow-hidden shadow-lg p-2 border border-gray-700 hover:scale-[1.02] transition">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="rounded-xl aspect-video w-full"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <button
          onClick={startStream}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl shadow-lg font-semibold transition transform hover:scale-105 cursor-pointer"
        >
          Start Streaming
        </button>

        <button
          onClick={stopStream}
          className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl shadow-lg font-semibold transition transform hover:scale-105 cursor-pointer"
        >
          Stop Streaming
        </button>
      </div>

      {/* Instructions */}
      <div className="text-sm text-gray-400 text-center mb-12">
        <p className="mb-1">
          1. Click{" "}
          <span className="text-blue-400 font-semibold">Start Streaming</span>
        </p>
        <p>2. Allow camera and microphone permissions</p>
      </div>

      {/* Footer */}
      <footer className="text-gray-500 text-xs">
        Made by <span className="text-white font-medium">Ritesh Macwan</span>
      </footer>
    </div>
  );
}
