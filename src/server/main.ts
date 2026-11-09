import * as ws from "ws";
import * as room from "./room";
import * as http from "http";


let waitingPlayer: { socket: ws.WebSocket; name: string } | null = null;


const server = http.createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    if (req.method === "GET" && req.url === "/status" ) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ online: wsConnection.clients.size,}))

    }else {
        res.writeHead(404);
        res.end("Not Found");
    }

})

const wsConnection = new ws.WebSocketServer({ server });

wsConnection.on("connection", (socket,req) => {
    const url = new URL(req.url ?? "", "http://localhost");
    const name = url.searchParams.get("name") || "Player";

    if (waitingPlayer === null) {
        waitingPlayer = { socket, name };
        socket.on("close", () => {
            if (waitingPlayer?.socket === socket) { waitingPlayer = null; }
        })
    }else{
        new room.Room(waitingPlayer.socket, waitingPlayer.name, socket, name);
        waitingPlayer = null
    }


})

server.listen(8080, () => console.log("Server listening on http://localhost:8080"));

