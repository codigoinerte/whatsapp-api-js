const {Schema, model} = require('mongoose');

const UsuarioSchema = Schema({

    nombre: {
        type:String,
        required: [true, 'El nombre es obligatorio']
    },
    correo: {
        type:String        
    },
    prefijo: {
        type:String,
        required: [true, 'El prefijo es obligatorio']
    },
    celular: {
        type:String,
        required: [true, 'El celular es obligatorio']
    },
    img: {
        type:String       
    },
    estado: {
        type:Boolean,
        default:true
    }
});

UsuarioSchema.methods.toJSON = function () {
    const { __v, password, _id, ...usuario } = this.toObject();

    return {
        ...usuario,
        uid: _id
    };
}

module.exports = model('Usuario', UsuarioSchema);