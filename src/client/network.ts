import type * as types from "../shared/types";


export class NetworkClient {
    private socket: WebSocket | null = null;

    public sendControls (controls: types.CarControls): void {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(controls))
        }
    }

    public connect(name: string, onState: (state: types.GameState) => void): void {
        this.socket = new WebSocket("ws://localhost:8080?name=" + encodeURIComponent(name))
        this.socket.onmessage = (event) => {
            const state: types.GameState = JSON.parse(event.data);
            onState(state);
        }
    }

}