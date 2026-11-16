import * as THREE from "three";

export function createToonGradient(): THREE.DataTexture {
    const colors = new Uint8Array([
        45, 45, 65, 255,
        115, 115, 140, 255,
        195, 195, 215, 255,
        255, 255, 255, 255,
    ]);
    const texture = new THREE.DataTexture(colors, 4, 1, THREE.RGBAFormat);
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.needsUpdate = true;
    return texture;
}

export function addInkOutline(mesh: THREE.Mesh, geometry: THREE.BufferGeometry, lineMat: THREE.LineBasicMaterial): void {
    const edges = new THREE.EdgesGeometry(geometry, 20);
    const line = new THREE.LineSegments(edges, lineMat);
    mesh.add(line);
}
