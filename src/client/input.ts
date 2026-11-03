export class Input  {
    private keys: Set<string> = new Set<string>();

    constructor() {
        window.addEventListener('keydown', (e) => {
            this.keys.add(e.code);
        })

        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.code);
        })

        window.addEventListener('blur',() => {
            this.keys.clear()
        })
    }

    public isPressed(code:string):boolean {
        return this.keys.has(code);
    }
}