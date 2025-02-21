const express = require('express');
const { engine } = require("express-handlebars")
const cartsRouter = require("./routes/cartsRouter.js")
const productsRouter = require("./routes/productsRouter.js")
const viewsRouter = require("./routes/viewsRouter.js")
const PORT = 8080;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine("handlebars", engine())
app.set("view engine", "handlebars")
app.set("views", "./src/views")

app.use("/api/products", productsRouter)
app.use("/api/carts", cartsRouter)
app.use("/", viewsRouter)

app.get('/',(req,res)=>{
    res.setHeader('Content-Type','text/plain');
    res.status(200).send('OK');
})

app.listen(PORT, () => {
    console.log(`Server on line en puerto http://localhost:${PORT}`);
});