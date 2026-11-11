import * as server from "./server";
import * as config from "./infra/config"
import * as logger from "./infra/logger";

const cfg = config.parseConfig();
const lgr = new logger.Logger(cfg.servConfig.debug);

const srv = new server.GameServer(cfg.servConfig,lgr)
srv.start()

