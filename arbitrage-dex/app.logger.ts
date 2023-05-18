import { Logger, format, createLogger, transports, log } from "winston";

export class AppLogger {
  private static logger = createLogger({
    level: "info",
    transports: [
      new transports.Console(),
      new transports.File({ filename: "combined.log" }),
    ],
  });

  public static info(key, data) {
    this.logger.log("info", this.GetValue(key, data));
  }
  public static debug(key, data) {
    this.logger.log("debug", this.GetValue(key, data));
  }

  public static error(key, data) {
    this.logger.log("error", this.GetValue(key, data));
  }

  private static GetValue(key, value: any) {
    return typeof value === "string"
      ? `${key}-  ${value}`
      : `${key}-${JSON.stringify(value)[key]}`;
  }
}
