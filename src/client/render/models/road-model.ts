import * as THREE from "three";
import type * as types from "../../../shared/types";
import * as CONST from "../../../shared/constants";
import * as toon from "../graphics/toon";

export class RoadModel {
    public readonly roadWidth = CONST.ROAD_WIDTH;

    private readonly inkLineMat: THREE.LineBasicMaterial;
    private readonly roadGeo: THREE.BoxGeometry;
    private readonly roadMat: THREE.MeshToonMaterial;
    private readonly shoulderGeo: THREE.BoxGeometry;
    private readonly shoulderMat: THREE.MeshToonMaterial;
    private readonly groundGeo: THREE.BoxGeometry;
    private readonly groundMat: THREE.MeshToonMaterial;
    private readonly curbGeo: THREE.BoxGeometry;
    private readonly curbMat: THREE.MeshToonMaterial;
    private readonly edgeLineGeo: THREE.BoxGeometry;
    private readonly edgeLineMat: THREE.MeshBasicMaterial;
    private readonly dashGeo: THREE.BoxGeometry;
    private readonly dashMat: THREE.MeshBasicMaterial;

    constructor(gradientMap: THREE.DataTexture, inkLineMat: THREE.LineBasicMaterial) {
        this.inkLineMat = inkLineMat;

        this.roadGeo = new THREE.BoxGeometry(this.roadWidth, 0.12, CONST.CHUNK_LENGTH);
        this.roadMat = new THREE.MeshToonMaterial({
            color: 0x2d124d,
            gradientMap,
        });

        this.shoulderGeo = new THREE.BoxGeometry(16, 0.11, CONST.CHUNK_LENGTH);
        this.shoulderMat = new THREE.MeshToonMaterial({
            color: 0x432371,
            gradientMap,
        });

        this.groundGeo = new THREE.BoxGeometry(400, 0.1, CONST.CHUNK_LENGTH);
        this.groundMat = new THREE.MeshToonMaterial({
            color: 0x8fd14f,
            gradientMap,
        });

        this.curbGeo = new THREE.BoxGeometry(0.55, 0.38, CONST.CHUNK_LENGTH);
        this.curbMat = new THREE.MeshToonMaterial({
            color: 0xff007f,
            gradientMap,
        });

        this.edgeLineGeo = new THREE.BoxGeometry(0.18, 0.03, CONST.CHUNK_LENGTH);
        this.edgeLineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

        this.dashGeo = new THREE.BoxGeometry(0.25, 0.03, 4.5);
        this.dashMat = new THREE.MeshBasicMaterial({ color: 0xffe600 });
    }

    public build(group: THREE.Group, chunk: types.Chunk): void {
        const centerZ = (chunk.start + chunk.end) / 2;

        const ground = new THREE.Mesh(this.groundGeo, this.groundMat);
        ground.position.set(0, -0.62, centerZ);
        ground.receiveShadow = true;
        group.add(ground);

        const shoulder = new THREE.Mesh(this.shoulderGeo, this.shoulderMat);
        shoulder.position.set(0, -0.58, centerZ);
        shoulder.receiveShadow = true;
        group.add(shoulder);

        const road = new THREE.Mesh(this.roadGeo, this.roadMat);
        road.position.set(0, -0.55, centerZ);
        road.receiveShadow = true;
        group.add(road);

        for (const side of [-1, 1]) {
            const edgeLine = new THREE.Mesh(this.edgeLineGeo, this.edgeLineMat);
            edgeLine.position.set(side * (this.roadWidth / 2 - 0.45), -0.48, centerZ);
            group.add(edgeLine);

            const curbX = side * (this.roadWidth / 2 + 0.3);
            const curb = new THREE.Mesh(this.curbGeo, this.curbMat);
            curb.position.set(curbX, -0.35, centerZ);
            curb.castShadow = true;
            curb.receiveShadow = true;
            toon.addInkOutline(curb, this.curbGeo, this.inkLineMat);
            group.add(curb);
        }

        for (let z = chunk.start - 5; z > chunk.end; z -= 10) {
            const dash = new THREE.Mesh(this.dashGeo, this.dashMat);
            dash.position.set(0, -0.48, z);
            group.add(dash);
        }
    }
}
