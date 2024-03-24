const { default: mongoose } = require('mongoose');
const moongose = require('mongoose');

const dbConnection = async () => {

    try {
        
        mongoose.set('strictQuery', true);
        
        await mongoose.connect(process.env.MONGODB_CNN, {
            useNewUrlParser:true,
            useUnifiedTopology:true,
            // useCreateIndex:true,
            // useFindAndModify:false
        });
        

        console.log('DB online');
        
    } catch (error) {
        console.log(error);
        throw new Error('Error a la hora de iniciar la db');
    }
    
}

module.exports = {
    dbConnection
}