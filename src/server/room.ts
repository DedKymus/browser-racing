import * as ws from 'ws'
import * as carPhysics from '../shared/car-physics';
import type * as types from '../shared/types';
import * as logger from './infra/logger'

export interface RoomParams {
    playerA: ws.WebSocket,
    playerB: ws.WebSocket,
    nameA: string,
    nameB: string,
    logger: logger.Logger,
    onClose: () => void,
}



export class Room {
    private carPlayerA: carPhysics.Car;
    private carPlayerB: carPhysics.Car;

    private nameA: string;
    private nameB: string;

    private playerSocketA: ws.WebSocket;
    private playerSocketB: ws.WebSocket;

    private controlA: types.CarControls = {up: false, down: false, left: false, right: false};
    private controlB: types.CarControls = {up: false, down: false, left: false, right: false};

    private lastTime: number = performance.now();
    private timer: NodeJS.Timeout;

    private logger: logger.Logger;
    private isStopped: boolean = false;
    private onClose: () => void;

    constructor(params: RoomParams) {
        this.onClose = params.onClose;

        this.logger = params.logger;
        this.logger.info("Room started", { playerA: params.nameA, playerB: params.nameB });

        this.carPlayerA = new carPhysics.Car(-2, 0);
        this.carPlayerB = new carPhysics.Car(2, 0);

        this.nameA = params.nameA;
        this.nameB = params.nameB;

        this.playerSocketA = params.playerA;
        this.playerSocketB = params.playerB;

        this.timer = setInterval(() => this.tick(), 1000 / 130)// TODO: fix this to 60 and jerks between packets

        this.playerSocketA.on("close", () => this.stop())
        this.playerSocketB.on("close", () => this.stop())

        this.playerSocketA.on("message", (data) => {
            this.controlA = JSON.parse(data.toString()) ;
        })
        this.playerSocketB.on("message", (data) => {
            this.controlB = JSON.parse(data.toString()) ;
        })

    }

    private tick() {
        let now = performance.now()
        let dt = (now - this.lastTime) / 1000
        this.lastTime = now

        this.carPlayerA.update(dt, this.controlA)
        this.carPlayerB.update(dt, this.controlB)

        carPhysics.resolveCarCollision(this.carPlayerA, this.carPlayerB)

        const stateA = this.carPlayerA.toState();
        const stateB = this.carPlayerB.toState();

        let payloadA:types.GameState = {you: {name: this.nameA, carState: stateA}, enemy: {name: this.nameB, carState: stateB}}
        let payloadB:types.GameState = {you: {name: this.nameB, carState: stateB}, enemy: {name: this.nameA, carState: stateA}}

        this.playerSocketA.send(JSON.stringify(payloadA))
        this.playerSocketB.send(JSON.stringify(payloadB))

    }

    public stop(): void {
        if (this.isStopped) return;
        this.isStopped = true;
        this.logger.info("Room stopped", { playerA: this.nameA, playerB: this.nameB });

        clearInterval(this.timer);
        this.playerSocketA.close();
        this.playerSocketB.close();
        this.onClose();
    }
}