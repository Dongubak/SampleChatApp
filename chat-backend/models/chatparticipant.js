const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');
const ChatRoom = require('./chatroom');

const ChatParticipant = sequelize.define('ChatParticipant', {
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
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  joined_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: false,
  tableName: 'chatparticipants',
});

module.exports = ChatParticipant;