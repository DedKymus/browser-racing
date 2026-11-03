export class Hud {
    private element: HTMLDivElement;
    private frames: number = 0;
    private steps: number = 0;
    private timer: number = 0;
    private displayFps: number = 0;
    private displaySteps: number = 0;
    private displayFrameMs: number = 0;

    constructor(container: HTMLElement) {
        this.element = document.createElement("div");
        this.element.style.cssText = `
            position: fixed;
            top: 12px;
            left: 12px;
            padding: 8px 12px;
            background: rgba(0, 0, 0, 0.7);
            border: 1px solid #aaaaaa;
            color: #00ff00;
            font-family: monospace;
            font-size: 13px;
            line-height: 1.5;
            pointer-events: none;
            user-select: none;
        `;
        container.appendChild(this.element);
    }

    public recordPhysicsStep(): void {
        this.steps++;
    }

    public update(frameTimeSec:number, speed:number): void {
        this.frames++;
        this.timer += frameTimeSec;
        this.displayFrameMs = frameTimeSec * 1000;

        if (this.timer >= 0.5) {
            this.displayFps = Math.round(this.frames / this.timer);
            this.displaySteps = Math.round(this.steps / this.timer);
            this.frames = 0;
            this.steps = 0;
            this.timer = 0;
        }

        const kmh = Math.round(speed * 3.6);
        this.element.innerHTML = `
               <b>SPEED:</b> ${kmh} km/h<br/>
            <span style="color: #aaa; font-size: 11px;">
                FPS: ${this.displayFps} | Sim: ${this.displaySteps} steps/s | Frame: ${this.displayFrameMs.toFixed(1)} ms
            </span>
        `;
    }
}