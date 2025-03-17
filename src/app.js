import express from 'express';
import path from 'path';
import url from 'url';
import { Server } from 'socket.io';
import { engine } from 'express-handlebars';
import cartsRouter from './routes/cartsRouter.js';
import productsRouter from './routes/productsRouter.js';
import viewsRouter from './routes/viewsRouter.js';
import  errorHandler  from './middlewares/errorHandler.js';
//const e = require('express');
const PORT = 8080;

let io = undefined
// Obtener la URL del módulo actual
const __filename = url.fileURLToPath(import.meta.url);
// Obtener el directorio actual
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use((express.urlencoded({ extended: true })));
app.use(express.static('./src/public'));
app.use(errorHandler)

app.engine("handlebars", engine())
app.set("view engine", "handlebars")
//app.set("views", "./src/views")
app.set('views', path.join(__dirname, 'src', 'views'));



app.use("/api/products",
    (req, res, next) => {
        req.io = io
        next()
    },
    productsRouter)
app.use("/api/carts", cartsRouter)
app.use("/", viewsRouter)

const httpServer = app.listen(PORT, () => { //servidor http montado sobre express
    console.log(`Server on line en puerto http://localhost:${PORT}`);
});

io = new Server(httpServer); //server websocket montado sobre el serverhttp

export default app;