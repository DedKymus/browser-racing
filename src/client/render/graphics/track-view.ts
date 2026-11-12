import * as THREE from "three";

export class TrackView {
    public mesh: THREE.Object3D;

    constructor() {
        this.mesh = this.gridCreate();
    }

    private gridCreate () {
        const grid = new THREE.GridHelper(2000, 200, 0xff00ff, 0x444444);
        grid.position.y = -0.5;
        return grid;
    }
}