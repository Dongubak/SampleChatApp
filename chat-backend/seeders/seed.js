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