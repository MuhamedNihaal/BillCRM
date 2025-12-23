const splitRotationMap = {
  0: ["p5", "p1", "p2", "p3", "p4"],
  1: ["p2", "p3", "p4", "p5", "p1"],
  2: ["p3", "p4", "p5", "p1", "p2"],
  3: ["p4", "p5", "p1", "p2", "p3"],
};

export const deRotationMap = {
  0: ["pB", "pC", "pD", "pE", "pA"],
  1: ["pE", "pA", "pB", "pC", "pD"],
  2: ["pD", "pE", "pA", "pB", "pC"],
  3: ["pC", "pD", "pE", "pA", "pB"],
};

export const tokenPrefix = {
  ACCESS: "_SEC",
  REFRESH: "_REF",
};

export const splitTokenAndRot = (token, prefix = tokenPrefix.ACCESS) => {
  if (!token) return null;

  const N = 5;
  const len = token.length;
  const partLen = Math.ceil(len / N);
  const SPLITTED_TOKEN = [];

  for (let i = 0; i < N; i++) {
    SPLITTED_TOKEN.push(token.substring(i * partLen, (i + 1) * partLen));
  }

  const rotationKey = Math.floor(Math.random() * 4).toString();
  const orderRot = splitRotationMap[rotationKey];

  return {
    [`${prefix}_token_pA`]: SPLITTED_TOKEN[parseInt(orderRot[0].slice(1)) - 1],
    [`${prefix}_token_pB`]: SPLITTED_TOKEN[parseInt(orderRot[1].slice(1)) - 1],
    [`${prefix}_token_pC`]: SPLITTED_TOKEN[parseInt(orderRot[2].slice(1)) - 1],
    [`${prefix}_token_pD`]: SPLITTED_TOKEN[parseInt(orderRot[3].slice(1)) - 1],
    [`${prefix}_token_pE`]: SPLITTED_TOKEN[parseInt(orderRot[4].slice(1)) - 1],
    [`_STATE_${prefix === tokenPrefix.ACCESS ? 1 : 2}_KEY`]: rotationKey,
  };
};
