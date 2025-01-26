import { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io(process.env.REACT_APP_BACKEND_URL || "http://chat-backend:5001", {
  transports: ["websocket"],  // polling을 방지하고 websocket 강제 설정
  reconnectionAttempts: 5,    // 재연결 시도 횟수 설정
  timeout: 20000              // 연결 타임아웃 설정
});
const username = "User_" + Math.floor(Math.random() * 1000);

function ChatRoom() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]); // 온라인 사용자 목록 상태
  const [selectedUser, setSelectedUser] = useState("");

  useEffect(() => {
    // 메시지 수신 이벤트
    socket.on("message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    // 서버에 사용자 등록 요청
    socket.emit("register", username);

    // 사용자 등록 완료 시 확인
    socket.on("registered", ({ username }) => {
      console.log(`Registered as ${username}`);
    });

    // 온라인 사용자 목록 업데이트
    socket.on("updateUsers", (users) => {
      const filteredUsers = users.filter((user) => user !== username);
      setOnlineUsers(filteredUsers);
    });

    // 페이지 떠날 때 소켓 연결 해제
    const handleBeforeUnload = () => {
      socket.disconnect();
    };
  
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      socket.off("registered");
      socket.off("updateUsers");
      socket.off("message");
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const sendMessage = () => {
    if (selectedUser) {
      socket.emit("privateMessage", { recipientUsername: selectedUser, message: input });
      console.log(`Message sent to ${selectedUser}`);
      setInput("");
    }
  };

  return (
    <div>
      <h2>Chat Room</h2>
      <h3>Online Users:</h3>
      <ul>
        {onlineUsers.map((user, index) => (
          <li 
            key={index}
            onClick={() => setSelectedUser(user)}
            style={{ cursor: 'pointer', fontWeight: selectedUser === user ? 'bold' : 'normal' }}
          >
            {user}
          </li>
        ))}
      </ul>
      <div>
        {messages.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </div>
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button disabled={!selectedUser} onClick={sendMessage}>Send</button>
    </div>
  );
}

export default ChatRoom;