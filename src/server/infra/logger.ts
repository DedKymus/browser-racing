import pino from "pino";
import pretty from "pino-pretty";

export class Logger {
    private logger: pino.Logger;

    constructor(isDebug: boolean = false) {
        this.logger = pino({ level: isDebug ? "debug" : "info" },pretty({ colorize: true, sync: true }))
    }

    public info(message: string, meta?: Record<string, unknown>): void {
        this.logger.info(meta ?? {}, message);
    }

    public warn(message: string, meta?: Record<string, unknown>): void {
        this.logger.warn(meta ?? {}, message);
    }

    public error(message: string, meta?: Record<string, unknown>): void {
        this.logger.error(meta ?? {}, message);
    }

    public debug(message: string, meta?: Record<string, unknown>): void {
        this.logger.debug(meta ?? {}, message);
    }
}