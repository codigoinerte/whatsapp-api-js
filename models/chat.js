const {Schema, model} = require('mongoose');

const ChatSchema = Schema({

    idServer:{
        type:String,
        required: [true, 'El codigo identificador es obligatorio']
    },
    idUsuario:{
        type:String
    },
    mensaje: {
        type:String
    },
    type: {
        type:String,     
        required: true,
        emun:['CHAT','GROUP']
    }

});

ChatSchema.methods.toJSON = function () {
    const { __v, _id, ...chat } = this.toObject();

    return {
        ...chat,
        uid: _id
    };
}

module.exports = model('Chat', ChatSchema);