import styles from "./lobby.module.css";

export type JoinRequest =
    | { mode: "random"; name: string }
    | { mode: "join"; name: string; room: string }
    | { mode: "create"; name: string };

export class Lobby {
    private menu: HTMLElement;
    private nameInput: HTMLInputElement;
    private roomInput: HTMLInputElement;
    private status: HTMLElement;
    private buttons: HTMLButtonElement[];

    constructor(container: HTMLElement) {
        this.menu = document.createElement("div");
        this.menu.classList.add(styles["menu"]!);
        this.menu.innerHTML = `
            <h1>Road Race</h1>
            <input type="text" data-role="name" placeholder="Enter your name">

            <button data-role="random">Find random player</button>

            <div data-role="divider">or play with friends</div>

            <input type="text" data-role="room-code" placeholder="Room code">
            <div data-role="row">
                <button data-role="join">Join room</button>
                <button data-role="create">Create room</button>
            </div>

            <span data-role="status"></span>
        `;
        container.appendChild(this.menu);

        this.nameInput = this.menu.querySelector('[data-role="name"]')!;
        this.roomInput = this.menu.querySelector('[data-role="room-code"]')!;
        this.status = this.menu.querySelector('[data-role="status"]')!;
        this.buttons = Array.from(this.menu.querySelectorAll("button"));
    }

    public onJoin(callback: (req: JoinRequest) => void): void {
        const name = () => this.nameInput.value.trim() || "Player";

        this.on("random", () => {
            this.setSearching("Searching for opponent...");
            callback({ mode: "random", name: name() });
        });

        this.on("join", () => {
            const room = this.roomInput.value.trim();
            if (room === "") {
                this.status.textContent = "Enter room code";
                return;
            }
            this.setSearching("Joining room...");
            callback({ mode: "join", name: name(), room });
        });

        this.on("create", () => {
            this.setSearching("Creating room...");
            callback({ mode: "create", name: name() });
        });
    }

    private on(role: string, handler: () => void): void {
        this.menu
            .querySelector(`[data-role="${role}"]`)
            ?.addEventListener("click", handler);
    }

    private setSearching(text: string): void {
        this.status.textContent = text;
        this.buttons.forEach((b) => (b.disabled = true));
    }

    public setStatus(text: string): void {
        this.status.textContent = text;
    }

    public hide(): void {
        this.menu.style.display = "none";
    }

    public show(): void {
        this.menu.style.display = "flex";
        this.status.textContent = "";
        this.buttons.forEach((b) => (b.disabled = false));
    }
}