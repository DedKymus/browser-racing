import * as THREE from "three";
import * as carPhysics from "../../../shared/car-physics";
import type * as types from "../../../shared/types";
import type * as audio from "../audio";
import * as toon from "./toon";
import * as context from "../context";

export class CarView {
    public mesh: THREE.Group;
    private materials: context.Materials;
    private sound: THREE.PositionalAudio | null = null;
    private auraGroup: THREE.Group = new THREE.Group();
    private auraShards: { mesh: THREE.Mesh; offsetZ: number; offsetX: number; speed: number }[] = [];
    private animTick: number = 0;

    constructor(color: number, materials: context.Materials) {
        this.materials = materials;
        this.mesh = this.createCarMesh(color);
    }

    private createCarMesh(color: number): THREE.Group {
        const carGroup = new THREE.Group();
        const w = carPhysics.Car.Width;
        const l = carPhysics.Car.Length;
        const gradientMap = this.materials.toonGradient;
        const inkLineMat = this.materials.inkLineMat;

        const bodyMaterial = new THREE.MeshToonMaterial({
            color: color,
            gradientMap: gradientMap,
        });

        const chassisGeo = new THREE.BoxGeometry(w, 0.45, l);
        const chassis = new THREE.Mesh(chassisGeo, bodyMaterial);
        chassis.position.y = -0.05;
        chassis.castShadow = true;
        chassis.receiveShadow = true;
        toon.addInkOutline(chassis, chassisGeo, inkLineMat);
        carGroup.add(chassis);

        const cabinGeo = new THREE.BoxGeometry(w * 0.78, 0.4, l * 0.48);
        const cabinMaterial = new THREE.MeshToonMaterial({
            color: 0x1a0933,
            gradientMap: gradientMap,
        });
        const cabin = new THREE.Mesh(cabinGeo, cabinMaterial);
        cabin.position.set(0, 0.35, 0.2);
        cabin.castShadow = true;
        toon.addInkOutline(cabin, cabinGeo, inkLineMat);
        carGroup.add(cabin);

        const wingGeo = new THREE.BoxGeometry(w * 0.95, 0.1, 0.35);
        const wing = new THREE.Mesh(wingGeo, bodyMaterial);
        wing.position.set(0, 0.45, l * 0.44);
        wing.castShadow = true;
        toon.addInkOutline(wing, wingGeo, inkLineMat);
        carGroup.add(wing);

        const headLightMat = new THREE.MeshBasicMaterial({ color: 0xfff000 });
        const headLights = new THREE.Mesh(new THREE.BoxGeometry(w * 0.85, 0.12, 0.05), headLightMat);
        headLights.position.set(0, 0.02, -l / 2 - 0.01);
        carGroup.add(headLights);

        const tailLightMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
        const tailLights = new THREE.Mesh(new THREE.BoxGeometry(w * 0.88, 0.12, 0.05), tailLightMat);
        tailLights.position.set(0, 0.05, l / 2 + 0.01);
        carGroup.add(tailLights);

        const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.28, 12);
        wheelGeo.rotateZ(Math.PI / 2);
        const wheelMat = new THREE.MeshToonMaterial({
            color: 0x181026,
            gradientMap: gradientMap,
        });

        const wheelPositions: [number, number, number][] = [
            [-w / 2, -0.15, -l * 0.32],
            [w / 2, -0.15, -l * 0.32],
            [-w / 2, -0.15, l * 0.32],
            [w / 2, -0.15, l * 0.32],
        ];

        for (const [wx, wy, wz] of wheelPositions) {
            const wheel = new THREE.Mesh(wheelGeo, wheelMat);
            wheel.position.set(wx, wy, wz);
            wheel.castShadow = true;
            toon.addInkOutline(wheel, wheelGeo, inkLineMat);
            carGroup.add(wheel);
        }

        const shardGeo = new THREE.ConeGeometry(0.22, 0.9, 4);
        shardGeo.rotateX(Math.PI / 2);
        const auraColor = color === 0x00ff00 ? 0xd400ff : 0xffaa00;
        const shardMat = new THREE.MeshBasicMaterial({
            color: auraColor,
            transparent: true,
            opacity: 0.75,
        });

        for (let i = 0; i < 14; i++) {
            const shard = new THREE.Mesh(shardGeo, shardMat);
            const offsetX = ((i % 5) - 2) * 0.55;
            const offsetZ = l / 2 + 0.3 + (i % 4) * 0.6;
            shard.position.set(offsetX, 0.05 + (i % 3) * 0.18, offsetZ);
            this.auraGroup.add(shard);
            this.auraShards.push({
                mesh: shard,
                offsetX,
                offsetZ,
                speed: 0.15 + (i % 4) * 0.06,
            });
        }

        carGroup.add(this.auraGroup);
        return carGroup;
    }

    public syncCarMesh(car: types.CarState): void {
        if (this.sound && this.sound.isPlaying) {
            this.sound.setPlaybackRate(car.speed / 25);
        }
        this.mesh.position.x = car.position.x;
        this.mesh.position.z = car.position.z;
        this.mesh.rotation.y = car.heading;

        this.animTick += 0.2;
        const speedRatio = Math.max(0.5, car.speed / 25);
        for (let i = 0; i < this.auraShards.length; i++) {
            const item = this.auraShards[i]!;
            const cycle = (this.animTick * item.speed * speedRatio + i * 0.3) % 2.4;
            item.mesh.position.z = carPhysics.Car.Length / 2 + cycle;
            item.mesh.position.x = item.offsetX + Math.sin(this.animTick + i) * 0.12;
            const scale = Math.max(0.1, (1 - cycle / 2.4) * speedRatio);
            item.mesh.scale.set(scale, scale, scale * 1.4);
        }
    }

    public initSound(audioManager: audio.AudioManager): void {
        this.sound = audioManager.createCarSound(this.mesh);
    }
}
