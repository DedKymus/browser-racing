import * as THREE from "three";
import * as chunkManager from "../../../shared/world/chunk-manager";
import * as roadModel from "../models/road-model";
import * as sceneryModel from "../models/scenery-model";

import type * as context from "../context";
import type * as types from "../../../shared/types";

export class TrackView {
    public mesh: THREE.Group = new THREE.Group();
    private chunkMeshes: Map<number, THREE.Group> = new Map();
    private chunkManager: chunkManager.ChunkManager | null = null;

    private readonly road: roadModel.RoadModel;
    private readonly scenery: sceneryModel.SceneryModel;

    constructor(materials: context.Materials) {
        this.road = new roadModel.RoadModel(materials.toonGradient, materials.inkLineMat);
        this.scenery = new sceneryModel.SceneryModel(materials.toonGradient, materials.inkLineMat);
    }

    public buildLobby(): void {
        this.mesh.add(this.createChunkMesh({ index: -1, start: 50, end: -50, rails: [] }));
    }

    public sync(seed: number, playerCordZ: number): void {
        if (this.chunkManager === null) {
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
