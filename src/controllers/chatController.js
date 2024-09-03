const { handleChatbotResponse } = require('../services/languageModelService');
const Conversation = require('../models/conversation');
const Message = require('../models/message');

async function handleChat(req, res) {
    const { message, conversationId } = req.body;
    console.log('Received chat request:', { message, conversationId });

    try {
        let conversation;
        if (conversationId) {
            conversation = await Conversation.findByPk(conversationId);
            if (!conversation) {
                return res.status(404).json({ error: 'Conversation not found' });
            }
        } else {
            conversation = await Conversation.create();
        }

        await Message.create({
            content: message,
            role: 'user',
            ConversationId: conversation.id
        });

        console.log('Calling chatbot response handler');
        const response = await handleChatbotResponse(message, conversation.id);

        await Message.create({
            content: response,
            role: 'assistant',
            ConversationId: conversation.id
        });

        res.json({
            message: response,
            conversationId: conversation.id
        });
    } catch (error) {
        console.error('Error in handleChat:', error);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
}

module.exports = { handleChat };