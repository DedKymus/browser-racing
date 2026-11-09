import type * as types from '../shared/types'

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

    public getControls(): types.CarControls {
        return {
            up: this.isPressed("KeyW"),
            down: this.isPressed("KeyS"),
            right: this.isPressed("KeyD"),
            left: this.isPressed("KeyA"),
        };
    }
}