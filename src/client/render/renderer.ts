import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
import type * as types from "../../shared/types";
import * as carView from "./graphics/car-view";
import * as trackView from "./graphics/track-view";
import * as audio from "./audio";

export class Renderer {
    private camera: THREE.PerspectiveCamera;
    private webgl: THREE.WebGLRenderer;
    private scene: THREE.Scene;
    private composer: EffectComposer;
    private outlinePass: OutlinePass;
    private audio: audio.AudioManager;
    private track: trackView.TrackView = new trackView.TrackView();

    private dirLight: THREE.DirectionalLight;

    private playerCar: carView.CarView;
    private enemyCar: carView.CarView | null = null;

    constructor(container: HTMLElement) {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xffd700);
        this.scene.fog = new THREE.Fog(0xffd700, 45, 165);

        const ambientLight = new THREE.AmbientLight(0xd8b4f8, 0.85);
        this.dirLight = new THREE.DirectionalLight(0xfff4cc, 1.6);
        this.dirLight.position.set(-18, 28, 15);
        this.dirLight.castShadow = true;
        this.dirLight.shadow.mapSize.width = 1024;
        this.dirLight.shadow.mapSize.height = 1024;
        this.dirLight.shadow.camera.near = 1;
        this.dirLight.shadow.camera.far = 120;
        this.dirLight.shadow.camera.left = -35;
        this.dirLight.shadow.camera.right = 35;
        this.dirLight.shadow.camera.top = 50;
        this.dirLight.shadow.camera.bottom = -50;

        this.scene.add(ambientLight);
        this.scene.add(this.dirLight);
        this.scene.add(this.dirLight.target);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.audio = new audio.AudioManager(this.camera);
        this.camera.position.set(-18, 4, 2);
        this.camera.lookAt(0, 2, 0);

        this.webgl = new THREE.WebGLRenderer({ antialias: true });
        this.webgl.setSize(window.innerWidth, window.innerHeight);
        this.webgl.setPixelRatio(window.devicePixelRatio);
        this.webgl.shadowMap.enabled = true;
        this.webgl.shadowMap.type = THREE.BasicShadowMap;
        container.appendChild(this.webgl.domElement);

        this.scene.add(this.track.mesh);

        this.playerCar = new carView.CarView(0x00ff00);
        this.scene.add(this.playerCar.mesh);

        this.composer = new EffectComposer(this.webgl);
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        this.outlinePass = new OutlinePass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            this.scene,
            this.camera
        );
        this.outlinePass.edgeStrength = 4.5;
        this.outlinePass.edgeGlow = 0.0;
        this.outlinePass.edgeThickness = 1.8;
        this.outlinePass.visibleEdgeColor.set("#05000a");
        this.outlinePass.hiddenEdgeColor.set("#000000");
        this.outlinePass.selectedObjects = [this.playerCar.mesh, this.track.mesh];
        this.composer.addPass(this.outlinePass);
    }

    public startRaceView(): void {
        if (!this.enemyCar) {
            this.enemyCar = new carView.CarView(0xff0000);
            this.scene.add(this.enemyCar.mesh);
            this.playerCar.initSound(this.audio);
            this.enemyCar.initSound(this.audio);
            this.outlinePass.selectedObjects = [
                this.playerCar.mesh,
                this.enemyCar.mesh,
                this.track.mesh,
            ];
        }
        this.camera.position.set(0, 5, 10);
        this.camera.lookAt(0, 0, 0);
    }

    public sync(state: types.GameState): void {
        const z = state.you.carState.position.z;
        this.track.sync(state.seed, z);
        this.playerCar.syncCarMesh(state.you.carState);
        this.enemyCar?.syncCarMesh(state.enemy.carState);

        this.camera.position.z = this.playerCar.mesh.position.z + 10;
        this.camera.position.x = this.playerCar.mesh.position.x * 0.5;

        this.dirLight.position.z = z + 15;
        this.dirLight.target.position.z = z - 15;
        this.dirLight.target.updateMatrixWorld();
    }

    public render(): void {
        this.composer.render();
    }
}
