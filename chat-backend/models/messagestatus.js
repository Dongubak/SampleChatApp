const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Message = require('./message');
const User = require('./user');

const MessageStatus = sequelize.define('MessageStatus', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  message_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Message,
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
  is_read: {
    type: DataTypes.TINYINT(1),
    defaultValue: 0,
  },
  read_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  timestamps: false,
  tableName: 'messagestatus',
});

module.exports = MessageStatus;