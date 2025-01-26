const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ChatRoom = sequelize.define('ChatRoom', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  is_group: {
    type: DataTypes.TINYINT(1),
    defaultValue: 0,
  },
  created_at: {
   type: DataTypes.DATE,  // 올바른 Sequelize 타입 적용
   defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: false,
  tableName: 'chatrooms',
});

module.exports = ChatRoom;