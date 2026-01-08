import axios from "axios";
import { API_URL } from "constants/app.constant";

import IndexedDB from "../utility/IndexedDB";
import {
  secPrefix,
  setAccessToken,
  setRefreshToken,
  setSocketToken,
} from "utils/setToken";
import { toast } from "sonner";
import Cookies from "js-cookie";

// apply for global axios
axios.defaults.withCredentials = true;
axios.defaults.baseURL = API_URL;

// Create a new instance of axios for API requests
const AxiosApi = axios.create({
  baseURL: API_URL,
  // timeout: 10000,
  withCredentials: true,
});

const errorReturner = (error) => {
  let formatErr = error?.response?.data ?? error;

  if (typeof formatErr === "object" && error?.response?.data?.data) {
    formatErr = { ...formatErr, ...error?.response?.data?.data };
  }

  return formatErr;
};
const responseReturner = (response) => response?.data ?? {};

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, isSuccess = false) => {
  failedQueue.forEach((prom) => {
    if (isSuccess) {
      prom.resolve({ isSuccess });
    } else {
      console.log("error listed from queue", error);
      prom.reject(errorReturner(error));
    }
  });

  failedQueue = [];
};

const attemptTokenRefresh = async () => {
  try {
    let refresh = Cookies.get("refresh");
    let tenantId = Cookies.get("tenant-id");
    if (!refresh) throw new Error("Refresh token not found");
    if (!tenantId) throw new Error("Tenant id not found");
    let _s_time = Cookies.get("_s_time");

    if (Date.now() < _s_time) {
      return true;
    }

    let { data } = await axios.post(`${API_URL}auth/refresh-token`, null, {
      headers: {
        "x-refresh-token": refresh,
        "x-tenant-id": tenantId,
      },
    });
    let response = responseReturner(data);

    if (response) {
      setRefreshToken(response.refresh, response.rememberMe ?? false);
      setSocketToken(response.socketToken);
      setAccessToken(response);
    }

    return true;
  } catch (err) {
    if (err?.response?.data?.removeRefreshToken) {
      toast.error("Your session has expired. Please log in again to continue.");
      await IndexedDB.removeToken("all");
      return false;
    }
    return true;
  }
};

AxiosApi.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error?.config;

    if (error.code === "ERR_CANCELED") {
      return;
    }

    // const status = error?.response?.status;

    if (
      // status === 401 &&
      !originalRequest._retry &&
      error?.response?.data?.reCallRefreshToken
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => AxiosApi(originalRequest))
          .catch((err) => console.log("api error from queue", err?.message));
      }

      isRefreshing = true;
      const refreshSuccess = await attemptTokenRefresh();
      isRefreshing = false;

      if (refreshSuccess) {
        processQueue(null, true);
        return AxiosApi(originalRequest);
      } else {
        processQueue(error);
        return Promise.reject(errorReturner(error));
      }
    }

    let err = errorReturner(error);

    if (err.status === 429) {
      return Promise.reject({
        status: err.status,
        message: "Too many requests, please try again later.",
      });
    }

    return Promise.reject(err);
  },
);

AxiosApi.interceptors.request.use(async (config) => {
  const accessToken = Object.entries(Cookies.get())
    .filter(([key]) => secPrefix.includes(key))
    .map(([key, value]) => `${key}=${value}`)
    .join("; ");

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  config.headers["x-tenant-id"] = Cookies.get("tenant-id");

  config.headers = {
    ...config.headers,
  };

  return config;
});

/**
 * @typedef ConfigProps
 * @property {"blob"|"json"|"text"|"arraybuffer"|"document"|"stream"|"formData"} [responseType=""]
 * @property {object} [headers={}]
 */
/**
 *
 * @async
 * @function get
 * @param {string} URL - The endpoint URL to fetch.
 * @param {ConfigProps} [config={}] - Optional Axios request configuration.
 * @returns {Promise<any>} The processed response from the API.
 * @throws {any} Returns a formatted error if the request fails.
 */

export const get = async (URL, config = {}) => {
  try {
    const response = await AxiosApi.get(URL, config);
    return responseReturner(response);
  } catch (error) {
    return Promise.reject(errorReturner(error));
  }
};

export const post = async (URL, data, config = {}) => {
  try {
    const response = await AxiosApi.post(URL, data, config);
    return responseReturner(response);
  } catch (error) {
    return Promise.reject(errorReturner(error));
  }
};

export const put = async (URL, data, config = {}) => {
  try {
    const response = await AxiosApi.put(URL, data, config);
    return responseReturner(response);
  } catch (error) {
    return Promise.reject(errorReturner(error));
  }
};

export const del = async (URL, config = {}) => {
  try {
    const response = await AxiosApi.delete(URL, config);
    return responseReturner(response);
  } catch (error) {
    return Promise.reject(errorReturner(error));
  }
};

export const getBranchDetails = () => {
  let selectedBranch = localStorage.getItem("branch");
  if (selectedBranch) {
    return JSON.parse(selectedBranch);
  }
};
