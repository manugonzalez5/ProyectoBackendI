import moongose from 'mongoose';
export const conectarDB = async(uriMongoDB, dbName)=>{
    try{
        await moongose.connect(uriMongoDB, {
            dbName: dbName
        });
        console.log('Base de datos conectada');
    }catch(error){
        console.log(error);
    }
}