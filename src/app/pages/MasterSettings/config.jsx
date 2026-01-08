import { get, queryString } from "utility";

let OPTIONS = {
  districts: false,
  states: false,
  countries: false,
  user: false,
  relation: false,
  privilege: false,

  branch: false,
  corporative: false,
  department: false,

  company: false,
  module: false,

  signature: false,
  "main-branch": false,
  "sub-branch": false,
  "collection-center": false,
  franchise: false,
};

export const GET_OPTIONS = async (
  SET_STATE,
  options = OPTIONS,
  NAME,
  query = {},
) => {
  const route = Object.keys(options).find((key) => options[key]);
  let url = route ? `options/${route}?${queryString(query)}` : "/";
  if (typeof SET_STATE === "function") {
    try {
      let { data } = await get(url);

      SET_STATE((prev) =>
        NAME
          ? {
              ...prev,
              [NAME]: data || [],
            }
          : data,
      );
    } catch (error) {
      console.error(`Error fetching ${NAME} options:`, error);
    }
  }
};
