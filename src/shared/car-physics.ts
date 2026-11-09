import type * as types from "./types";

export class Car {
    public x: number = 0;
    public z: number = 0;
    public heading: number = 0;
    public speed: number = 25;

    private readonly SpeedBase = 25;
    private readonly SpeedUp = 33;
    private readonly SpeedDown = 18;
    private readonly TurnRate = 2.0;
    private readonly MaxHeading = Math.PI / 4;

    public pushVx: number = 0;
    public static readonly Width = 2.0;
    public static readonly Length = 4.0;

    constructor(startX: number = 0, startZ: number = 0) {
        this.x = startX;
        this.z = startZ;
    }

    public update(dt: number, controls: types.CarControls): void {
        let targetSpeed = this.SpeedBase;

        if (controls.up) {
            targetSpeed = this.SpeedUp;
        } else if (controls.down) {
            targetSpeed = this.SpeedDown;
        }

        this.speed += (targetSpeed - this.speed) * 5 * dt;

        this.z -= Math.cos(this.heading) * this.speed * dt;
        this.x += (-Math.sin(this.heading) * this.speed + this.pushVx) * dt;

        this.pushVx *= Math.max(0, 1 - 4 * dt);

        // there was a bug here))

        if (controls.left) {
            this.heading += this.TurnRate * dt;
        } else if (controls.right) {
            this.heading -= this.TurnRate * dt;
        } else {
            this.heading *= (1 - 5 * dt);
        }

        this.heading = Math.max(-this.MaxHeading, Math.min(this.MaxHeading, this.heading));
    }

    public toState(): types.CarState {
        return { position: { x: this.x, z: this.z }, heading: this.heading, speed: this.speed }
    }

    public applyState(state: types.CarState): void {
        this.x = state.position.x
        this.z = state.position.z
        this.heading = state.heading
        this.speed = state.speed
    }
}

export function resolveCarCollision(carA: Car, carB: Car) {
    const dx = carA.x - carB.x;
    const dz = carA.z - carB.z;

    const overlapX = Car.Width - Math.abs(dx);
    const overlapZ = Car.Length - Math.abs(dz);

    if (overlapX <= 0 || overlapZ <= 0) {
        return
    }

    if (overlapX < overlapZ) {
        const pushDirectionX = dx >= 0 ? 1 : -1;
        carA.x += (overlapX / 2) * pushDirectionX;
        carB.x -= (overlapX / 2) * pushDirectionX;

        const sideSpeedA = -Math.sin(carA.heading) * carA.speed;
        const sideSpeedB = -Math.sin(carB.heading) * carB.speed;
        const sideImpact = sideSpeedA - sideSpeedB;

        carA.pushVx = -sideImpact * 0.6 + pushDirectionX * 6;
        carB.pushVx = sideImpact * 0.6 - pushDirectionX * 6;
        carA.heading *= 0.3;
        carB.heading *= 0.3;
    } else {
        const pushDirectionZ = dz >= 0 ? 1 : -1;
        carA.z += (overlapZ / 2) * pushDirectionZ;
        carB.z -= (overlapZ / 2) * pushDirectionZ;

        if (pushDirectionZ > 0) {
            carB.speed = Math.max(carB.speed, carA.speed * 1.05);
            carA.speed *= 0.85;
        } else {
            carA.speed = Math.max(carA.speed, carB.speed * 1.05);
            carB.speed *= 0.85;
        }
    }

}