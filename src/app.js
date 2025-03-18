import express from 'express';
import { engine } from 'express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import { createServer } from 'http';
import ProductManager from './dao/ProductManager.js';
import productsRouter from './routes/productsRouter.js';
import cartsRouter from './routes/cartsRouter.js';
import viewsRouter from './routes/viewsRouter.js';


// Configuración de __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicialización de Express y HTTP Server
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// Configuración de Handlebars
app.engine('handlebars', engine({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views/partials')
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middleware para archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));


// Middleware para pasar io a las rutas
app.use((req, res, next) => {
    req.io = io; // Pasamos la instancia de io a las rutas
    next();
});

// Rutas
app.use("/api/products", productsRouter); // Rutas de la API para productos
app.use("/api/carts", cartsRouter);       // Rutas de la API para carritos
app.use("/", viewsRouter);                // Rutas de las vistas (Handlebars)

// Configuración de Socket.io
io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    // Escuchar evento para crear un producto
    socket.on('crearProducto', async (producto) => {
        try {
            await ProductManager.addProduct(producto); // Llamar al método estático
            const products = await ProductManager.getProducts(); // Llamar al método estático
            io.emit('productosActualizados', products); // Emitir la lista actualizada
        } catch (error) {
            socket.emit('error', error.message);
        }
    });

    // Escuchar evento para eliminar un producto
    socket.on('eliminarProducto', async (id) => {
        try {
            await ProductManager.deleteProductById(id); // Llamar al método estático
            const products = await ProductManager.getProducts(); // Llamar al método estático
            io.emit('productosActualizados', products); // Emitir la lista actualizada
        } catch (error) {
            socket.emit('error', error.message);
        }
    });
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { error: 'Error en el servidor' });
});

// Iniciar el servidor
const PORT = 8080;
httpServer.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`El puerto ${PORT} ya está en uso`);
    } else {
        console.error('Error al iniciar el servidor:', err);
    }
});