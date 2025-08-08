export interface SignalMessage {
  type: 'offer' | 'answer' | 'candidate';
  from: string;
  to: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}