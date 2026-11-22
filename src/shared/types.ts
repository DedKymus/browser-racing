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
    seed: number;
    traffic: BotTrafficCar[]
}

export type JoinRequest =
    | { mode: "random"; name: string }
    | { mode: "join"; name: string; room: string }
    | { mode: "create"; name: string };

//World
export interface Chunk {
    index: number;
    start: number;
    end: number;
    rails: Rail[];
}

export interface BotTrafficCar {
    id: number;
    lane:number;
    position:Point;
    speed:number;
}

export interface Point {
    x: number;
    z: number;
}

export interface Rail {
    start: Point;
    end: Point;
}

