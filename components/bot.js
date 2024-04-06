const fs = require('fs');
const { MessageMedia, Location } = require("whatsapp-web.js");

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

const chatname = process.env.CHATNAME || 'Testing 2';
const ENABLE_AUTOREPLY = process.env.ENABLE_AUTOREPLY || false;

const getValidationDay = () => {
  const fechaActual = new Date();

  const fechaInicio = new Date('2024-03-28');
  const fechaFin = new Date('2024-03-31');

  return fechaActual >= fechaInicio && fechaActual <= fechaFin;
}
const messageOnHolidarys = () => {
  
  let response = '';
  if (getValidationDay()) {
      response = `Agrega como preambulo a tu mensaje de bienvenida lo siguiente 'Gracias por contactarte conmigo, en estos momentos no estoy presente. Escribeme a partir del Lunes 01 de Abril del 2024',`;
  } 
  return response;
}
const validationAccessBot = (response, origin) => {
  if(getValidationDay()){
    return  origin.id.fromMe === false && response.id.server === "c.us" && response.id.user != "51982974701"
  }else{
    return  origin.id.fromMe === false && response.id.server === "c.us" && response.id.user == "51938263646"
  }   
}
const bot = async (origin) => {
    
    if(ENABLE_AUTOREPLY == false) return;
    
    const response = await origin.getChat();

    //if (response.id.server === "g.us" && response.name === chatname && origin.id.fromMe === false) { // contacto grupo
    //if (validationAccessBot(response, origin)){
    if (response.id.server === "g.us" && response.name === chatname && origin.id.fromMe === false){
        
        /*traer historial de mensajes*/
        /*
        let messagesServer = await getMessages({ idServer: origin.from }) ??  []
            messagesServer = messagesServer.map((message)=>{
                                    return {
                                        role: message.idUsuario == 'assistant' ? 'assistant' : 'user',
                                        content: message.mensaje
                                    }
                                });
        let countMessagesFromAssistant = messagesServer.filter((item)=> item.role === 'assistant').length;
        if(countMessagesFromAssistant > 7 && response.id.user!="51938263646") return;

        // mandar mensaje nuevo con historial
        const content = `Eres un assistente amable, estas interactuando con el usuario ${response.id.user},${messageOnHolidarys()} responderas en español y de forma corta,*** siempre responde de la forma mas corta posible, si no conoces una respuesta responder con 'Te responderé el lunes'`;
        const messages = [
            { role: "system", content},
            ...messagesServer,
            { role: "user", content: origin.body }
        ];
        
        const completion = await openai.chat.completions.create({
            messages,
            model: "gpt-3.5-turbo",
            temperature: 0.6
        });
        //console.log(response);

        // guardar mensaje ingresado

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
       */


        const responseImage = await fetch('https://boundary.tester.org.pe/api/listings-memes', {
            method : 'GET',            
        });

        const body = await responseImage.json();

        const image = body.image;

        //client.sendMessage(origin.from, message);

        if (!fs.existsSync('./temp')) {
            fs.mkdirSync('./temp');
        }

        //let media = new MessageMedia('image/png', image);
        //origin.reply(media, { sendMediaAsSticker: true });
        
        
        let media = new MessageMedia('image/png', image);
        await client.sendMessage(response.id._serialized, media, { sendMediaAsSticker: true });
        
        
    }
}

module.exports = bot;