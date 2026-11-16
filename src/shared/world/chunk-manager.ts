import type * as types from "../types";


export function create (seed: number): ChunkManager {
    return new ChunkManager(seed)
}

export class ChunkManager {
    private chunks: types.Chunk[] = [];
    private nextIndex: number = 0;
    private seed: number;

    private readonly CHUNK_LENGTH: number = 100;
    private readonly LANES = [-2, 2];

    constructor(seed: number) {
        this.seed = seed;
        for (let i = 0; i < 3; i++) {
            this.generateChunk();
        }
    }

    public update(leadZ: number): void {
        const lastChunk = this.chunks[this.chunks.length - 1];
        if (lastChunk && leadZ - lastChunk.end < 200) {
            this.generateChunk();
        }

        const firstChunk = this.chunks[0];
        if (firstChunk && firstChunk.end > leadZ + 100) {
            this.chunks.shift();
        }
    }

    public getChunks(): types.Chunk[] {
        return this.chunks;
    }

    public getSeed(): number {
        return this.seed;
    }

    private generateChunk(): void {
        const start = -this.nextIndex * this.CHUNK_LENGTH;
        const end = start - this.CHUNK_LENGTH;
        const prevChunk = this.chunks[this.chunks.length - 1];

        const rails: types.Rail[] = [];
        for (let i = 0; i < this.LANES.length; i++) {
            const laneX = this.LANES[i]!;
            const prevRail = prevChunk?.rails[i];

            const startPoint: types.Point = prevRail ? prevRail.end : { x: laneX, z: start };
            const endPoint: types.Point = { x: laneX, z: end };

            rails.push({ start: startPoint, end: endPoint });
        }

        this.chunks.push({
            index: this.nextIndex,
            start,
            end,
            rails,
        });
        this.nextIndex++;
    }

    public nextRandom(): number {
        this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
        return this.seed / 4294967296
    }
}
