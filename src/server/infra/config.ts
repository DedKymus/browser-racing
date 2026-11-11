import * as util from "util";

export interface Config {
    servConfig : ServerConfig;
}

export interface ServerConfig {
    port: number;
    host: string;
    debug: boolean;
}

export function parseConfig(): Config {
    const { values } = util.parseArgs({ options: {
            port: { type: "string", short: "p", default: "8080" },
            host: { type: "string", default: "localhost" },
            debug: { type: "boolean", short: "d", default: false }
        }
    })
    return { servConfig: { port: Number(values.port), host: values.host, debug: values.debug } }
}