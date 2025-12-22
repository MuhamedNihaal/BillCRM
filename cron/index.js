import { CronJob } from "cron";
import chalk from "chalk";
import { RUN_CRON_JOBS } from "@/config/security.js";
import staffAppNotifier from "./staffAppNotifier.js";

if (RUN_CRON_JOBS) {
  console.log(chalk.greenBright("====> Cron is Enabled <===="));

  new CronJob(
    "1 * * * *", // Runs every 10 minute
    staffAppNotifier,
    null,
    true
  );
} else {
  console.log(chalk.yellowBright("====> Cron is disabled <===="));
}
