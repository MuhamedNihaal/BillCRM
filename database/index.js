import chalk from "chalk";
import mongoose from "mongoose";
import {
  ACCESS_TOKEN_SECRET, DATABASE_URL,
  PROJECT_NAME,REFRESH_TOKEN_SECRET,
} from "../config.js";

if (!DATABASE_URL) {
    throw new Error("DATABASE_URL must be defined");
}

if (!ACCESS_TOKEN_SECRET) {
  throw new Error("ACCESS_TOKEN_SECRET must be defined");
}

if (!REFRESH_TOKEN_SECRET) {
  throw new Error("REFRESH_TOKEN_SECRET must be defined");
}

if (!PROJECT_NAME) {
  throw new Error("PROJECT_NAME must be defined");
}

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
