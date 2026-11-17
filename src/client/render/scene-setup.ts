import * as THREE from "three";


export interface SceneSetup {
    scene: THREE.Scene;
    dirLight: THREE.DirectionalLight;
}

export function createScene():SceneSetup {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffd700);
    scene.fog = new THREE.Fog(0xffd700, 45, 165);

    const ambientLight = new THREE.AmbientLight(0xd8b4f8, 0.85);
    const dirLight = new THREE.DirectionalLight(0xfff4cc, 1.6);
    dirLight.position.set(-18, 28, 15);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 120;
    dirLight.shadow.camera.left = -35;
    dirLight.shadow.camera.right = 35;
    dirLight.shadow.camera.top = 50;
    dirLight.shadow.camera.bottom = -50;

    scene.add(ambientLight);
    scene.add(dirLight);
    scene.add(dirLight.target);
    return { scene, dirLight };
}