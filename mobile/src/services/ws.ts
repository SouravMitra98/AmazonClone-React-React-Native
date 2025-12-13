import {io} from "socket.io-client";
import {WS_URL} from "./env";

let socket: any = null;

export function connectSocket(user_id: string, onCartUpdate?:(cart: any)=> void)
{
    if(socket) socket.disconnect();
    socket = io(WS_URL, {transports: ["websocket"], query:{user_id}});
    socket.on("connect", ()=> console.log("WS connected"));
    socket.on("disconnect", ()=>console.log("WS disconnected"));
    socket.on("cartUpdated", (cart:any)=> onCartUpdate && onCartUpdate(cart));
    return socket;
}

export function emitUpdatedCart(user_id:string, cart:any){
    if (!socket) return;
    socket.emit("updatedCart", {user_id, cart});
}