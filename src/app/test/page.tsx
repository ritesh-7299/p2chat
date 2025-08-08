"use client";

import React, { useEffect, useRef, useState } from "react";
import { SignalMessage } from "../utils/types";
import { headers } from "next/headers";

export default function SimpleForm() {
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const [localId, setLocalId] = useState<string>("");
  const [remoteId, setRemoteId] = useState<string>("");
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const localIdData = Math.floor(100000 + Math.random() * 900000).toString();
    setLocalId(localIdData);
    const ws = new WebSocket(
      `ws://localhost:8080/signal?localId=${localIdData}`
    );

    ws.onmessage = (event) => {
      const data: SignalMessage = JSON.parse(event.data);
      console.log("what is data recevied from socket:", data);
      switch (data.type) {
        case "offer":
          createAnswer(data.sdp);
          break;
        case "answer":
          setAnswer(data.sdp);
          break;
        case "candidate":
          // addIceCandidate
          break;
      }
    };

    setSocket(ws);
  }, []);

  const createConnection = () => {
    peerConnection.current = new RTCPeerConnection();
  };

  const sendSignal = (message: SignalMessage) => {
    console.log("socket===>", socket);
    console.log("message===>", message);
    socket!.send(JSON.stringify(message));
  };

  const createOffer = async () => {
    if (!remoteId) {
      alert("Please enter remote id");
      return;
    }
    createConnection();
    const offer = await peerConnection.current!.createOffer();
    await peerConnection.current!.setLocalDescription(offer);
    console.log("created offer", offer);
    //this offer needs to send to the remote user
    sendSignal({
      type: "offer",
      from: localId,
      to: remoteId,
      sdp: offer,
    });
  };

  const createAnswer = async (offer: any) => {
    createConnection();
    const offerDesc = new RTCSessionDescription(offer);
    await peerConnection.current!.setRemoteDescription(offerDesc);
    const answer = await peerConnection.current!.createAnswer();
    console.log("answer created:::", { answer, localId, remoteId });
    await peerConnection.current!.setLocalDescription(answer);
    //this answer needs to send to the local user
    sendSignal({
      type: "answer",
      from: localId,
      to: remoteId,
      sdp: answer,
    });
  };

  const setAnswer = async (answer: any) => {
    const answerDesc = new RTCSessionDescription(answer);
    await peerConnection.current!.setRemoteDescription(answerDesc);
    alert("Connected!!!");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createOffer();
  };

  return (
    <form onSubmit={handleSubmit} style={{ gap: "10px" }}>
      <h1>Local id: {localId}</h1>
      <input
        type="text"
        placeholder="Enter remote id..."
        value={remoteId}
        onChange={(e) => setRemoteId(e.target.value)}
        style={{ padding: "8px", flex: 1, border: "10px" }}
      />
      <button
        type="submit"
        style={{
          padding: "8px 12px",
          border: "10px",
          cursor: "pointer",
          backgroundColor: "green",
        }}
      >
        Connect
      </button>
    </form>
  );
}
