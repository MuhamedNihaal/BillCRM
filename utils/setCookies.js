const setTokensCookies = (
  res,accessToken,refreshToken,
  newAccessTokenExp,newRefreshTokenExp
) => {
  const accessTokenMaxAge =(newAccessTokenExp - Math.floor(Date.now() / 1000)) * 1000;
  const refreshTokenmaxAge =(newRefreshTokenExp - Math.floor(Date.now() / 1000)) * 1000;

  res.cookie("custAccessToken", accessToken, {
    httpOnly: true,
    secure: true,
    maxAge: accessTokenMaxAge,
    sameSite: "none",
  });

  res.cookie("custRefreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    maxAge: refreshTokenmaxAge,
    sameSite: "none",
  });
};

export default setTokensCookies;
