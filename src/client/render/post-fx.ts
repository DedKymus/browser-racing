import * as THREE from "three";
import * as effectComposer from "three/examples/jsm/postprocessing/EffectComposer.js";
import * as renderPass from "three/examples/jsm/postprocessing/RenderPass.js";
import * as outlinePass from "three/examples/jsm/postprocessing/OutlinePass.js";
import type * as context from "./context";

export class PostFx {
    private composer: effectComposer.EffectComposer;
    private outline: outlinePass.OutlinePass;

    constructor(ctx: context.RenderContext, scene: THREE.Scene, camera: THREE.Camera, outlined: THREE.Object3D[] ) {
        this.composer = new effectComposer.EffectComposer(ctx.webgl);
        this.composer.addPass(new renderPass.RenderPass(scene, camera));

        this.outline = new outlinePass.OutlinePass(ctx.webgl.getSize(new THREE.Vector2()), scene, camera);
        this.outline.edgeStrength = 4.5;
        this.outline.edgeGlow = 0.0;
        this.outline.edgeThickness = 1.8;
        this.outline.visibleEdgeColor.set("#05000a");
        this.outline.hiddenEdgeColor.set("#000000");
        this.outline.selectedObjects = outlined;

        this.composer.addPass(this.outline);
    }

    public setSize(width: number, height: number) {
        this.composer.setSize(width, height);
    }

    public render(): void {
        this.composer.render();
    }

    public dispose(): void {
        this.outline.dispose();
        this.composer.dispose();
    }

}