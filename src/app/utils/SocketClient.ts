const socket = new WebSocket('ws://localhost:8080/signal');

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  switch (data.type) {
    case 'offer':
      // setRemoteDescription, createAnswer, etc.
      break;
    case 'answer':
      // setRemoteDescription
      break;
    case 'candidate':
      // addIceCandidate
      break;
  }
};