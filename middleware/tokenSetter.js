import { deRotationMap } from "@/utils/splitToken.js";
import { asyncErrorHandler } from "express-error-catcher";

export const tokenSetter = asyncErrorHandler(async (req, _, next) => {
  let token = req.headers.authorization;

  if (token && token.startsWith("Bearer ")) {
    token = token.slice(7).trim();
  } else {
    token = req.headers["x-access-token"];
  }

  if (token && typeof token === "string") {
    const raw = token
      .trim()
      .split(";")
      .map((c) => c.split("="))
      .reduce((acc, [key, value]) => {
        acc[key.trim()] = decodeURIComponent(value);
        return acc;
      }, {});

    let { _SEC_token_pA, _SEC_token_pB, _SEC_token_pC, _SEC_token_pD, _SEC_token_pE, _STATE_1_KEY } = raw;

    if (_SEC_token_pA && _SEC_token_pB && _SEC_token_pC && _SEC_token_pD && _SEC_token_pE && _STATE_1_KEY) {
      let reassemblyOrderForAccessToken = deRotationMap[_STATE_1_KEY];

      if (reassemblyOrderForAccessToken) {
        const accessParts = {
          pA: _SEC_token_pA,
          pB: _SEC_token_pB,
          pC: _SEC_token_pC,
          pD: _SEC_token_pD,
          pE: _SEC_token_pE,
        };

        const accessToken = reassemblyOrderForAccessToken.map((partKey) => accessParts[partKey]).join("");
        req.cookies = {
          ...(req.cookies ?? {}),
          token: accessToken,
        };
      }
    }
  }

  next();
});

export default tokenSetter;
