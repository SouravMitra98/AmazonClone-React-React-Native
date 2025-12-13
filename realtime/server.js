const {Server} = require("socket.io");
const io = new Server(9000, {cors: {origin: ""}});

let carts = {};

io.on("connection", (socket)=>{
    socket.on("joincart", (user_id)=>{
        socket.join(user_id);
    });

    socket.on("updateCart", ({user_id, cart})=>{
        carts[user_id] = cart;
        io.to(user_id).emit("cartUpdate", cart);
        io.emit("cart_broadcast", {user_id,cart});
    });

    socket.on("disconnect", () => {});
});

console.log("Realtime cart server is running on: 9000")