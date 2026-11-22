import styles from "./hud.module.css";

export class Hud {
    private dashboard: HTMLDivElement;
    private steps: number = 0;

    constructor(container: HTMLElement) {
        this.dashboard = document.createElement("div");
        this.dashboard.classList.add(styles["dashboard"]!);
        container.appendChild(this.dashboard);
        this.dashboard.style.display = "none";
    }

    public recordPhysicsStep(): void {
        this.steps++;
    }

    public show(): void {
        this.dashboard.style.display = "";
    }

    public hide(): void {
        this.dashboard.style.display = "none";
    }
}
