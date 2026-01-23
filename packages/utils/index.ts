import { pino } from "pino";

// Helper to check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

const level = (typeof process !== 'undefined' && process.env.LOG_LEVEL) || 'info';

export const logger = pino({
    level,
    ...(isBrowser ? {} : {
        transport: {
            target: 'pino-pretty',
            options: {
                colorize: true,
                ignore: 'pid,hostname',
                translateTime: 'HH:MM:ss Z',
            },
        },
    }),
});
