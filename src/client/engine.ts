import * as input from './input';
import * as carPhysics from '../shared/car-physics';
import * as hud from './hud';
import * as network from './network';
import * as lobby from './lobby';
import * as renderer from './renderer';

export class Engine {
    private renderer: renderer.Renderer;
    private hud: hud.Hud;
    private lobby: lobby.Lobby;
    private input: input.Input = new input.Input();
    private network: network.NetworkClient = new network.NetworkClient();

    private playerCar: carPhysics.Car = new carPhysics.Car(0, 0);
    private enemyCar: carPhysics.Car | null = null;
    private isPlaying: boolean = false;

    private lastTime: number = 0;
    private accumulator: number = 0;
    private readonly FIXED_DT: number = 1 / 60;

    constructor(container: HTMLElement) {
        this.renderer = new renderer.Renderer(container);
        this.hud = new hud.Hud(container);

        this.lobby = new lobby.Lobby(container, (name) => {
            this.network.connect(name, (state) => {
                if (!this.isPlaying) {
                    this.isPlaying = true;
                    this.lobby.hide();
                    this.enemyCar = new carPhysics.Car(4, 0);
                    this.renderer.startRaceView();
                }
                this.playerCar.applyState(state.you.carState);
                this.enemyCar?.applyState(state.enemy.carState);
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

        this.hud.update(frameTime, this.playerCar.speed);
        requestAnimationFrame((nextNow) => this.Loop(nextNow));
    }

    private update(_dt: number): void {
        if (!this.isPlaying) return;

        this.network.sendControls(this.input.getControls());
        this.renderer.sync(this.playerCar, this.enemyCar);
    }
}
