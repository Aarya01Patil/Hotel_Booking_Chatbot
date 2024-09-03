const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Conversation = require('./conversation');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('user', 'assistant'),
    allowNull: false
  }
});

Message.belongsTo(Conversation);
Conversation.hasMany(Message);

module.exports = Message;