import path from "path";
import dotenv from "dotenv";

/**
 * Load environment variables from .env file
 */
const envPostFix = process.env.APP_ENV ? `.${process.env.APP_ENV}` : "";
const envFilePath = path.resolve(__dirname, `../../../../../.env${envPostFix}`);
dotenv.config({
  path: envFilePath,
});

module.exports = {
  SECRET: process.env.SECRET,
};

