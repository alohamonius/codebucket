import { Logger, format, createLogger, transports, log } from "winston";
import { Fs } from "./fs.module";

export class AppLogger {
  static customDateFormat = format.printf(({ timestamp, level, message }) => {
    const formattedTimestamp = timestamp;
    return `[${formattedTimestamp}] ${level.toUpperCase()}: ${message}`;
  });

  private static logger = createLogger({
    level: "info",
    format: format.combine(
      format.timestamp(), // Add timestamp to the log
      AppLogger.customDateFormat // Use the custom date format
    ),
    transports: [
      new transports.Console(),
      new transports.File({ filename: "combined.log" }),
    ],
  });

  public static file() {
    // const e = await Fs.writeAsync(
    //   "./pairsToPools.json",
    //   Array.from(this.pairsToPools.entries())
    // );
  }
  public static info(data) {
    this.logger.log("info", this.GetValue(data));
  }
  public static debug(data) {
    this.logger.log("debug", this.GetValue(data));
  }

  public static error(data) {
    this.logger.log("error", this.GetValue(data));
  }

  private static GetValue(value: any) {
    return typeof value === "string" ? ` ${value}` : `${JSON.stringify(value)}`;
  }
}
