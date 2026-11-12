import * as THREE from 'three';
import type * as types from '../../shared/types';
import * as carView from './graphics/car-view';
import * as trackView from './graphics/track-view';

export class Renderer {
    private camera: THREE.PerspectiveCamera;
    private webgl: THREE.WebGLRenderer;
    private scene: THREE.Scene;

    private playerCar: carView.CarView;
    private enemyCar: carView.CarView | null = null;

    constructor(container: HTMLElement) {
        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(-18, 4, 2);
        this.camera.lookAt(0, 2, 0);

        this.webgl = new THREE.WebGLRenderer({ antialias: true });
        this.webgl.setSize(window.innerWidth, window.innerHeight);
        this.webgl.setPixelRatio(window.devicePixelRatio);
        container.appendChild(this.webgl.domElement);

        const track = new trackView.TrackView();
        this.scene.add(track.mesh);

        this.playerCar = new carView.CarView(0x00ff00);
        this.scene.add(this.playerCar.mesh);
    }

    public startRaceView(): void {
        if (!this.enemyCar) {
            this.enemyCar = new carView.CarView(0xff0000);
            this.scene.add(this.enemyCar.mesh);
        }
        this.camera.position.set(0, 5, 10);
        this.camera.lookAt(0, 0, 0);
    }

    public sync(state: types.GameState): void {
        this.playerCar.syncCarMesh(state.you.carState);
        this.enemyCar?.syncCarMesh(state.enemy.carState);

        this.camera.position.z = this.playerCar.mesh.position.z + 10;
        this.camera.position.x = this.playerCar.mesh.position.x * 0.5;
    }

    public render(): void {
        this.webgl.render(this.scene, this.camera);
    }
}
