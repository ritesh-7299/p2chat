import { SignalMessage } from "./types";

export default class PeerConnection {
  private localVideoRef: React.RefObject<HTMLVideoElement> | null;
  private remoteVideoRef: React.RefObject<HTMLVideoElement> | null;
  private peerConnection: RTCPeerConnection;
  private socket: WebSocket;
  private localId: string;
  private remoteId: string;


  constructor(
    localVideoRef:React.RefObject<HTMLVideoElement> | null, 
    remoteVideoRef:React.RefObject<HTMLVideoElement> | null, 
    socket:WebSocket, 
    localId:string, 
    remoteId:string
  ) {
    this.localVideoRef = localVideoRef;
    this.remoteVideoRef = remoteVideoRef;
    this.socket = socket;
    this.localId = localId;
    this.remoteId = remoteId;
    this.peerConnection = new RTCPeerConnection({
     iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    this.peerConnection.onicecandidate = event => {
      if (event.candidate) {
        this.sendSignal({
          type: 'candidate',
          from: this.localId,
          to: this.remoteId,
          candidate: event.candidate.toJSON()
        });
      }
    };

    this.peerConnection.ontrack = event => {
      if (this.remoteVideoRef.current) {
        this.remoteVideoRef.current.srcObject = event.streams[0];
      }
    };
  }

  async init() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    stream
      .getTracks()
      .forEach((track) => this.peerConnection.addTrack(track, stream));
      
      if(this.localVideoRef.current){
        this.localVideoRef.current.srcObject = stream;
      }
  }

  async createOffer():Promise<void> {
    const offer =await this.peerConnection.createOffer();
    await this.setLocalDescription(offer);
    this.sendSignal({
      type: 'offer',
      from: this.localId,
      to: this.remoteId,
      sdp: offer
    });
  }

   async handleSignal(data:SignalMessage) {
    switch (data.type) {
      case "offer":
        await this.peerConnection.setRemoteDescription(
          new RTCSessionDescription(data.sdp!)
        );
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);
        this.sendSignal({
          type: "answer",
          from: this.localId,
          to: this.remoteId,
          sdp: answer,
        });
        break;

      case "answer":
        await this.peerConnection.setRemoteDescription(
          new RTCSessionDescription(data.sdp!)
        );
        break;

      case "candidate":
        await this.peerConnection.addIceCandidate(
          new RTCIceCandidate(data.candidate)
        );
        break;
    }
  }

   private sendSignal(message: SignalMessage) {
    this.socket.send(JSON.stringify(message));
  }


  async createAnswer() {
    return await this.peerConnection.createAnswer();
  }

  async setLocalDescription(desc:any) {
    return this.peerConnection.setLocalDescription(desc);
  }

  async setRemoteDescription(desc:any) {
    await this.peerConnection.setRemoteDescription(desc);
  }
}
