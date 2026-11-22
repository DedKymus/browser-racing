import type * as types from "../shared/types";



export class NetworkClient {
    private socket: WebSocket | null = null;


    public sendControls (controls: types.CarControls): void {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(controls))
        }
    }

    public connect(
        data: types.JoinRequest,
        onState: (state: types.GameState) => void,
        onRoomCode?: (code: string) => void
    ): void {
        const params = new URLSearchParams({ mode: data.mode, name: data.name });

        if (data.mode === "join") {
            params.set("room", data.room);
        }
        this.socket = new WebSocket("ws://localhost:8080?" + params.toString());
        this.socket.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if ("roomCode" in msg && typeof msg.roomCode === "string") {
                onRoomCode?.(msg.roomCode);
                return;
            }
            onState(msg as types.GameState);
        };
    }

}