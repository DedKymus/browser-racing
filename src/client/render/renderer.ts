import type * as types from "../../shared/types";
import * as context from "./context";
import type * as view from "./views/view";
import * as lobbyView from "./views/lobby-view";
import * as raceView from "./views/race-view";

export class Renderer  {
    private lobby: lobbyView.LobbyView;
    private race : raceView.RaceView;
    private current: view.View;

    constructor(container:HTMLElement){
        const ctx = context.createContext(container);
        this.lobby = new lobbyView.LobbyView(ctx);
        this.race = new raceView.RaceView(ctx);
        this.current = this.lobby;
        this.current.enter();

        window.addEventListener("resize", () => {
            this.current.resize(window.innerWidth, window.innerHeight)
        });

    }

    public onJoin(callback: (data: types.JoinRequest) => void): void {
        this.lobby.onJoin(callback);
    }

    public setLobbyStatus(text: string): void {
        this.lobby.setStatus(text);
    }

    public recordStep(): void {
        this.race.recordStep();
    }

    public showLobby(): void {
        this.switchTo(this.lobby);
    }

    public showRace(): void {
        this.switchTo(this.race);
    }

    public sync(state: types.GameState): void {
        this.race.sync(state);
    }

    public render(): void {
        this.current.render();
    }

    private switchTo(next: view.View): void {
        if (this.current === next) return;
        this.current.exit();
        this.current = next;
        next.resize(window.innerWidth, window.innerHeight);
        next.enter();
    }
}