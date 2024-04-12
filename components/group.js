const router = require('express').Router();
const { MessageMedia, Location, Poll } = require("whatsapp-web.js");
const request = require('request')
const vuri = require('valid-url');
const fs = require('fs');

const mediadownloader = (url, path, callback) => {
    request.head(url, (err, res, body) => {
      request(url)
        .pipe(fs.createWriteStream(path))
        .on('close', callback)
    })
  }
  
router.post('/getchat/:chatname', async (req, res) => {
    let chatname = req.params.chatname;
    let message = req.body.message;
    let messagesLimit = req.body?.message ?? 100;
    if (chatname == undefined || message == undefined) {
        res.send({ status: "error", message: "please enter valid chatname and message" })
    } else {        
        client.getChats().then((data) => {
            data.forEach(chat => {
                if (chat.id.server === "g.us" && chat.name === chatname) {
                    
                    client.getChatById(chat.id._serialized).then(async chat => {
                        chat.fetchMessages({limit: messagesLimit}).then(async (messages) => {
                            console.log('Últimos 10 mensajes del chat:');
                            let response = [];
                            
                            for(let message of messages){
                                let contact = await client.getContactById(message.from);
                                response.push({
                                    from: {
                                        id: message.from,
                                        name: contact.pushname ?? '',
                                        phone : contact.number ?? ''
                                    },
                                    body: message.body
                                });
                            }                            

                            res.status(200).send({ status: 'success', body: response})
                        });
                    }).catch(error => {
                        res.status(400).send({ error })
                    });
                    
                }
            });     
        });
        

        /*
        // Obtener un chat específico por su ID
        const chatId = `120363039521808088@g.us`; // Reemplaza con el ID del chat deseado
        
        // Fetch de mensajes del chat
        client.getChatById(chat.id._serialized).then(chat => {
            chat.fetchMessages({limit: 10}).then(messages => {
                console.log('Últimos 10 mensajes del chat:');
                messages.forEach(message => {
                    console.log(`${message.from}: ${message.body}`);
                });
            });
        }).catch(error => {
            console.error('Error al obtener el chat:', error);
        });
        */
    }
});

router.post('/sendmessage/:chatname', async (req, res) => {
    let chatname = req.params.chatname;
    let message = req.body.message;

    if (chatname == undefined || message == undefined) {
        res.send({ status: "error", message: "please enter valid chatname and message" })
    } else {
        client.getChats().then((data) => {
            data.forEach(chat => {
                if (chat.id.server === "g.us" && chat.name === chatname) {
                    client.sendMessage(chat.id._serialized, message).then((response) => {
                        if (response.id.fromMe) {
                            res.send({ status: 'success', message: `Message successfully send to ${chatname}` })
                        }
                    });
                }
            });     
        });
    }
});

router.post('/sendimage/:chatname', async (req, res) => {
    var base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

    let chatname = req.params.chatname;
    let image = req.body.image;
    let caption = req.body.caption ?? '';
    let sendMediaAsSticker = req.body.isSticker ?? false;

    if (chatname == undefined || image == undefined) {
        res.send({status:"error",message:"please enter valid chatname and base64/url of image"})
    } else {
        if (base64regex.test(image)) { 
            client.getChats().then((data) => {
                data.forEach(chat => {
                    if (chat.id.server === "g.us" && chat.name === chatname) {
                        if (!fs.existsSync('./temp')) {
                            fs.mkdirSync('./temp');
                        }

                        let media = new MessageMedia('image/png', image);
                        client.sendMessage(chat.id._serialized, media, { caption, sendMediaAsSticker }).then((response) => {
                            if (response.id.fromMe) {
                                res.send({ status: 'success', message: `Message successfully send to ${chatname}` });                                
                            }
                        });
                    }
                });     
            });
        } else if (vuri.isWebUri(image)) {
            var path = './temp/' + image.split("/").slice(-1)[0]
            client.getChats().then((data) => {
                data.forEach(chat => {
                    if (chat.id.server === "g.us" && chat.name === chatname) {
                        mediadownloader(image, path, () => {
                            let media = MessageMedia.fromFilePath(path);
                            client.sendMessage(chat.id._serialized, media, { caption: caption || "" }).then((response)=>{
                                if (response.id.fromMe) {
                                    res.send({ status: 'success', message: `Message successfully send to ${chatname}` })
                                    fs.unlinkSync(path)
                                }
                            });
                        });
                        
                    }
                });     
            });            
        } else {
            res.send({ status: 'error', message: 'Invalid URL/Base64 Encoded Media' })
        }
    }
});

router.post('/sendpdf/:chatname', async (req, res) => {
    var base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

    let chatname = req.params.chatname;
    let pdf = req.body.pdf;

    if (chatname == undefined || pdf == undefined) {
        res.send({ status: "error", message: "please enter valid chatname and base64/url of pdf" })
    } else {
        if (base64regex.test(pdf)) {
            client.getChats().then((data) => {
                data.some(chat => {
                    if (chat.id.server === "g.us" && chat.name === chatname) {
                        if (!fs.existsSync('./temp')) {
                            fs.mkdirSync('./temp');
                        }
                        let media = new MessageMedia('application/pdf', pdf);
                        client.sendMessage(chat.id._serialized, media).then((response) => {
                            if(response.id.fromMe){
                                res.send({ status: 'success', message: `Message successfully send to ${chatname}` })
                                fs.unlinkSync(path)
                            }
                        });
                        return true;
                    }
                });     
            });
        } else if (vuri.isWebUri(pdf)) {
            var path = './temp/' + pdf.split("/").slice(-1)[0]
            client.getChats().then((data) => {
                data.some(chat => {
                    if (chat.id.server === "g.us" && chat.name === chatname) {
                        mediadownloader(image, path, () => {
                            let media = MessageMedia.fromFilePath(path);
                            client.sendMessage(chat.id._serialized, media).then((response)=>{
                                if (response.id.fromMe) {
                                    res.send({ status: 'success', message: `Message successfully send to ${chatname}` })
                                    fs.unlinkSync(path)
                                }
                            });
                        });
                        return true;
                    }
                });     
            });            
        } else {
            res.send({ status: 'error', message: 'Invalid URL/Base64 Encoded Media' })
        }
    }
});

router.post('/sendlocation/:chatname', async (req, res) => {
    let chatname = req.params.chatname;
    let latitude = req.body.latitude;
    let longitude = req.body.longitude;
    let desc = req.body.description;

    if (chatname == undefined || latitude == undefined || longitude == undefined) {
        res.send({ status: "error", message: "please enter valid phone, latitude and longitude" })
    } else {
        client.getChats().then((data) => {
            data.some(chat => {
                if (chat.id.server === "g.us" && chat.name === chatname) {
                    let loc = new Location(latitude, longitude, desc || "");
                    client.sendMessage(chat.id._serialized, loc).then((response) => {
                        if (response.id.fromMe) {
                            res.send({ status: 'success', message: `Message successfully send to ${chatname}` })
                        }
                    });
                    return true;
                }
            });     
        });
    }
});

router.post('/sendpoll/:chatname', async (req, res) => {
    let chatname = req.params.chatname;
    let title = req.body.title ?? 'Nueva votación';
    let options = req.body.options ?? [];
    if (chatname == undefined || title == undefined) {
        res.send({ status: "error", message: "please enter valid chatname and message" })
    } else {
        client.getChats().then((data) => {
            data.forEach(chat => {
                if (chat.id.server === "g.us" && chat.name === chatname) {
                    const newPoll = new Poll(title, options)
                    client.sendMessage(chat.id._serialized, newPoll);
                }
            });     
        });
    }
});

module.exports = router;
