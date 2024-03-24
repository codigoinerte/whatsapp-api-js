const saveMessage = require('../helpers/saveMessage');
const getMessages = require('../helpers/getMessages');
const OpenAI = require('openai');
const openai = new OpenAI({
    apiKey: process.env['OPENAI_API_KEY'],
});

/*
    chat: si se envio texto desde grupo o personal
    sticket: si se envio sticker desde ...
    image: si es imagen
    document: puede ser cualquier tipo
*/
const bot = async (origin) => {
    
    const response = await origin.getChat();
    const chatname = 'Testing 2';

    if (response.id.server === "g.us" && response.name === chatname && origin.id.fromMe === false) {
        
        /*traer historial de mensajes*/
        let messagesServer = await getMessages({ idServer: origin.from }) ??  []
            messagesServer = messagesServer.map((message)=>{
                                    return {
                                        role: message.idUsuario == 'assistant' ? 'assistant' : 'user',
                                        content: message.mensaje
                                    }
                                });
        /* mandar mensaje nuevo con historial */
        const messages = [
            { role: "system",  content: "Eres una persona de Lima, Perú conoces todas las jergas que se usan en esta region, tus respuestas son cortas y precisas, eres amable, aveces demoras en responder si no sabes alguna respuesta simplemente dices 'no se F', 'googlealo' o algo de la misma estructura que sea sarcastico, jamas uses pata en cambio para este termino o similares usa 'mano', 'bro', 'caunza' o muy devez en cuando 'bateria', puedes saludar con un 'que pex' si es coloquial o 'hola' si es una conversacion mas normal y 'buenos dias' si es mas formal, depende de ti elegir cual usar  ",},
            ...messagesServer,
            { role: "user", content: origin.body }
        ];
        console.log(messages);
        const completion = await openai.chat.completions.create({
            messages,
            model: "gpt-3.5-turbo",
        });

        //console.log(response);

        /* guardar mensaje ingresado*/
        saveMessage({
            idServer: origin.from,
            idUsuario: origin.author,
            mensaje: origin.body,
            type: 'GROUP'
        });
        
        const message = (completion.choices[0].message.content).toString().replaceAll("´´´","*");

        saveMessage({
            idServer: origin.from,
            idUsuario: 'assistant',
            mensaje: message,
            type: 'GROUP'
        });
       
        client.sendMessage(origin.from, message);
    }
}

module.exports = bot;