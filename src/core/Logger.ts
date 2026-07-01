import { LoggerOptions } from '#shared/types'
import { PROJECT_NAME } from '#shared/constant'

export class Logger {

  private readonly debug: boolean
  private readonly logLevel: number
  private readonly alertError: boolean

  constructor(options: LoggerOptions = {}) {
    const {
      debug = false,
      logLevel = 1,
      alertError = false,
    } = options

    this.debug = debug
    this.logLevel = logLevel
    this.alertError = alertError
  }

  public error(message: string, service: string = PROJECT_NAME) {
    this.log(message, service, 1)
  }

  public warn(message: string, service: string = PROJECT_NAME) {
    this.log(message, service, 2)
  }

  public info(message: string, service: string = PROJECT_NAME) {
    this.log(message, service, 3)
  }

  private log(message: string, service: string, errorLevel: number = 3) {
    if (errorLevel > this.logLevel) return

    if (errorLevel >= 2 && !this.debug) return

    if ((globalThis.window !== undefined && globalThis.console?.log()) || typeof console !== 'undefined') {
      switch (errorLevel) {
        case 1:
          console.log(`%c[${PROJECT_NAME}] %c${message} from ${service}`, 'background: red; padding: 2px 8px; margin-right: 10px;', 'black')
          break
        case 2:
          console.log(`%c[${PROJECT_NAME}] %c${message} from ${service}`, 'background: orange; padding: 2px 8px; margin-right: 10px;', 'black')
          break
        case 3:
          console.log(`[Klapy] ${message} from ${service}`)
          break
        default:
          console.log(`[Klapy] ${message} from ${service}`)
          break
      }
    }
  }


}