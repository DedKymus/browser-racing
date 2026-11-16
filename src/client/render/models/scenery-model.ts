import * as THREE from "three";
import type * as types from "../../../shared/types";
import * as toon from "../graphics/toon";

export class SceneryModel {
    private menacingSprites: { sprite: THREE.Sprite; baseY: number; phase: number }[] = [];
    private animTime: number = 0;

    private readonly inkLineMat: THREE.LineBasicMaterial;
    private readonly rockGeo: THREE.DodecahedronGeometry;
    private readonly rockEdges: THREE.EdgesGeometry;
    private readonly rockMat: THREE.MeshToonMaterial;
    private readonly poleGeo: THREE.CylinderGeometry;
    private readonly poleCrossGeo: THREE.BoxGeometry;
    private readonly poleMat: THREE.MeshToonMaterial;
    private readonly signPostGeo: THREE.CylinderGeometry;
    private readonly signBoardGeo: THREE.BoxGeometry;
    private readonly signBoardMat: THREE.MeshToonMaterial;
    private readonly menacingMat: THREE.SpriteMaterial;

    constructor(gradientMap: THREE.DataTexture, inkLineMat: THREE.LineBasicMaterial) {
        this.inkLineMat = inkLineMat;

        this.rockGeo = new THREE.DodecahedronGeometry(1.8, 0);
        this.rockEdges = new THREE.EdgesGeometry(this.rockGeo, 15);
        this.rockMat = new THREE.MeshToonMaterial({
            color: 0x6a4c93,
            gradientMap,
        });

        this.poleGeo = new THREE.CylinderGeometry(0.14, 0.2, 7.5, 6);
        this.poleCrossGeo = new THREE.BoxGeometry(2.2, 0.14, 0.14);
        this.poleMat = new THREE.MeshToonMaterial({
            color: 0x3b2d54,
            gradientMap,
        });

        this.signPostGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.2, 6);
        this.signBoardGeo = new THREE.BoxGeometry(1.1, 1.1, 0.08);
        this.signBoardMat = new THREE.MeshToonMaterial({
            color: 0xffbe0b,
            gradientMap,
        });

        this.menacingMat = new THREE.SpriteMaterial({
            map: this.createMenacingTexture(),
            transparent: true,
        });
    }

    public reset(): void {
        this.menacingSprites = [];
    }

    public populateChunk(group: THREE.Group, chunk: types.Chunk, roadWidth: number, nextRand: () => number): void {
        const length = Math.abs(chunk.start - chunk.end);

        for (let i = 0; i < 6; i++) {
            const side = i % 2 === 0 ? -1 : 1;
            const posZ = chunk.start - (i + 0.5) * (length / 6);
            const tiltZ = (nextRand() - 0.5) * 0.35;
            const tiltX = (nextRand() - 0.5) * 0.25;

            const poleGroup = new THREE.Group();
            const pole = new THREE.Mesh(this.poleGeo, this.poleMat);
            pole.position.y = 3.2;
            pole.castShadow = true;
            toon.addInkOutline(pole, this.poleGeo, this.inkLineMat);
            poleGroup.add(pole);

            const crossBar = new THREE.Mesh(this.poleCrossGeo, this.poleMat);
            crossBar.position.y = 6.2;
            crossBar.castShadow = true;
            toon.addInkOutline(crossBar, this.poleCrossGeo, this.inkLineMat);
            poleGroup.add(crossBar);

            poleGroup.position.set(side * (roadWidth / 2 + 1.8), -0.5, posZ);
            poleGroup.rotation.set(tiltX, 0, tiltZ);
            group.add(poleGroup);
        }

        for (let i = 0; i < 6; i++) {
            const side = nextRand() > 0.5 ? 1 : -1;
            const offsetX = roadWidth / 2 + 3.5 + nextRand() * 12;
            const posZ = chunk.start - nextRand() * length;
            const scaleX = 0.8 + nextRand() * 1.4;
            const scaleY = 1.2 + nextRand() * 2.5;
            const scaleZ = 0.8 + nextRand() * 1.4;

            const rock = new THREE.Mesh(this.rockGeo, this.rockMat);
            rock.add(new THREE.LineSegments(this.rockEdges, this.inkLineMat));
            rock.position.set(side * offsetX, -0.5 + scaleY * 0.6, posZ);
            rock.scale.set(scaleX, scaleY, scaleZ);
            rock.rotation.set(nextRand() * 0.5, nextRand() * Math.PI, (nextRand() - 0.5) * 0.6);
            rock.castShadow = true;
            rock.receiveShadow = true;
            group.add(rock);
        }

        for (let i = 0; i < 4; i++) {
            const side = i % 2 === 0 ? 1 : -1;
            const posZ = chunk.start - (i + 0.3) * (length / 4);
            const signGroup = new THREE.Group();

            const post = new THREE.Mesh(this.signPostGeo, this.poleMat);
            post.position.y = 1.1;
            post.castShadow = true;
            signGroup.add(post);

            const board = new THREE.Mesh(this.signBoardGeo, this.signBoardMat);
            board.position.y = 2.6;
            board.rotation.z = Math.PI / 4;
            board.castShadow = true;
            toon.addInkOutline(board, this.signBoardGeo, this.inkLineMat);
            signGroup.add(board);

            signGroup.position.set(side * (roadWidth / 2 + 1.1), -0.5, posZ);
            signGroup.rotation.z = side * -0.22;
            group.add(signGroup);
        }

        for (let i = 0; i < 5; i++) {
            const side = nextRand() > 0.5 ? 1 : -1;
            const sprite = new THREE.Sprite(this.menacingMat);
            const baseX = side * (roadWidth / 2 + 1.5 + nextRand() * 5);
            const baseY = 1.8 + nextRand() * 3.0;
            const posZ = chunk.start - nextRand() * length;

            sprite.position.set(baseX, baseY, posZ);
            sprite.scale.set(2.5, 2.5, 1);
            group.add(sprite);
            this.menacingSprites.push({
                sprite,
                baseY,
                phase: nextRand() * Math.PI * 2,
            });
        }
    }

    public animate(): void {
        this.animTime += 0.08;
        for (const item of this.menacingSprites) {
            const wave = Math.sin(this.animTime + item.phase);
            item.sprite.position.y = item.baseY + wave * 0.6;
            const pulse = 2.4 + Math.sin(this.animTime * 2 + item.phase) * 0.45;
            item.sprite.scale.set(pulse, pulse, 1);
        }
    }

    private createMenacingTexture(): THREE.CanvasTexture {
        const canvas = document.createElement("canvas");
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext("2d")!;

        ctx.clearRect(0, 0, 256, 256);
        ctx.font = "900 130px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.shadowColor = "#ff00aa";
        ctx.shadowBlur = 18;

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 14;
        ctx.strokeText("ゴゴ", 128, 128);

        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 6;
        ctx.strokeText("ゴゴ", 128, 128);

        ctx.fillStyle = "#4a0072";
        ctx.fillText("ゴゴ", 128, 128);

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
    }
}
