import * as THREE from "three";
import * as chunkManager from "../../../shared/world/chunk-manager";
import type * as types from "../../../shared/types";
import * as toon from "./toon";
import * as roadModel from "../models/road-model";
import * as sceneryModel from "../models/scenery-model";

export class TrackView {
    public mesh: THREE.Group = new THREE.Group();
    private chunkMeshes: Map<number, THREE.Group> = new Map();
    private chunkManager: chunkManager.ChunkManager | null = null;
    private lobbyRoad: THREE.Group;

    private readonly road: roadModel.RoadModel;
    private readonly scenery: sceneryModel.SceneryModel;

    constructor() {
        const gradientMap = toon.createToonGradient();
        const inkLineMat = new THREE.LineBasicMaterial({ color: 0x05000a });

        this.road = new roadModel.RoadModel(gradientMap, inkLineMat);
        this.scenery = new sceneryModel.SceneryModel(gradientMap, inkLineMat);

        this.lobbyRoad = this.createChunkMesh({
            index: -1,
            start: 50,
            end: -50,
            rails: [],
        });
        this.mesh.add(this.lobbyRoad);
    }

    public sync(seed: number, playerCordZ: number): void {
        if (this.chunkManager === null) {
            this.mesh.remove(this.lobbyRoad);
            this.scenery.reset();
            this.chunkManager = chunkManager.create(seed);
        }
        this.chunkManager.update(playerCordZ);
        const activeChunks = this.chunkManager.getChunks();

        for (const chunk of activeChunks) {
            if (!this.chunkMeshes.has(chunk.index)) {
                const chunkMesh = this.createChunkMesh(chunk);
                this.mesh.add(chunkMesh);
                this.chunkMeshes.set(chunk.index, chunkMesh);
            }
        }

        for (const [index, group] of this.chunkMeshes) {
            if (activeChunks[0] && index < activeChunks[0].index) {
                this.mesh.remove(group);
                this.chunkMeshes.delete(index);
            }
        }

        this.scenery.animate();
    }

    private createChunkMesh(chunk: types.Chunk): THREE.Group {
        const group = new THREE.Group();
        this.road.build(group, chunk);

        const nextRand = (): number => {
            return this.chunkManager ? this.chunkManager.nextRandom() : 0.5;
        };
        this.scenery.populateChunk(group, chunk, this.road.roadWidth, nextRand);

        return group;
    }
}
