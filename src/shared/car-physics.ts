import type * as types from "./types";
import * as CONST from "./constants";

export class Car {
    public x: number = 0;
    public z: number = 0;
    public heading: number = 0;
    public speed: number = CONST.SPEED_BASE;

    public pushVx: number = 0;
    public static readonly Width = CONST.WIDTH;
    public static readonly Length = CONST.LENGTH;

    constructor(startX: number = 0, startZ: number = 0) {
        this.x = startX;
        this.z = startZ;
    }

    public update(dt: number, controls: types.CarControls): void {
        let targetSpeed = CONST.SPEED_BASE;

        if (controls.up) {
            targetSpeed = CONST.SPEED_UP;
        } else if (controls.down) {
            targetSpeed = CONST.SPEED_DOWN;
        }

        this.speed += (targetSpeed - this.speed) * 5 * dt;

        this.z -= Math.cos(this.heading) * this.speed * dt;
        this.x += (-Math.sin(this.heading) * this.speed + this.pushVx) * dt;

        this.pushVx *= Math.max(0, 1 - 4 * dt);

        if (controls.left) {
            this.heading += CONST.TURN_RATE * dt;
        } else if (controls.right) {
            this.heading -= CONST.TURN_RATE * dt;
        } else {
            this.heading *= (1 - 5 * dt);
        }

        this.heading = Math.max(-CONST.MAX_HEADING, Math.min(CONST.MAX_HEADING, this.heading));

        // logic of the border
        const maxX = CONST.ROAD_WIDTH / 2 - CONST.WIDTH / 2;
        if (Math.abs(this.x) > maxX) {
            const side = this.x > 0 ? 1 : -1;
            this.x = side * maxX;
            this.pushVx = -side * 8;
            this.heading *= 0.3;
            this.speed *= 0.85;
        }
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

export function resolveBotCollision(car: Car, bots: types.BotTrafficCar[]): void {
    for (const bot of bots) {
        const dx = car.x - bot.position.x;
        const dz = car.z - bot.position.z;

        const overlapX = Car.Width - Math.abs(dx);
        const overlapZ = Car.Length - Math.abs(dz);

        if (overlapX <= 0 || overlapZ <= 0) {
            continue;
        }

        if (overlapX < overlapZ) {
            const pushDirectionX = dx >= 0 ? 1 : -1;
            car.x += overlapX * pushDirectionX;

            const sideSpeed = -Math.sin(car.heading) * car.speed;
            car.pushVx = -sideSpeed * 0.6 + pushDirectionX * 8;
            car.heading *= 0.3;
        } else {
            const pushDirectionZ = dz >= 0 ? 1 : -1;
            car.z += overlapZ * pushDirectionZ;

            if (pushDirectionZ > 0) {
                car.speed = Math.min(car.speed, bot.speed * 0.7);
            } else {
                car.speed = Math.max(car.speed, bot.speed * 1.1);
            }
        }
    }
}