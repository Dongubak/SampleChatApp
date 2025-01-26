const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
   cors: {
       origin: "*",  // 또는 프론트엔드 URL을 명시 (예: "http://localhost:3000")
       methods: ["GET", "POST"],
       credentials: true
   },
   transports: ["websocket", "polling"],  // 트랜스포트 옵션 명시
   allowEIO3: true  // EIO 버전 호환 옵션
});

// 프론트엔드 정적 파일 제공 (React 빌드된 파일 경로 수정 가능)
const buildPath = path.join('/Users/khj/Documents/GitHub/SampleChatApp/chat-frontend', "build");
app.use(express.static(buildPath));

// SPA 라우트 처리를 위한 핸들러 (모든 경로에서 index.html 반환)
app.get("*", (req, res) => {
   res.sendFile(path.join(buildPath, "index.html"));
});

// 사용자 저장 { username: socketId }
const users = {};

io.on("connection", (socket) => {
   console.log("User connected:", socket.id);

   // 사용자 등록 처리
   socket.on("register", (username) => {
      // 기존 유저 처리 (중복 방지)
      if (users[username]) {
         users[username] = socket.id;
         socket.emit("registered", { username });
      } else {
         // 새로운 유저 등록
         users[username] = socket.id;
         socket.emit("registered", { username });
      }

      // 모든 사용자 목록 브로드캐스트 (유저네임만 전달)
      io.emit("updateUsers", Object.keys(users));
      console.log("Current Users:", users);
   });

   // 사용자 연결 해제 시 처리
   socket.on("disconnect", () => {
      for (const username in users) {
         if (users[username] === socket.id) {
            delete users[username];
            break;
         }
      }

      io.emit("updateUsers", Object.keys(users));
      console.log("User disconnected. Remaining users:", users);
   });

   // 개인 메시지 전송 처리 (username 기반 전송)
   socket.on("privateMessage", ({ recipientUsername, message }) => {
      console.log(`Message received for: ${recipientUsername}`);

      const recipientSocketId = users[recipientUsername];

      if (recipientSocketId) {
         io.to(recipientSocketId).emit("message", `${recipientUsername}: ${message}`);
         console.log(`Message sent to ${recipientUsername}`);
      } else {
         socket.emit("error", "User not found.");
      }
   });
});

// 서버 실행 (모든 네트워크 인터페이스에서 수신)
const port = process.env.PORT || 5001;
server.listen(port, '0.0.0.0', () => {
   console.log(`Server running on http://0.0.0.0:${port}`);
});