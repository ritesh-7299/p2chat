"use client";

import Image from "next/image";
import { useRef } from "react";

export default function Home() {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const webVideoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  /**
   * Function to start a video stream
   */
  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      streamRef.current = stream; // store stream so we can stop it later
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      if (webVideoRef.current) {
        webVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      alert("Sorry we couldn't find camera or mic on your system");
    }
  };

  /**
   * Function to stop streaming
   */
  const stopStream = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      if (webVideoRef.current) {
        webVideoRef.current.srcObject = null;
      }
    } catch (error) {
      alert("Sorry we couldn't find camera or mic on your system");
    }
  };

  return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Video Stream Interface</h1>

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
                ref={webVideoRef}
                autoPlay
                playsInline
                className="rounded-lg aspect-video w-full max-w-sm border border-gray-300 shadow-md"
            />
          </div>
        </div>


        <div className="flex gap-4 mb-6">
          <button
              onClick={startStream}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow"
          >
            Start Streaming
          </button>
          <button
              onClick={stopStream}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg shadow"
          >
            Stop Streaming
          </button>
        </div>
        <div className="text-sm text-gray-300 text-center mb-12">
          <p className="mb-2">
            1. Click on{" "}
            <span className="bg-gray-800 px-2 py-0.5 rounded text-white font-mono text-xs">Start Streaming</span>
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
