export interface SignalMessage {
  type: 'offer' | 'answer' | 'candidate' | 'connection';
  from: string;
  to: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}