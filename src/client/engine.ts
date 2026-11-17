import type * as types from '../shared/types';
import type * as input from './input';
import type * as network from './network';
import type * as renderer from './render/renderer';

export interface EngineParams {
    renderer: renderer.Renderer;
    input: input.Input;
    network: network.NetworkClient;
}

export class Engine {
    private renderer: renderer.Renderer;
    private input: input.Input;
    private network: network.NetworkClient;

    private state: types.GameState | null = null;

    private lastTime: number = 0;
    private accumulator: number = 0;
    private readonly FIXED_DT: number = 1 / 60;

    constructor(params: EngineParams) {
        this.renderer = params.renderer;
        this.input = params.input;
        this.network = params.network;

        this.renderer.onJoin((name) => {
            this.network.connect(name, (state) => {
                if (this.state === null) {
                    this.renderer.showRace();
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
            this.renderer.recordStep()
            this.update(this.FIXED_DT);
            this.accumulator -= this.FIXED_DT;
        }

        if (shouldRender) {
            this.renderer.render();
        }

        requestAnimationFrame((nextNow) => this.Loop(nextNow));
    }

    private update(_dt: number): void {
        if (this.state === null) return;

        this.network.sendControls(this.input.getControls());
        this.renderer.sync(this.state);
    }
}
