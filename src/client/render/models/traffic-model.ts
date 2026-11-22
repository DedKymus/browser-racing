import * as THREE from "three";
import * as CONST from "../../../shared/constants";
import * as toon from "../graphics/toon";

export class TrafficModel {
    private readonly inkLineMat: THREE.LineBasicMaterial;
    private readonly chassisGeo: THREE.BoxGeometry;
    private readonly hoodGeo: THREE.BoxGeometry;
    private readonly cabinGeo: THREE.BoxGeometry;
    private readonly roofGeo: THREE.BoxGeometry;
    private readonly bumperGeo: THREE.BoxGeometry;
    private readonly wheelGeo: THREE.CylinderGeometry;
    private readonly lightGeo: THREE.BoxGeometry;

    private readonly bodyMats: THREE.MeshToonMaterial[];
    private readonly cabinMat: THREE.MeshToonMaterial;
    private readonly bumperMat: THREE.MeshToonMaterial;
    private readonly wheelMat: THREE.MeshToonMaterial;
    private readonly headLightMat: THREE.MeshBasicMaterial;
    private readonly tailLightMat: THREE.MeshBasicMaterial;

    private readonly wheelPositions: [number, number, number][];

    constructor(gradientMap: THREE.DataTexture, inkLineMat: THREE.LineBasicMaterial) {
        this.inkLineMat = inkLineMat;

        const w = CONST.WIDTH;
        const l = CONST.LENGTH;

        this.chassisGeo = new THREE.BoxGeometry(w, 0.45, l);
        this.hoodGeo = new THREE.BoxGeometry(w * 0.96, 0.18, l * 0.3);
        this.cabinGeo = new THREE.BoxGeometry(w * 0.8, 0.42, l * 0.46);
        this.roofGeo = new THREE.BoxGeometry(w * 0.84, 0.08, l * 0.42);
        this.bumperGeo = new THREE.BoxGeometry(w * 1.02, 0.14, 0.12);
        this.wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.28, 12);
        this.wheelGeo.rotateZ(Math.PI / 2);
        this.lightGeo = new THREE.BoxGeometry(w * 0.85, 0.12, 0.05);

        const palette = [
            0xe63946, 0xff7a00, 0x2ec4b6, 0x9b5de5,
            0xff2e93, 0xf1f1f1, 0x8d99ae, 0x7ae582,
        ];
        this.bodyMats = palette.map(
            (color) => new THREE.MeshToonMaterial({ color, gradientMap })
        );

        this.cabinMat = new THREE.MeshToonMaterial({ color: 0x1a0933, gradientMap });
        this.bumperMat = new THREE.MeshToonMaterial({ color: 0x2a2140, gradientMap });
        this.wheelMat = new THREE.MeshToonMaterial({ color: 0x181026, gradientMap });
        this.headLightMat = new THREE.MeshBasicMaterial({ color: 0xfff000 });
        this.tailLightMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });

        this.wheelPositions = [
            [-w / 2, -0.15, -l * 0.32],
            [w / 2, -0.15, -l * 0.32],
            [-w / 2, -0.15, l * 0.32],
            [w / 2, -0.15, l * 0.32],
        ];
    }

    public createBotMesh(): THREE.Group {
        const group = new THREE.Group();
        const l = CONST.LENGTH;
        const bodyMat = this.bodyMats[Math.floor(Math.random() * this.bodyMats.length)]!;

        const chassis = new THREE.Mesh(this.chassisGeo, bodyMat);
        chassis.castShadow = true;
        chassis.receiveShadow = true;
        toon.addInkOutline(chassis, this.chassisGeo, this.inkLineMat);
        group.add(chassis);

        const hood = new THREE.Mesh(this.hoodGeo, bodyMat);
        hood.position.set(0, 0.3, -l * 0.33);
        hood.castShadow = true;
        toon.addInkOutline(hood, this.hoodGeo, this.inkLineMat);
        group.add(hood);

        const cabin = new THREE.Mesh(this.cabinGeo, this.cabinMat);
        cabin.position.set(0, 0.42, 0.12);
        cabin.castShadow = true;
        toon.addInkOutline(cabin, this.cabinGeo, this.inkLineMat);
        group.add(cabin);

        const roof = new THREE.Mesh(this.roofGeo, bodyMat);
        roof.position.set(0, 0.67, 0.12);
        roof.castShadow = true;
        toon.addInkOutline(roof, this.roofGeo, this.inkLineMat);
        group.add(roof);

        const frontBumper = new THREE.Mesh(this.bumperGeo, this.bumperMat);
        frontBumper.position.set(0, -0.12, -l / 2 - 0.04);
        group.add(frontBumper);

        const rearBumper = new THREE.Mesh(this.bumperGeo, this.bumperMat);
        rearBumper.position.set(0, -0.12, l / 2 + 0.04);
        group.add(rearBumper);

        const headLights = new THREE.Mesh(this.lightGeo, this.headLightMat);
        headLights.position.set(0, 0.05, -l / 2 - 0.01);
        group.add(headLights);

        const tailLights = new THREE.Mesh(this.lightGeo, this.tailLightMat);
        tailLights.position.set(0, 0.08, l / 2 + 0.01);
        group.add(tailLights);

        for (const [wx, wy, wz] of this.wheelPositions) {
            const wheel = new THREE.Mesh(this.wheelGeo, this.wheelMat);
            wheel.position.set(wx, wy, wz);
            wheel.castShadow = true;
            toon.addInkOutline(wheel, this.wheelGeo, this.inkLineMat);
            group.add(wheel);
        }

        return group;
    }
}