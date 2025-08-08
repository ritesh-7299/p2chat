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
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="flex flex-row justify-around mt-2 w-full">
          <div>
            <video
              width={320}
              height={180}
              autoPlay
              muted
              loop
              playsInline
              ref={localVideoRef}
              className="rounded-lg shadow-lg"
            />
          </div>
          <div>
            <video
              width={320}
              height={180}
              autoPlay
              muted
              loop
              playsInline
              ref={webVideoRef}
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
        <div className="flex flex-row justify-around mt-2 w-full">
          <div>
            <button
              onClick={startStream}
              name="btn-click"
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded cursor-pointer"
            >
              Start Streaming
            </button>
          </div>

          <div>
            <button
              onClick={stopStream}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded cursor-pointer"
            >
              Stop Streaming
            </button>
          </div>
        </div>
        <ol className="font-mono list-inside list-decimal text-sm/6 text-center sm:text-left">
          <li className="mb-2 tracking-[-.01em]">
            Get started by Clicking on{" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] font-mono font-semibold px-1 py-0.5 rounded">
              start streaming
            </code>
            .
          </li>
          <li className="tracking-[-.01em]">
            Allow camera and microphone permission
          </li>
        </ol>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://github.com/ritesh-7299"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Made by Ritesh Macwan
        </a>
      </footer>
    </div>
  );
}
