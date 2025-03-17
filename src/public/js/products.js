const socket = io();

socket.on("nuevoProducto", () => {
    window.location.reload();
});