"use client";

import React, { useState, useRef } from "react";

const WebRTCConnect = () => {
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const [localOffer, setLocalOffer] = useState("");
  const [remoteOffer, setRemoteOffer] = useState("");
  const [localAnswer, setLocalAnswer] = useState("");
  const [remoteAnswer, setRemoteAnswer] = useState("");
  const [status, setStatus] = useState("Idle");

  const createPeerConnection = () => {
    peerConnection.current = new RTCPeerConnection();
    setStatus("PeerConnection created");
  };

  const createOffer = async () => {
    createPeerConnection();
    const offer = await peerConnection.current!.createOffer();
    await peerConnection.current!.setLocalDescription(offer);
    setLocalOffer(JSON.stringify(offer));
    setStatus("Offer created");
  };

  const receiveOfferAndCreateAnswer = async () => {
    createPeerConnection();
    const offerDesc = new RTCSessionDescription(JSON.parse(remoteOffer));
    await peerConnection.current!.setRemoteDescription(offerDesc);
    const answer = await peerConnection.current!.createAnswer();
    await peerConnection.current!.setLocalDescription(answer);
    setLocalAnswer(JSON.stringify(answer));
    setStatus("Answer created");
  };

  const setRemoteAnswerOnOfferer = async () => {
    const answerDesc = new RTCSessionDescription(JSON.parse(remoteAnswer));
    await peerConnection.current!.setRemoteDescription(answerDesc);
    setStatus("Connection established!");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🔗 WebRTC Manual Signaling</h2>
      <button onClick={createOffer}>Create Offer (User A)</button>
      <button onClick={receiveOfferAndCreateAnswer}>
        Receive Offer & Create Answer (User B)
      </button>
      <button onClick={setRemoteAnswerOnOfferer}>
        Set Remote Answer (User A)
      </button>

      <h4>📤 Local Offer (User A)</h4>
      <textarea
        value={localOffer}
        readOnly
        rows={6}
        style={{ width: "100%" }}
      />

      <h4>📥 Remote Offer (User B)</h4>
      <textarea
        value={remoteOffer}
        onChange={(e) => setRemoteOffer(e.target.value)}
        rows={6}
        style={{ width: "100%" }}
      />

      <h4>📤 Local Answer (User B)</h4>
      <textarea
        value={localAnswer}
        readOnly
        rows={6}
        style={{ width: "100%" }}
      />

      <h4>📥 Remote Answer (User A)</h4>
      <textarea
        value={remoteAnswer}
        onChange={(e) => setRemoteAnswer(e.target.value)}
        rows={6}
        style={{ width: "100%" }}
      />

      <p>Status: {status}</p>
    </div>
  );
};

export default WebRTCConnect;
