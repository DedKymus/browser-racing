
//world
export const ROAD_WIDTH = 12;
export const LANES = [-2, 2] as const;
export const CHUNK_LENGTH = 100;
export const CHUNK_SPAWN_AHEAD = 200;
export const CHUNK_DESPAWN_BEHIND = 100;

//car
export const WIDTH = 2;
export const LENGTH = 4;
export const SPEED_BASE = 25;
export const SPEED_UP = 33;
export const SPEED_DOWN = 18;
export const TURN_RATE = 2.0;
export const MAX_HEADING = Math.PI / 4;

//traffic
export const SPAWN_AHEAD = 200;
export const DESPAWN_BEHIND = 100;
export const MIN_SPAWN_STEP = 200;
export const BOT_SPEED = 14;