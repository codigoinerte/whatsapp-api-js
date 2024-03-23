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

    if (response.id.server === "g.us" && response.name === chatname) {
        
        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: origin.body }],
            model: "gpt-3.5-turbo",
        });
        const message = (completion.choices[0].message.content).toString().replaceAll("´´´","*");
        console.log(message);
        client.sendMessage(origin.from, message);
    }
}

module.exports = bot;