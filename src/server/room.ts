import * as ws from 'ws'
import * as carPhysics from '../shared/car-physics';
import type * as types from "../shared/types";

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

    constructor(playerA: ws.WebSocket, nameA: string, playerB: ws.WebSocket, nameB: string) {
        this.carPlayerA = new carPhysics.Car(-2, 0);
        this.carPlayerB = new carPhysics.Car(2, 0);

        this.nameA = nameA;
        this.nameB = nameB;

        this.playerSocketA = playerA;
        this.playerSocketB = playerB;

        const timer = setInterval(() => this.tick(), 1000 / 288)// TODO: fix this to 60 and jerks between packets

        this.playerSocketA.on("close", () => clearInterval(timer))
        this.playerSocketB.on("close", () => clearInterval(timer))

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
}