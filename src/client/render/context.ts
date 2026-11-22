import * as THREE from "three";
import * as toon from "./graphics/toon";

export interface Materials {
    toonGradient: THREE.DataTexture;
    inkLineMat: THREE.LineBasicMaterial;
}

export interface RenderContext {
    container: HTMLElement;
    webgl: THREE.WebGLRenderer;
    materials: Materials;
}
export function createContext(container: HTMLElement): RenderContext {
    const webgl = new THREE.WebGLRenderer({ antialias: true });

    webgl.setSize(window.innerWidth, window.innerHeight);
    webgl.setPixelRatio(window.devicePixelRatio);
    webgl.shadowMap.enabled = true;
    webgl.shadowMap.type = THREE.BasicShadowMap;
    webgl.shadowMap.autoUpdate = false;
    container.appendChild(webgl.domElement);

    const materials: Materials = {
        toonGradient: toon.createToonGradient(),
        inkLineMat: new THREE.LineBasicMaterial({ color: 0x05000a }),
    };

    return { container, webgl, materials };
}