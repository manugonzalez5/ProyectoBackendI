export const procesaErrores=(error, res)=>{
    console.log(error);
    res.setHeader('Content-Type','application/json');
    return res.status(500).json(
        {
            error:`Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
            detalle:`${error.message}` // nunca enviar info de este estilo al cliente
        }
    )
    
}