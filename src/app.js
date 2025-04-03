import express from 'express';
import { engine } from 'express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import { createServer } from 'http';
// import ProductManager from './dao/ProductManager.js';
// import productsRouter from './routes/productsRouter.js';
// import cartsRouter from './routes/cartsRouter.js';
import { ProductosMongoManager } from './dao/ProductosMongoManager.js';
import { CartMongoManager } from './dao/CartMongoManager.js';
import cartsMongoRouter from './routes/cartsMongoRouter.js';
import productsMongoRouter  from './routes/productsMongoRouter.js';
import viewsRouter from './routes/viewsRouter.js';
import { conectarDB } from './utils/conDB.js';
import { config } from './config/config.js';
import { cartModelo } from './dao/models/cartsModelo.js';


// Configuración de __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicialización de Express y HTTP Server
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// Middleware
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

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
app.use("/api/products", productsMongoRouter); // Rutas de la API para productos
app.use("/api/carts", cartsMongoRouter);       // Rutas de la API para carritos
app.use("/", viewsRouter);                // Rutas de las vistas (Handlebars)

// Configuración de Socket.io
io.on('connection', (socket) => {
    socket.on('crearProducto', async (producto) => {
        try {
            const nuevoProducto = await ProductosMongoManager.create(producto);
            const products = await ProductosMongoManager.get({}, { lean: true });
            
            // Asegúrate de enviar el array de documentos correctamente
            io.emit('productosActualizados', products.docs || products); // Usa products.docs si existe, sino products directamente
        } catch (error) {
            console.error("Error en crearProducto:", error);
            socket.emit('error', { message: 'No se pudo crear el producto', error: error.message });
        }
    });

    socket.on('eliminarProducto', async (id) => {
        try {
            await ProductosMongoManager.delete(id);
            const products = await ProductosMongoManager.get({}, { lean: true });
            io.emit('productosActualizados', products.docs || products);
        } catch (error) {
            console.error("Error en eliminarProducto:", error);
            socket.emit('error', { message: 'No se pudo eliminar el producto', error: error.message });
        }
    });
});

io.on('connection', (socket) => {
    socket.on('eliminarCarrito', async (cartId) => {
        try {
            await cartModelo.findByIdAndDelete(cartId);
            io.emit('carritoEliminado', cartId);
        } catch (error) {
            console.error('Error al eliminar carrito:', error);
        }
    });
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { error: 'Error en el servidor' });
});

// Iniciar el servidor
const PORT = config.PORT;
httpServer.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`El puerto ${PORT} ya está en uso`);
    } else {
        console.error('Error al iniciar el servidor:', err);
    }
});

conectarDB(
    config.MONGO_URL,
    config.DB_NAME
)