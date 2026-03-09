/**
 * logger.js — Logger condicional para producción
 *
 * En producción (import.meta.env.PROD === true) todos los logs son silenciados.
 * En desarrollo se comporta igual que console.
 *
 * Uso:
 *   import logger from '../utils/logger'
 *   logger.log('mensaje')
 *   logger.error('error', err)
 *   logger.warn('advertencia')
 */
const isDev = import.meta.env.DEV

const logger = {
    log:   (...args) => { if (isDev) console.log(...args) },
    error: (...args) => { if (isDev) console.error(...args) },
    warn:  (...args) => { if (isDev) console.warn(...args) },
    info:  (...args) => { if (isDev) console.info(...args) },
}

export default logger
