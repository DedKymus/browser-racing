import styles from './ui.module.css';

export class Hud {


    private dashboard: HTMLDivElement;
    private leftBorder: HTMLDivElement;
    private rightBorder: HTMLDivElement;

    // private frames: number = 0;
    private steps: number = 0;
    // private timer: number = 0;
    // private displayFps: number = 0;
    // private displaySteps: number = 0;
    // private displayFrameMs: number = 0;

    constructor(container: HTMLElement) {
        //dashboard
        this.dashboard = document.createElement("div");
        this.dashboard.classList.add(styles["dashboard"]!);
        container.appendChild(this.dashboard);
        this.dashboard.style.display = "none";

        //boarder
        this.leftBorder = document.createElement("div");
        this.leftBorder.classList.add(styles["leftBorder"]!);


        this.rightBorder = document.createElement("div");
        this.rightBorder.classList.add(styles["rightBorder"]!);


        //metric
    }

    public recordPhysicsStep(): void {
        this.steps++
    }

    public show(): void {
        this.dashboard.style.display = "";
    }

    public hide(): void {
        this.dashboard.style.display = "none";
    }

    // public update(frameTimeSec:number, speed:number): void {
    //     this.frames++;
    //     this.timer += frameTimeSec;
    //     this.displayFrameMs = frameTimeSec * 1000;
    //
    //     if (this.timer >= 0.5) {
    //         this.displayFps = Math.round(this.frames / this.timer);
    //         this.displaySteps = Math.round(this.steps / this.timer);
    //         this.frames = 0;
    //         this.steps = 0;
    //         this.timer = 0;
    //     }
    //
    //     //const kmh = Math.round(speed * 3.6);
    // }
}