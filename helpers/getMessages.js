const Chat = require('../models/chat');
const getMessages = async (query = {}) => {
    
    return await Chat.find(query);
}

module.exports = getMessages;