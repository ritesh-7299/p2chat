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
    const id = prompt("Enter your Id") || "";
    const remoteId = prompt("Enter remote Id") || "";
    setLocalId(id);
    setRemoteId(remoteId);

    const ws = new WebSocket("ws://localhost:8080/signal");
    ws.onmessage = async (event) => {
      const data: SignalMessage = JSON.parse(event.data);
      if (peer) {
        await peer.handleSignal(data);
      }
    };
    setSocket(ws);
  }, []);

  /**
   * Function to start a video stream
   */
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

  /**
   * Function to stop streaming
   */
  const stopStream = async () => {
    try {
    } catch (error) {
      alert("Sorry we couldn't find camera or mic on your system");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">
        Video Stream Interface
      </h1>

      <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-8 w-full max-w-5xl px-4">
        <div className="w-full md:w-1/2 flex justify-center">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            className="rounded-lg aspect-video w-full max-w-sm border border-gray-300 shadow-md"
          />
        </div>
        <div className="w-full md:w-1/2 flex justify-center">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="rounded-lg aspect-video w-full max-w-sm border border-gray-300 shadow-md"
          />
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={startStream}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow cursor-pointer"
        >
          Start Streaming
        </button>
        <button
          disabled={!peer}
          onClick={callPeer}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg shadow cursor-pointer"
        >
          Call remote id
        </button>
        <button
          onClick={stopStream}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg shadow cursor-pointer"
        >
          Stop Streaming
        </button>
      </div>
      <div className="text-sm text-gray-300 text-center mb-12">
        <p className="mb-2">
          1. Click on{" "}
          <span className="bg-gray-800 px-2 py-0.5 rounded text-white font-mono text-xs">
            Start Streaming
          </span>
        </p>
        <p>2. Allow camera and microphone permission</p>
      </div>

      {/* Footer */}
      <footer className="text-gray-500 text-xs">
        <p>
          Made by <span className="text-white font-medium">Ritesh Macwan</span>
        </p>
      </footer>
    </div>
  );
}
