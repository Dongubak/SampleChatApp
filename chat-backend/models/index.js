const sequelize = require('../config/database');
const User = require('./user');
const ChatRoom = require('./chatroom');
const ChatParticipant = require('./chatparticipant');
const Message = require('./message');
const MessageStatus = require('./messagestatus');

// 관계 설정
User.hasMany(ChatParticipant, { foreignKey: 'user_id' });
ChatRoom.hasMany(ChatParticipant, { foreignKey: 'chatroom_id' });

User.hasMany(Message, { foreignKey: 'sender_id' });
ChatRoom.hasMany(Message, { foreignKey: 'chatroom_id' });

User.hasMany(MessageStatus, { foreignKey: 'user_id' });
Message.hasMany(MessageStatus, { foreignKey: 'message_id' });

const db = {
  sequelize,
  User,
  ChatRoom,
  ChatParticipant,
  Message,
  MessageStatus,
};

module.exports = db;