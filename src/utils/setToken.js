import { PRODUCTION } from "constants/app.constant";
import Cookies from "js-cookie";

export const secPrefix = [
  "_SEC_token_pA",
  "_SEC_token_pB",
  "_SEC_token_pC",
  "_SEC_token_pD",
  "_SEC_token_pE",
  "_STATE_1_KEY",
];

export const refPrefix = [
  "_REF_token_pA",
  "_REF_token_pB",
  "_REF_token_pC",
  "_REF_token_pD",
  "_REF_token_pE",
  "_STATE_2_KEY",
];

export const setAccessToken = (token) => {
  const expiry = new Date(Date.now() + 15 * 60 * 1000);
  if (!token) return;

  const cookieOptions = {
    path: "/",
    secure: PRODUCTION,
    sameSite: "Strict",
    expires: expiry,
  };

  let count = 1;
  Object.entries(token).forEach(([name, value]) => {
    if (secPrefix.includes(name)) {
      Cookies.set(name, value, cookieOptions);
      count++;
    }
  });
  if (count === secPrefix.length) Cookies.set("token_set", Date.now());
};

export const setSocketToken = (token) => {
  const expireDuration = 1;
  if (!token) return;

  const expiry = new Date(Date.now() + expireDuration * 24 * 60 * 60 * 1000);

  const cookieOptions = {
    path: "/",
    secure: PRODUCTION,
    sameSite: "Strict",
    expires: expiry,
  };

  Cookies.set("sToken", token, cookieOptions);
};

export const setRefreshToken = (token, rememberMe = false) => {
  const expireDuration = rememberMe ? 30 : 7;
  if (!token) return;

  const expiry = new Date(Date.now() + expireDuration * 24 * 60 * 60 * 1000);

  const cookieOptions = {
    path: "/",
    secure: PRODUCTION,
    sameSite: "Strict",
    expires: expiry,
  };

  Cookies.set("_s_time", Date.now() + 1 * 60 * 1000);
  Cookies.set("refresh", token, cookieOptions);
};
