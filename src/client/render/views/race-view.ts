import * as THREE from "three";
import * as sceneSetup from "../scene-setup";
import * as postFx from "../post-fx";
import * as carView from "../graphics/car-view";
import * as trackView from "../graphics/track-view";
import * as audio from "../audio";
import * as hud from "../ui/hud";

import type * as types from "../../../shared/types";
import type * as context from "../context";
import type * as view from "./view";


export class RaceView implements view.View {
    private ctx: context.RenderContext;
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private fx: postFx.PostFx | null = null;
    private audio: audio.AudioManager;
    private hud: hud.Hud;
    private dirLight: THREE.DirectionalLight;
    private track: trackView.TrackView;
    private playerCar: carView.CarView;
    private enemyCar: carView.CarView;
    private soundStarted: boolean = false;

    constructor(ctx: context.RenderContext) {
        this.ctx = ctx;
        const setup = sceneSetup.createScene();
        this.scene = setup.scene;
        this.dirLight = setup.dirLight;
        this.hud = new hud.Hud(ctx.container);
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.audio = new audio.AudioManager(this.camera);
        this.track = new trackView.TrackView(ctx.materials);
        this.playerCar = new carView.CarView(0x00ff00, ctx.materials);
        this.enemyCar = new carView.CarView(0xff0000, ctx.materials);

        this.scene.add(this.track.mesh);
        this.scene.add(this.playerCar.mesh);
        this.scene.add(this.enemyCar.mesh);
    }

    public recordStep(): void {
        this.hud.recordPhysicsStep();
    }

    public enter(): void {
        this.fx = new postFx.PostFx(this.ctx, this.scene, this.camera, [
            this.playerCar.mesh,
            this.enemyCar.mesh,
            this.track.mesh,
        ]);
        this.hud.show();
        if (!this.soundStarted) {
            this.playerCar.initSound(this.audio);
            this.enemyCar.initSound(this.audio);
            this.soundStarted = true;
        }
        this.camera.position.set(0, 5, 10);
        this.camera.lookAt(0, 0, 0);
    }

    public exit(): void {
        this.hud.hide();
        this.fx?.dispose();
        this.fx = null;
    }

    public resize(width: number, height: number): void {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.ctx.webgl.setSize(width, height);
        this.fx?.setSize(width, height);
    }

    public sync(state: types.GameState): void {
        const z = state.you.carState.position.z;
        this.track.sync(state.seed, z);
        this.playerCar.syncCarMesh(state.you.carState);
        this.enemyCar.syncCarMesh(state.enemy.carState);
        this.camera.position.z = this.playerCar.mesh.position.z + 10;
        this.camera.position.x = this.playerCar.mesh.position.x * 0.5;
        this.dirLight.position.z = z + 15;
        this.dirLight.target.position.z = z - 15;
        this.dirLight.target.updateMatrixWorld();
    }

    public render(): void {
        this.fx?.render();
    }

}