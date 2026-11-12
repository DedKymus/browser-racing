import * as THREE from "three";
import * as carPhysics from "../../../shared/car-physics";
import type * as types from "../../../shared/types";

export class CarView {
    public mesh: THREE.Mesh;

    constructor(color: number){
        this.mesh = this.createCarMesh(color);
    }

    private createCarMesh(color: number): THREE.Mesh {
        const geometry = new THREE.BoxGeometry(carPhysics.Car.Width, 1, carPhysics.Car.Length);
        const material = new THREE.MeshBasicMaterial({ color: color, wireframe: true });
        return new THREE.Mesh(geometry, material);
    }

    public syncCarMesh(car: types.CarState): void {
        this.mesh.position.x = car.position.x;
        this.mesh.position.z = car.position.z;
        this.mesh.rotation.y = car.heading;
    }
}