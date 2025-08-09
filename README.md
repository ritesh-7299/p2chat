cat << 'EOF' > README.md
# 💬 P2Chat Frontend

A sleek, real-time peer-to-peer chat and file sharing interface built with Next.js and TypeScript. This frontend connects to the signaling backend via WebSocket and uses WebRTC for direct peer communication.

---

## 🌐 Live Preview

To run locally:  
\`http://localhost:3000\`

---

## 🚀 Features

- ⚡ Real-time messaging via WebRTC  
- 📁 File sharing using RTCDataChannel  
- 🔗 Peer-to-peer connection with signaling via WebSocket  
- 🧠 Intelligent UI feedback for connection status  
- 🎨 Responsive design with modern styling  

---

## 🧱 Tech Stack

| Layer       | Technology         |
|-------------|--------------------|
| Framework   | Next.js (App Router) |
| Language    | TypeScript         |
| Styling     | Tailwind CSS       |
| Fonts       | Geist (via next/font) |
| WebRTC      | RTCPeerConnection, RTCDataChannel |
| Signaling   | WebSocket (to backend) |

---

## 📂 Project Structure

\`\`\`
src/
├── app/              # Pages and routing
│   └── page.tsx      # Main chat UI
├── components/       # Reusable UI components
├── hooks/            # Custom React hooks
├── utils/            # WebRTC and signaling helpers
├── types/            # Type definitions
└── styles/           # Tailwind config
\`\`\`

---

## ⚙️ Setup Instructions

### 1. Clone the Repo

\`\`\`bash
git clone https://github.com/ritesh-7299/p2chat.git
cd p2chat
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Run the Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 🔌 WebSocket Integration

Make sure the backend signaling server is running at:

\`\`\`
ws://localhost:8080/ws?localId=<your-id>
\`\`\`

The frontend connects automatically using the \`localId\` you provide.

---

## 🧪 Testing

Use two browser tabs or devices to simulate peer-to-peer connection.  
Ensure both clients use unique \`localId\`s and connect to the same signaling server.

---

## 📜 License

This project is open-source and available under the MIT License.

---

## 👨‍💻 Author

**Ritesh Macwan**  
Frontend & WebRTC Developer  
[GitHub](https://github.com/ritesh-7299) • [LinkedIn](https://www.linkedin.com/in/ritesh-macwan-8a70891ba)
EOF
