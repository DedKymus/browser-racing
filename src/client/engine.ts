import type * as types from '../shared/types';
import type * as input from './input';
import type * as hud from './ui/hud';
import type * as network from './network';
import type * as lobby from './ui/lobby';
import type * as renderer from './render/renderer';

export interface EngineParams {
    renderer: renderer.Renderer;
    hud: hud.Hud;
    lobby: lobby.Lobby;
    input: input.Input;
    network: network.NetworkClient;
}

export class Engine {
    private renderer: renderer.Renderer;
    private hud: hud.Hud;
    private lobby: lobby.Lobby;
    private input: input.Input;
    private network: network.NetworkClient;

    private state: types.GameState | null = null;

    private lastTime: number = 0;
    private accumulator: number = 0;
    private readonly FIXED_DT: number = 1 / 60;

    constructor(params: EngineParams) {
        this.renderer = params.renderer;
        this.hud = params.hud;
        this.lobby = params.lobby;
        this.input = params.input;
        this.network = params.network;

        this.lobby.onJoin((name) => {
            this.network.connect(name, (state) => {
                if (this.state === null) {
                    this.lobby.hide();
                    this.renderer.startRaceView();
                }
                this.state = state;
            });
        });
    }

    public start(): void {
        this.lastTime = performance.now();
        requestAnimationFrame((now) => this.Loop(now));
    }

    private Loop(now: number): void {
        const frameTime = Math.min((now - this.lastTime) / 1000, 0.1);
        this.lastTime = now;
        this.accumulator += frameTime;

        let shouldRender = false;
        while (this.accumulator >= this.FIXED_DT) {
            shouldRender = true;
            this.hud.recordPhysicsStep();
            this.update(this.FIXED_DT);
            this.accumulator -= this.FIXED_DT;
        }

        if (shouldRender) {
            this.renderer.render();
        }

        const currentSpeed = this.state?.you.carState.speed ?? 0;
        this.hud.update(frameTime, currentSpeed);
        requestAnimationFrame((nextNow) => this.Loop(nextNow));
    }

    private update(_dt: number): void {
        if (this.state === null) return;

        this.network.sendControls(this.input.getControls());
        this.renderer.sync(this.state);
    }
}
