# 실시간 채팅 프로그램 샘플

## 프론트엔드

### 코드
```javascript
import { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://192.168.0.50:5001");
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
```

### 코드 설명
#### 1. 사용자 등록
```javascript
socket.on("registered", ({ username }) => {
   console.log(`Registered as ${username}`);
});
```
> 앱이 실행되면 서버에 register 이벤트를 보내서 사용자의 이름을 등록한다.


#### 2. 실시간 사용자 목록 업데이트
```javascript
socket.on("updateUsers", (users) => {
   const filteredUsers = users.filter((user) => user !== username);
   setOnlineUsers(filteredUsers);
});
```

> 사용자 목록이 업데이트되면 목록을 받아와서 users를 갱신한다.


#### 3. 메세지 전송
```javascript
const sendMessage = () => {
   if (selectedUser) {
      socket.emit("privateMessage", { recipientUsername: selectedUser, message: input });
      console.log(`Message sent to ${selectedUser}`);
      setInput("");
   }
};
```

> privateMessage 이벤트를 발생시킨 후 수신하는 유저의 이름을 담아 전송한다.


#### 4. 메세지 수신
```javascript
socket.on("message", (data) => {
   setMessages((prev) => [...prev, data]);
});
```

> message 이벤트가 발생하면 데이터를 받아서 메세지를 추가한다.

#### 5. 페이지 종료시 연결 해제
```javascript
  return () => {
      socket.off("registered");
      socket.off("updateUsers");
      socket.off("message");
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
}, []);
```

> 소켓의 이벤트 핸들링을 다 닫는다.


## 백엔드

### 코드
```javascript
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
   cors: {
     origin: "*",  // 모든 도메인 허용
     methods: ["GET", "POST"],
   },
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
server.listen(5001, '0.0.0.0', () => {
   console.log("Server running on http://0.0.0.0:5001");
});
```

### 코드 설명
#### 1. 사용자 등록 처리
```javascript
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
```

> 사용자가 register 이벤트를 보내면 users객체에 해당 유저의 username을 키, 소켓아이디를 value로 하여 저장한다.
> 수정된 users를 브로드케스트한다.


#### 2. 사용자 연결 해제 처리
```javascript
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
```

> 사용자가 연결해제 이벤트를 보내면 해당 유저를 users에서 제거한 뒤 업데이트한 users를 브로드케스트한다.


#### 3. 개인 메세지 전송 처리
```javascript
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
```

> 사용자가 Message이벤트를 보내면 수신 유저의 유저네임에 메세지를 전송한다.

## 2025.01.25 도커 빌드는 성공했지만 (유기)프론트코드에서 소켓을 생성하지 못하는 것 같음

## 데이터베이스 테이블 관계도
![alt text](image.png)

## 데이터베이스 모델 정의
### USER 모델
```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  profile_image: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,  // TIMESTAMP 대신 DATE 사용
    defaultValue: DataTypes.NOW,  // 기본값 설정
  },
}, {
  timestamps: false,
  tableName: 'users',
});

module.exports = User;
```

> created_at 필드 값의 타입이 DateTypes.DATE임에 유의해야한다.

### seeder
초기 데이터베이스 연결 확인과 더미 테스트 데이터 삽입 부분을 담당한다.

```javascript
const { User, ChatRoom, Message, sequelize } = require('../models');

(async () => {
  await sequelize.sync({ force: true });  // 기존 테이블 삭제 후 재생성
  console.log("테이블 초기화 완료.");

  const qwer = await User.create({ username: 'qwer', email: 'qwer@example.com', password_hash: 'hashed_password_qwer' });
  const asdf = await User.create({ username: 'asdf', email: 'asdf@example.com', password_hash: 'hashed_password_asdf' });

  const chatroom = await ChatRoom.create({ name: 'qwer with asdf', is_group: false });

  await Message.create({ chatroom_id: chatroom.id, sender_id: qwer.id, message: 'Hello asdf!', message_type: 'text' });
  await Message.create({ chatroom_id: chatroom.id, sender_id: asdf.id, message: 'Hi qwer!', message_type: 'text' });

  console.log("샘플 데이터 삽입 완료.");
  process.exit();
})();
```

> 샘플 데이터를 삽입하면서 데이터베이스와의 연결을 확인하며 모델의 정상적인 정의 여부도 확인할 수 있다. 즉 전반적인 디비 연결부분을 테스트 할 수 있음