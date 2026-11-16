import * as THREE from 'three'

export class AudioManager {
    private listener: THREE.AudioListener = new THREE.AudioListener();
    private loader : THREE.AudioLoader = new THREE.AudioLoader();

    constructor(camera: THREE.Camera) {
        camera.add(this.listener);
    }

    public createCarSound(mesh: THREE.Object3D, url: string = "audio/engine.wav"): THREE.PositionalAudio {
        const positionAudio = new THREE.PositionalAudio(this.listener)
        positionAudio.setRefDistance(5);
        positionAudio.setLoop(true);
        mesh.add(positionAudio);
        this.loader.load(url, (buffer) => {
            positionAudio.setBuffer(buffer);
            positionAudio.setVolume(1);
            positionAudio.play();
        })
        return positionAudio
    }
}