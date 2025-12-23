import chalk from "chalk";
import mongoose from "mongoose";
import { DATABASE_URL } from "@/config/security.js";

var options = {
  connectTimeoutMS: 30000,
};

const connectDB = () => {
  return new Promise((resolve, reject) => {
    mongoose
      .connect(DATABASE_URL, options)
      .then(() => {
        console.log(chalk.whiteBright("Database connection established"));
        resolve();
      })
      .catch((err) => {
        console.log(chalk.red("Error connecting to database:"), err.message);
        reject();
      });
  });
};

export default connectDB;
