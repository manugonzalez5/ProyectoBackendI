const socket = io();
const divTemperatura = document.getElementById('temperatura');

socket.on('nuevaTemperatura', (temperatura) => {
    divTemperatura.textContent = `La temperatura es: ${temperatura}°`;
});

socket.on("nuevoProducto", (product) => {
    console.log(product);
    alert(`Se ha agregado un nuevo producto: ${product.title}`);
});