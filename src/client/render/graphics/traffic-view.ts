import * as THREE from 'three';
import * as trafficModel from '../models/traffic-model'

import type * as context from "../context";
import type * as types from "../../../shared/types";

export class TrafficView {
    public mesh: THREE.Group = new THREE.Group();
    private botMeshes: Map<number, THREE.Group> = new Map();

    private readonly model: trafficModel.TrafficModel;

    constructor(materials: context.Materials) {
        this.model = new trafficModel.TrafficModel(materials.toonGradient, materials.inkLineMat);
    }

    public sync(bots: types.BotTrafficCar[]): void{
        for (const bot of bots) {
            let botMesh = this.botMeshes.get(bot.id)
            if (!botMesh){
                botMesh = this.model.createBotMesh();
                this.mesh.add(botMesh);
                this.botMeshes.set(bot.id, botMesh);

            }
            botMesh.position.x = bot.position.x;
            botMesh.position.z = bot.position.z;
        }

        for (const [id , group] of this.botMeshes) {
            if (bots[0] && id < bots[0].id) {
                this.mesh.remove(group);
                this.botMeshes.delete(id);
            }
        }
    }
}