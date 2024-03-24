const Chat = require('../models/chat');
const saveMessage = async (params = {}) => {
    
    const usuario = new Chat({...params});

    await usuario.save();
}

module.exports = saveMessage;