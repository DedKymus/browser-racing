import * as THREE from 'three';
import * as carPhysics from '../shared/car-physics';
import type * as types from '../shared/types';

export class Renderer {
    private camera: THREE.PerspectiveCamera;
    private webgl: THREE.WebGLRenderer;
    private scene: THREE.Scene;

    private playerMesh: THREE.Mesh;
    private enemyMesh: THREE.Mesh | null = null;

    constructor(container: HTMLElement) {
        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(-18, 4, 2);
        this.camera.lookAt(0, 2, 0);

        this.webgl = new THREE.WebGLRenderer({ antialias: true });
        this.webgl.setSize(window.innerWidth, window.innerHeight);
        this.webgl.setPixelRatio(window.devicePixelRatio);
        container.appendChild(this.webgl.domElement);

        const grid = new THREE.GridHelper(2000, 200, 0xff00ff, 0x444444);
        grid.position.y = -0.5;
        this.scene.add(grid);

        this.playerMesh = this.createCarMesh(0x00ff00);
        this.scene.add(this.playerMesh);
    }

    public startRaceView(): void {
        if (!this.enemyMesh) {
            this.enemyMesh = this.createCarMesh(0xff0000);
            this.scene.add(this.enemyMesh);
        }
        this.camera.position.set(0, 5, 10);
        this.camera.lookAt(0, 0, 0);
    }

    public sync(state: types.GameState): void {
        this.syncCarMesh(this.playerMesh, state.you.carState);
        if (this.enemyMesh) {
            this.syncCarMesh(this.enemyMesh, state.enemy.carState);
        }

        this.camera.position.z = this.playerMesh.position.z + 10;
        this.camera.position.x = this.playerMesh.position.x * 0.5;
    }

    public render(): void {
        this.webgl.render(this.scene, this.camera);
    }

    private createCarMesh(color: number): THREE.Mesh {
        const geometry = new THREE.BoxGeometry(carPhysics.Car.Width, 1, carPhysics.Car.Length);
        const material = new THREE.MeshBasicMaterial({ color: color, wireframe: true });
        return new THREE.Mesh(geometry, material);
    }

    private syncCarMesh(mesh: THREE.Mesh, car: types.CarState): void {
        mesh.position.x = car.position.x;
        mesh.position.z = car.position.z;
        mesh.rotation.y = car.heading;
    }
}
