import * as THREE from 'three';
import * as input from '../input';
import * as carPhysics from '../../shared/car-physics';
import * as hud from '../hud'

export class Engine {
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private scene: THREE.Scene;

    private carMesh: THREE.Mesh;
    private lastTime: number = 0;
    private accumulator: number = 0;
    private readonly FIXED_DT: number = 1 / 60;

    private playerCar: carPhysics.Car = new carPhysics.Car(0,0)

    private enemyCar: carPhysics.Car | null = null;
    private enemyMesh: THREE.Mesh | null = null;

    private input: input.Input = new input.Input();
    private hud: hud.Hud;

    constructor(container: HTMLElement) {
        this.scene = new THREE.Scene()
        this.hud = new hud.Hud(container);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
        this.camera.position.set(0, 5, 10)
        this.camera.lookAt(0, 0, 0)

        this.renderer = new THREE.WebGLRenderer({ antialias: true })
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.renderer.setPixelRatio(window.devicePixelRatio);

        container.appendChild(this.renderer.domElement)

        const grid = new THREE.GridHelper(2000, 200, 0xff00ff, 0x444444);
        grid.position.y = -0.5;

        const geometry = new THREE.BoxGeometry(2, 1, 4);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
        this.carMesh = new THREE.Mesh(geometry, material);

        this.scene.add(grid);
        this.scene.add(this.carMesh);
        this.spawnEnemy(4, 0);
    }

    public start(): void {
        this.lastTime = performance.now();
        requestAnimationFrame((now) => this.Loop(now));
    }

    private Loop(now:number) {
        const frameTime = Math.min((now - this.lastTime) / 1000, 0.1);
        this.lastTime = now;
        this.accumulator += frameTime;

        while (this.accumulator >= this.FIXED_DT) {
            this.hud.recordPhysicsStep();
            this.update(this.FIXED_DT);
            this.accumulator -= this.FIXED_DT;
        }

        this.renderer.render(this.scene, this.camera);
        this.hud.update(frameTime, this.playerCar.speed);
        requestAnimationFrame((nextNow) => this.Loop(nextNow))
    }

    private update(dt:number) {
        const controls = {
            up: this.input.isPressed("KeyW"),
            down: this.input.isPressed("KeyS"),
            right: this.input.isPressed("KeyD"),
            left: this.input.isPressed("KeyA"),
        }

        this.playerCar.update(dt, controls);

        if (this.enemyCar && this.enemyMesh) {
            this.enemyCar.update(dt, {
                up: this.input.isPressed("ArrowUp"),
                down: this.input.isPressed("ArrowDown"),
                left: this.input.isPressed("ArrowLeft"),
                right: this.input.isPressed("ArrowRight"),
            });
            carPhysics.resolveCarCollision(this.playerCar, this.enemyCar);
            this.enemyMesh.position.x = this.enemyCar.x;
            this.enemyMesh.position.z = this.enemyCar.z;
            this.enemyMesh.rotation.y = this.enemyCar.heading;
        }

        this.carMesh.position.x = this.playerCar.x;
        this.carMesh.position.z = this.playerCar.z;
        this.carMesh.rotation.y = this.playerCar.heading;

        this.camera.position.z = this.carMesh.position.z + 10;
        this.camera.position.x = this.carMesh.position.x * 0.5;

    }

    public spawnEnemy(startX: number = 4, startZ: number = 0): void {
        this.enemyCar = new carPhysics.Car(startX, startZ);
        const geometry = new THREE.BoxGeometry(2, 1, 4);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
        this.enemyMesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.enemyMesh);
    }
}