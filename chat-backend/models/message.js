const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');
const ChatRoom = require('./chatroom');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  chatroom_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: ChatRoom,
      key: 'id',
    },
  },
  sender_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  message_type: {
    type: DataTypes.ENUM('text', 'image', 'video', 'file'),
    defaultValue: 'text',
  },
  created_at: {
   type: DataTypes.DATE,  // 올바른 Sequelize 타입 적용
   defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: false,
  tableName: 'messages',
});

module.exports = Message;