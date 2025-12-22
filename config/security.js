export const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
];

export const PORT = process.env.PORT || 4000;
export const NODE_ENV = process.env.NODE_ENV || "development";
export const production = NODE_ENV === "production";

export const RUN_CRON_JOBS = process.env.RUN_CRON_JOBS === "true";

export const COMPANY = "";
export const MAIN_BRANCH = "";

export const SECRET_KEY = process.env.SECRET_KEY;
export const SECRET_IV = process.env.SECRET_IV;

export const SUPER_ADMIN_ID = "";

export const MASTER_MODULE = "";

export const DATABASE_URL = process.env.DATABASE_URL;

export const PROJECT_NAME = process.env.PROJECT_NAME;

export const privilege = Object.freeze({
  SUPER_ADMIN: "",
  DEVELOPER: "",
  STAFF_APP: "",
});

export const cors = () => {
  return {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  };
};

export const session_secret = process.env.SESSION_SECRET || "42e80c5c230dd40dc819e4eb874bdc501f080c6d3e3e276cdf102aa6";

/**
 * @typedef {Object} JwtAccessResult
 * @property {string} secret
 * @property {string} expiresIn
 */

/**
 * @param {"crm" | "app" | "website"} prefix
 * @param {string} [expiresIn="15m"]
 * @returns {JwtAccessResult}
 */
export const jwt_access = (prefix = null, expiresIn = "15m") => {
  if (!prefix) {
    throw new Error("JWT prefix is required. Example: jwt_access('crm')");
  }

  const secretEnvVar = `JWT_${prefix.toUpperCase()}_${process.env.JWT_ACCESS_SECRET}`;

  return {
    secret: secretEnvVar,
    expiresIn: expiresIn,
  };
};

/**
 * @param {"crm" | "app" | "website"} prefix
 * @param {Boolean} [rememberMe=false]
 * @returns {JwtAccessResult}
 */
export const jwt_refresh = (prefix = null, rememberMe = false) => {
  if (!prefix) {
    throw new Error("JWT prefix is required. Example: jwt_refresh('crm')");
  }

  const expiresIn = rememberMe ? "30d" : process.env.JWT_EXPIRES_IN || "7d";
  const secretEnvVar = `JWT_${prefix.toUpperCase()}_${process.env.JWT_REFRESH_SECRET}`;

  return {
    secret: secretEnvVar,
    expiresIn: expiresIn,
  };
};

/**
 * @param {"crm" | "app" | "website"} prefix
 * @param {string} [expiresIn="30m"]
 * @returns {JwtAccessResult}
 */
export const jwt_media = (prefix = null, expiresIn = "30m") => {
  if (!prefix) {
    throw new Error("JWT prefix is required. Example: jwt_media('crm')");
  }

  const secretEnvVar = `JWT_${prefix.toUpperCase()}_${process.env.JWT_MEDIA_SECRET}`;

  return {
    secret: secretEnvVar,
    expiresIn: expiresIn,
  };
};

export const BCRYPT_SALT_ROUNDS = process.env.BCRYPT_SALT_ROUNDS ? parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) : 10;

export const BODY_SIZE_LIMIT = process.env.BODY_SIZE_LIMIT ?? "1mb";

const requiredEnvVars = ["DATABASE_URL", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET", "SESSION_SECRET", "JWT_MEDIA_SECRET", "SECRET_KEY", "SECRET_IV"];

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(", ")}`);
  process.exit(1);
}
