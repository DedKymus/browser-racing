import * as engine from './engine'

const appContainer = document.getElementById("app");
if (!appContainer) {
    throw new Error("appContainer is not find");
}

const gameEngine = new engine.Engine(appContainer);
gameEngine.start();