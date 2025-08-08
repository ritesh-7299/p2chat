"use client";

import React, { useEffect, useRef, useState } from "react";
import { SignalMessage } from "../utils/types";

export default function SimpleForm() {
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const [channelReady, setChannelReady] = useState<boolean>(false);

  const [localId, setLocalId] = useState<string>("");
  const [remoteId, setRemoteId] = useState<string>("");
  const [socketReady, setSocketReady] = useState<boolean>(false);

  const [messages, setMessages] = useState<string[]>([]);
  const [messageInput, setMessageInput] = useState<string>("");

  const socketInit = (id: string) => {
    return new Promise<void>((resolve, reject) => {
      const ws = new WebSocket(`ws://localhost:8080/signal?localId=${id}`);
      socketRef.current = ws;

      ws.onopen = () => {
        setSocketReady(true);
        console.log("Socket connected");
        resolve();
      };

      ws.onmessage = (event) => {
        const data: SignalMessage = JSON.parse(event.data);
        console.log("Received from socket:", data);
        switch (data.type) {
          case "offer":
            createAnswer(data.sdp, data.from, data.to);
            break;
          case "answer":
            setAnswer(data.sdp);
            break;
          case "candidate":
            if (data.candidate) {
              console.log("Remote ICE candidate received:", data.candidate);
              peerConnection.current!.addIceCandidate(
                new RTCIceCandidate(data.candidate)
              );
            }

            break;
        }
      };

      ws.onerror = (err) => {
        console.error("Socket error", err);
        reject(err);
      };
    });
  };

  useEffect(() => {
    const id = Math.floor(100000 + Math.random() * 900000).toString();
    setLocalId(id);
    socketInit(id).catch(console.error);
  }, []);

  const createConnection = () => {
    peerConnection.current = new RTCPeerConnection();

    peerConnection.current!.onicecandidate = (event) => {
      console.log("Local ICE candidate:", event.candidate);
      if (event.candidate) {
        sendSignal({
          type: "candidate",
          from: localId,
          to: remoteId,
          candidate: event.candidate,
        });
      }
    };

    // Listen for incoming data channel (on answerer side)
    peerConnection.current.ondatachannel = (event) => {
      const channel = event.channel;
      dataChannelRef.current = channel;

      channel.onmessage = (e) => {
        setMessages((prev) => [...prev, `Peer: ${e.data}`]);
      };

      channel.onopen = () => {
        setChannelReady(true);
        console.log("Data channel opened");
      };

      channel.onclose = () => {
        console.log("Data channel closed");
      };
    };
  };

  const sendSignal = (message: SignalMessage) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.error("Socket is not ready to send", message);
      return;
    }
    socketRef.current.send(JSON.stringify(message));
  };

  const createOffer = async () => {
    if (!remoteId) {
      alert("Please enter remote id");
      return;
    }
    createConnection();

    // Create data channel (on offerer side)
    const dataChannel = peerConnection.current!.createDataChannel("chat");
    dataChannelRef.current = dataChannel;

    dataChannel.onmessage = (e) => {
      setMessages((prev) => [...prev, `Peer: ${e.data}`]);
    };

    dataChannel.onopen = () => {
      setChannelReady(true);
      console.log("Data channel opened");
    };

    dataChannel.onclose = () => {
      console.log("Data channel closed");
    };

    const offer = await peerConnection.current!.createOffer();
    await peerConnection.current!.setLocalDescription(offer);
    sendSignal({
      type: "offer",
      from: localId,
      to: remoteId,
      sdp: offer,
    });
  };

  const createAnswer = async (offer: any, from: string, to: string) => {
    if (!socketReady) {
      console.log("Waiting for socket to connect...");
      await socketInit(to);
    }
    createConnection();
    const offerDesc = new RTCSessionDescription(offer);
    await peerConnection.current!.setRemoteDescription(offerDesc);
    const answer = await peerConnection.current!.createAnswer();
    await peerConnection.current!.setLocalDescription(answer);
    sendSignal({
      type: "answer",
      from: to,
      to: from,
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

  const sendMessage = () => {
    if (
      dataChannelRef.current &&
      dataChannelRef.current.readyState === "open"
    ) {
      dataChannelRef.current.send(messageInput);
      setMessages((prev) => [...prev, `You: ${messageInput}`]);
      setMessageInput("");
    } else {
      alert("Data channel is not open yet.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <form onSubmit={handleSubmit} style={{ gap: "10px" }}>
        <h1>Local id: {localId}</h1>
        <input
          type="text"
          placeholder="Enter remote id..."
          value={remoteId}
          onChange={(e) => setRemoteId(e.target.value)}
          style={{ padding: "8px", flex: 1, border: "1px solid #ccc" }}
        />
        <button
          type="submit"
          style={{
            padding: "8px 12px",
            cursor: "pointer",
            backgroundColor: "green",
            color: "white",
          }}
        >
          Connect
        </button>
      </form>

      <div style={{ marginTop: "20px" }}>
        <h2>Chat</h2>
        <div
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            height: "200px",
            overflowY: "auto",
          }}
        >
          {messages.map((msg, idx) => (
            <div key={idx}>{msg}</div>
          ))}
        </div>
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Type a message..."
          style={{ padding: "8px", width: "80%", marginTop: "10px" }}
        />
        <button
          disabled={!channelReady}
          onClick={sendMessage}
          style={{
            padding: "8px 12px",
            marginLeft: "10px",
            backgroundColor: "blue",
            color: "white",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
