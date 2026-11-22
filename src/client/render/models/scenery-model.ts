import * as THREE from "three";
import type * as types from "../../../shared/types";
import * as toon from "../graphics/toon";

export class SceneryModel {
    private readonly inkLineMat: THREE.LineBasicMaterial;
    private readonly rockGeo: THREE.DodecahedronGeometry;
    private readonly rockEdges: THREE.EdgesGeometry;
    private readonly rockMat: THREE.MeshToonMaterial;
    private readonly poleGeo: THREE.CylinderGeometry;
    private readonly poleCrossGeo: THREE.BoxGeometry;
    private readonly poleMat: THREE.MeshToonMaterial;

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
    }

    public populateChunk(
        group: THREE.Group,
        chunk: types.Chunk,
        roadWidth: number,
        nextRand: () => number,
        clearLeftCameraZone: boolean = false
    ): void {
        const length = Math.abs(chunk.start - chunk.end);

        for (let i = 0; i < 6; i++) {
            const side = i % 2 === 0 ? -1 : 1;
            const posZ = chunk.start - (i + 0.5) * (length / 6);
            const tiltZ = (nextRand() - 0.5) * 0.35;
            const tiltX = (nextRand() - 0.5) * 0.25;

            if (clearLeftCameraZone && side === -1 && Math.abs(posZ) < 28) {
                continue;
            }

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
            let side = nextRand() > 0.5 ? 1 : -1;
            const offsetX = roadWidth / 2 + 4.5 + nextRand() * 12;
            const posZ = chunk.start - nextRand() * length;
            const scaleX = 0.8 + nextRand() * 1.4;
            const scaleY = 1.2 + nextRand() * 2.5;
            const scaleZ = 0.8 + nextRand() * 1.4;

            if (clearLeftCameraZone && side === -1 && Math.abs(posZ) < 40) {
                side = 1;
            }

            const rock = new THREE.Mesh(this.rockGeo, this.rockMat);
            rock.add(new THREE.LineSegments(this.rockEdges, this.inkLineMat));
            rock.position.set(side * offsetX, -0.5 + scaleY * 0.6, posZ);
            rock.scale.set(scaleX, scaleY, scaleZ);
            rock.rotation.set(nextRand() * 0.5, nextRand() * Math.PI, (nextRand() - 0.5) * 0.6);
            rock.castShadow = true;
            rock.receiveShadow = true;
            group.add(rock);
        }
    }
}
