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
            if (this.waitingPlayer === null) {
                this.waitingPlayer = {socket, name};
                socket.on("close", () => {
                    if (this.waitingPlayer?.socket === socket) {
                        this.waitingPlayer = null;
                    }
                })
            } else {
                let roomParams: room.RoomParams = {
                    playerA: this.waitingPlayer.socket,
                    playerB: socket,
                    nameA: this.waitingPlayer.name,
                    nameB: name,
                    logger: this.logger,
                    onClose: () => {
                        this.rooms.delete(gameRoom);
                    }
                }
                const gameRoom = new room.Room(roomParams);
                this.rooms.add(gameRoom);
                this.waitingPlayer = null;
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
}