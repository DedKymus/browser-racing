import type * as types from "../types"
import * as CONST from "../constants"

export function create (): TrafficManager {
    return new TrafficManager()
}

export class TrafficManager {
    private bots: types.BotTrafficCar[] = [];
    private nextId: number = 0;
    private nextSpawnZ: number = -CONST.SPAWN_AHEAD;

    public spawnBot(): void{
        const lane = Math.random() < 0.5 ? 0 : 1;
        const x = CONST.LANES[lane];
        this.bots.push({
            id: this.nextId++,
            lane: lane,
            position: { x: x, z: this.nextSpawnZ },
            speed: CONST.BOT_SPEED,
        });
        this.nextSpawnZ -= CONST.MIN_SPAWN_STEP;
    }

    public update(dt: number,leadZ: number): void {
        if (leadZ - this.nextSpawnZ < CONST.SPAWN_AHEAD) {
            this.spawnBot();
        }
        for (const bot of this.bots) {
            bot.position.z -= bot.speed * dt;
        }
        const firstBot = this.bots[0];
        if (firstBot && firstBot.position.z > leadZ + CONST.DESPAWN_BEHIND) {
            this.bots.shift();
        }
    }

    public getBots(): types.BotTrafficCar[] {
        return this.bots;
    }
}