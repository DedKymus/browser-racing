import * as engine from './engine';
import * as renderer from './render/renderer';
import * as hud from './render/ui/hud';
import * as lobby from './render/ui/lobby';
import * as input from './input';
import * as network from './network';

const appContainer = document.getElementById("app");
if (!appContainer) {
    throw new Error("appContainer is not found");
}

const gameEngine = new engine.Engine({
    renderer: new renderer.Renderer(appContainer),
    hud: new hud.Hud(appContainer),
    lobby: new lobby.Lobby(appContainer),
    input: new input.Input(),
    network: new network.NetworkClient(),
});

gameEngine.start();
