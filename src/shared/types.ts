export interface CarControls {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
}

export interface CarState {
    position:{ x: number; z: number };
    heading: number;
    speed: number;
}

export interface GameState {
    you :{name:string , carState:CarState};
    enemy :{name:string , carState:CarState};
}