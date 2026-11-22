import * as http from "http";
import * as ws from "ws";
import * as room from "./room";
import type * as config from "./infra/config";
import type * as logger from "./infra/logger";


export class GameServer {
    private config: config.ServerConfig;
    private logger: logger.Logger;
    private httpServer!: http.Server;
    private wsServer!: ws.WebSocketServer;
    private waitingPlayer: { socket: ws.WebSocket; name: string } | null = null;

    private rooms: Set<room.Room> = new Set();
    private privateRooms: Map<string, { socket: ws.WebSocket; name: string }> = new Map();

    constructor(cfg: config.ServerConfig, logger: logger.Logger) {
        this.config = cfg;
        this.logger = logger;

        this.up();
    }

    private  up() {
        this.httpServer = http.createServer((req, res) => {
            res.setHeader("Access-Control-Allow-Origin", "*");
            if (req.method === "GET" && req.url === "/status" ) {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ online: this.wsServer.clients.size, rooms: this.rooms.size }))

            }else {
                res.writeHead(404);
                res.end("Not Found");
            }
        })

        this.wsServer = new ws.WebSocketServer({ server: this.httpServer });
        this.wsServer.on("connection", (socket, req) => {
            const url = new URL(req.url ?? "", "http://localhost");
            const name = url.searchParams.get("name") || "Player";
            const mode = url.searchParams.get("mode") || "random";
            const roomCode = url.searchParams.get("room") || "";
            if (mode === "create") {
                const code = String(Math.floor(1000 + Math.random() * 9000));
                this.privateRooms.set(code, { socket, name });
                socket.send(JSON.stringify({ roomCode: code }));
                socket.on("close", () => this.privateRooms.delete(code));

            } else if (mode === "join"){
                const host = this.privateRooms.get(roomCode);
                if (!host) {
                    socket.close();
                    return;
                }
                this.privateRooms.delete(roomCode);
                this.createRoom(host,{socket,name})
            }else {
                if (this.waitingPlayer === null) {
                    this.waitingPlayer = {socket, name};
                    socket.on("close", () => {
                        if (this.waitingPlayer?.socket === socket) {
                            this.waitingPlayer = null;
                        }
                    })
                }else {
                    this.createRoom(this.waitingPlayer, { socket, name });
                    this.waitingPlayer = null;
                }
                
            }
        })
    }

    public start(): void {
        this.httpServer.listen(this.config.port, this.config.host, () => {
            this.logger.info("Server listening", { host: this.config.host, port: this.config.port });
        })

        process.on("SIGINT", () => this.stop());
        process.on("SIGTERM", () => this.stop());
        process.on("SIGBREAK", () => this.stop());
    }

    public stop(): void {
        this.logger.info("Shutting down server...")
        for ( const r of this.rooms){
            r.stop()
        }
        this.wsServer.close()
        this.httpServer.close(() => process.exit(0))
    }

    private createRoom(playerA: { socket: ws.WebSocket; name: string }, playerB: { socket: ws.WebSocket; name: string }) {
        const gameRoom = new room.Room({
            playerA: playerA.socket,
            playerB: playerB.socket,
            nameA: playerA.name,
            nameB: playerB.name,
            logger: this.logger,
            onClose: () => {
                this.rooms.delete(gameRoom);
            },
        });
        this.rooms.add(gameRoom);
    }
}