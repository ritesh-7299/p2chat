"use client";

import React, { useEffect, useRef, useState } from "react";
import { SignalMessage } from "../utils/types";

export default function SimpleForm() {
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const [channelReady, setChannelReady] = useState<boolean>(false);

  const localIdRef = useRef<string | null>(null);
  const remoteIdRef = useRef<string | null>(null);

  const [socketReady, setSocketReady] = useState<boolean>(false);

  const [messages, setMessages] = useState<string[]>([]);
  const [messageInput, setMessageInput] = useState<string>("");

  const socketInit = (id: string) => {
    return new Promise<void>((resolve, reject) => {
      const ws = new WebSocket(`ws://192.168.1.14:8080/signal?localId=${id}`);
      // const ws = new WebSocket(`ws://localhost:8080/signal?localId=${id}`);
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
              remoteIdRef.current = data.from;
              console.log("Remote ICE candidate received:", data.candidate);
              peerConnection.current!.addIceCandidate(
                new RTCIceCandidate(data.candidate)
              );
            }

            break;
        }
      };
      ws.onclose = () => {
        alert("Socket connection closed");
      };

      ws.onerror = (err) => {
        console.error("Socket error", err);
        reject(err);
      };
    });
  };

  useEffect(() => {
    const id = Math.floor(100000 + Math.random() * 900000).toString();
    // setLocalId(id);
    localIdRef.current = id;
    socketInit(id).catch(console.error);
    createConnection();

    window.addEventListener("beforeunload", () => {
      socketRef.current!.close(); // triggers backend disconnect
    });

    return () => {
      peerConnection.current?.close();
      socketRef.current?.close();
    };
  }, []);

  /**
   * Function to establish the connection for peer network
   */
  const createConnection = () => {
    peerConnection.current = new RTCPeerConnection();

    peerConnection.current!.onicecandidate = (event) => {
      console.log("Local ICE candidate:", event.candidate);
      if (event.candidate) {
        sendSignal({
          type: "candidate",
          from: localIdRef.current!,
          to: remoteIdRef.current!,
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
        alert("Data channel closed");
      };
    };
  };

  /**
   * Common function to send emits to the websocket
   *
   * @param message
   * @returns
   */
  const sendSignal = (message: SignalMessage) => {
    console.log("message to send to the socket->", message);
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.error("Socket is not ready to send", message);
      return;
    }
    socketRef.current.send(JSON.stringify(message));
  };

  const createOffer = async () => {
    if (!remoteIdRef.current) {
      alert("Please enter remote id");
      return;
    }

    //check if remote user is already having any connection

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
      from: localIdRef.current!,
      to: remoteIdRef.current!,
      sdp: offer,
    });
  };

  const createAnswer = async (offer: any, from: string, to: string) => {
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
    console.log("localid::::::", localIdRef.current);
    console.log("remoteid::::::", remoteIdRef.current);
    sendSignal({
      type: "connection",
      from: remoteIdRef.current!,
      to: localIdRef.current!,
    });
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
        <h1>Local id: {localIdRef.current}</h1>
        <input
          type="text"
          placeholder="Enter remote id..."
          value={remoteIdRef.current!}
          onChange={(e) => (remoteIdRef.current = e.target.value)}
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
