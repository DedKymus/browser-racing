export class Lobby {
    private element: HTMLElement;

    constructor(container: HTMLElement) {
        this.element = document.createElement("div");
        this.element.style.cssText = `
        position: fixed; 
        top: 44%; 
        right: 43%; 
        transform:translateY(-50%); 
        padding: 20px; 
        background: rgba(0, 0, 0, 0.8); 
        border: 1px solid #00ff00; 
        color: #00ff00; 
        font-family: monospace; 
        display: flex; 
        flex-direction: column; 
        gap: 10px;
        `;
        this.element.innerHTML = `
        <input type="text" placeholder="Enter your name">
        <button>Найти игру</button>
        <span></span>
        `;
        container.appendChild(this.element);
    }

    public onJoin(callback: (name: string) => void): void {
        const input = this.element.querySelector("input");
        const button = this.element.querySelector("button");
        const status = this.element.querySelector("span");

        button?.addEventListener("click", () => {
            const name = input?.value.trim() || "Player";

            if (status) {
                status.textContent = "Search game...";
            }
            if (button) button.disabled = true;
            callback(name);
        });
    }

    public hide(): void {
        this.element.style.display = "none";
    }
}
