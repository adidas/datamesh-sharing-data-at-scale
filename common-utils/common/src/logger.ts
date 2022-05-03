import winston, { transports, Logger as WinstonLogger } from 'winston';

/**
 * Winston logger for debugging your application
 */
export class Logger {
  private readonly logger: WinstonLogger;
  private readonly tag?: string;

  private constructor(winstonLogger: WinstonLogger, tag?: string) {
    this.logger = winstonLogger;
    this.tag = tag;
  }

  public static withLevel(level: string): Logger {
    return new Logger(
      winston.createLogger({
        level,
        format: winston.format.simple(),
        transports: [ new transports.Console() ]
      })
    );
  }

  /**
    * For testing purposes so the output is cleaner
    * @returns {Logger} a Logger instance that suppress all logs
    */
  public static silent(): Logger {
    return new Logger(
      winston.createLogger({
        silent: true
      })
    );
  }

  /**
    * It returns a new logger instance wich will print every subsequent output with a tag.
    *
    * @param { string } tag - Tag which is attached to every subsequent output
    *
    * @returns { Logger } a Logger instance that suppress all logs
    */
  public withTag(tag: string): Logger {
    return new Logger(this.logger, tag);
  }

  /**
    * It prints as debug level
    *
    * @param { Array<any> } params - List of arguments to be printed
    */
  public debug(...params: Array<any>): void {
    const strings = params.map((p: any) => JSON.stringify(p));

    this.logger.debug(this.tagged(strings.join(' ')));
  }

  /**
    * It prints as info level
    *
    * @param { Array<any> } params - List of arguments to be printed
    */
  public info(...params: Array<any>): void {
    const strings = params.map((p: any) => JSON.stringify(p));

    this.logger.info(this.tagged(strings.join(' ')));
  }

  /**
    * It prints as error level
    *
    * @param { Array<any> } params - List of arguments to be printed
    */
  public error(...params: Array<any>): void {
    const strings = params.map((p: any) => JSON.stringify(p));

    this.logger.error(this.tagged(strings.join(' ')));
  }

  private tagged(value: string): string {
    if (this.tag) {
      return `${ this.tag } | ${ value }`;
    }

    return value;
  }
}
