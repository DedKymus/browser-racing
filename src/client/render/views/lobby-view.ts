import * as THREE from "three";
import * as sceneSetup from "../scene-setup";
import * as postFx from "../post-fx";
import * as carView from "../graphics/car-view";
import * as trackView from "../graphics/track-view";
import * as lobby from "../ui/lobby";

import type * as context from "../context";
import type * as view from "./view";


export class LobbyView implements view.View {
    private ctx: context.RenderContext;
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private fx: postFx.PostFx | null = null;
    private track: trackView.TrackView;
    private car: carView.CarView;
    private ui: lobby.Lobby;

    constructor(ctx: context.RenderContext) {
        this.ctx = ctx;
        this.ui = new lobby.Lobby(ctx.container);
        this.scene = sceneSetup.createScene().scene;
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(-18, 4, 2);
        this.camera.lookAt(0, 2, 0);
        this.track = new trackView.TrackView(ctx.materials);
        this.track.buildLobby();
        this.car = new carView.CarView(0x00ff00, ctx.materials);
        this.scene.add(this.track.mesh);
        this.scene.add(this.car.mesh);
    }

    public onJoin(callback: (name: string) => void): void {
        this.ui.onJoin(callback);
    }

    public enter(): void {
        this.fx = new postFx.PostFx(this.ctx, this.scene, this.camera, [this.car.mesh, this.track.mesh]);
        this.ui.show();
    }

    public exit(): void {
        this.ui.hide();
        this.fx?.dispose();
        this.fx = null;
    }

    public resize(width: number, height: number): void {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.ctx.webgl.setSize(width, height);
        this.fx?.setSize(width, height);
    }

    public render(): void {
        this.fx?.render();
    }
}