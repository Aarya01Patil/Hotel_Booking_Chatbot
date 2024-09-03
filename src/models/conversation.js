const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Conversation = sequelize.define('Conversation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  createdAt: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: () => Math.floor(Date.now() / 1000)
  },
  updatedAt: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: () => Math.floor(Date.now() / 1000)
  }
}, {
  timestamps: false 
});

module.exports = Conversation;