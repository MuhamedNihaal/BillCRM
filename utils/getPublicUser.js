const getPublicUser = (user) => {
  if (!user) return null;
  
  const obj = typeof user.toObject === "function" ? user.toObject() : { ...user };

  delete obj.password;
  delete obj.date;
  delete obj.time;
  delete obj.__v;
  delete obj.createdAt;
  delete obj.updatedAt;

  if (obj.twoFactor) {
    delete obj.twoFactor.secret;
    delete obj.twoFactor.lastUsedOTP;
  }

  return obj;
};

export default getPublicUser;
