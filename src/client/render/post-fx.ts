import * as THREE from "three";
import * as effectComposer from "three/examples/jsm/postprocessing/EffectComposer.js";
import * as renderPass from "three/examples/jsm/postprocessing/RenderPass.js";
import * as outlinePass from "three/examples/jsm/postprocessing/OutlinePass.js";
import * as smaaPass from "three/examples/jsm/postprocessing/SMAAPass.js";
import type * as context from "./context";


const MSAA_SAMPLES = 2;

export class PostFx {
    private webgl: THREE.WebGLRenderer;
    private composer: effectComposer.EffectComposer;
    private outline: outlinePass.OutlinePass;
    private smaa: smaaPass.SMAAPass;

    constructor(ctx: context.RenderContext, scene: THREE.Scene, camera: THREE.Camera, outlined: THREE.Object3D[] ) {
        this.webgl = ctx.webgl;
        const size = ctx.webgl.getSize(new THREE.Vector2());
        const pixelRatio = ctx.webgl.getPixelRatio();

        const target = new THREE.WebGLRenderTarget(size.x * pixelRatio, size.y * pixelRatio, {
            type: THREE.HalfFloatType,
            samples: Math.min(MSAA_SAMPLES, ctx.webgl.capabilities.maxSamples),
        });
        this.composer = new effectComposer.EffectComposer(ctx.webgl, target);
        this.composer.setSize(size.x, size.y);
        this.composer.addPass(new renderPass.RenderPass(scene, camera));

        this.outline = new outlinePass.OutlinePass(size, scene, camera);
        this.outline.edgeStrength = 4.5;
        this.outline.edgeGlow = 0.0;
        this.outline.edgeThickness = 1.8;
        this.outline.visibleEdgeColor.set("#05000a");
        this.outline.hiddenEdgeColor.set("#000000");
        this.outline.selectedObjects = outlined;

        this.composer.addPass(this.outline);

        this.smaa = new smaaPass.SMAAPass();
        this.composer.addPass(this.smaa);
    }

    public setSize(width: number, height: number) {
        this.composer.setSize(width, height);
    }

    public render(): void {
        this.webgl.shadowMap.needsUpdate = true;
        this.composer.render();
    }

    public dispose(): void {
        this.smaa.dispose();
        this.outline.dispose();
        this.composer.dispose();
    }

}
