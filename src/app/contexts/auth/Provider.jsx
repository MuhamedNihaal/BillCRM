// Import Dependencies
import { useEffect, useReducer, useRef } from "react";
import PropTypes from "prop-types";

// Local Imports
import { setSession } from "utils/jwt";
import { AuthContext } from "./context";
import DeviceFingerprint from "utility/DeviceFingerprint";
import { decodeAndEncode, get, IndexedDB, post } from "utility";
import { useConfirm } from "components/ConfirmModal";
import { toast } from "sonner";
import { useCookies } from "react-cookie";
import {
  secPrefix,
  setAccessToken,
  setRefreshToken,
  setSocketToken,
} from "utils/setToken";
import Cookies from "js-cookie";
import { API_URL } from "constants/app.constant";
import { useDidUpdate } from "hooks";

import RepairServer from "assets/illustrations/repair-server.svg?react";

// ----------------------------------------------------------------------

const initialState = {
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  errorMessage: null,
  user: null,
  modules: null,
  twoStep: { enabled: false },
};

const reducerHandlers = {
  INITIALIZE: (state, action) => {
    const { isAuthenticated, user, modules } = action.payload;
    return {
      ...state,
      isAuthenticated,
      isInitialized: true,
      user,
      modules,
    };
  },

  LOGIN_REQUEST: (state) => {
    return {
      ...state,
      isLoading: true,
    };
  },

  LOGIN_SUCCESS: (state, action) => {
    const { user, modules } = action.payload;
    return {
      ...state,
      isAuthenticated: true,
      isLoading: false,
      errorMessage: null,
      user,
      modules,
    };
  },

  LOGIN_ERROR: (state, action) => {
    const { errorMessage } = action.payload;

    return {
      ...state,
      errorMessage,
      isLoading: false,
    };
  },

  LOGOUT: (state) => ({
    ...state,
    isAuthenticated: false,
    user: null,
    modules: [{}],
  }),
  TWO_STEP: (state, action) => ({
    ...state,
    errorMessage: null,
    twoStep: action.payload,
  }),
};

const reducer = (state, action) => {
  const handler = reducerHandlers[action.type];
  if (handler) {
    return handler(state, action);
  }
  return state;
};

export function AuthProvider({ children }) {
  const confirm = useConfirm();
  const [state, dispatch] = useReducer(reducer, initialState);
  const error500Ref = useRef(0);

  const [cookies] = useCookies([
    "_SEC_token_pA",
    "_SEC_token_pB",
    "_SEC_token_pC",
    "_SEC_token_pE",
    "_STATE_1_KEY",
    "refresh",
    "tenant-id",
    "_s_time",
  ]);

  let refreshTimer = useRef(null);
  let initialCalled = useRef(true);

  const fetchRefreshToken = async () => {
    let _s_time = cookies?._s_time;

    if (refreshTimer.current) clearTimeout(refreshTimer.current);

    refreshTimer.current = setTimeout(async () => {
      if (initialCalled.current) {
        return;
      }

      if (Date.now() < _s_time) {
        return;
      }

      try {
        let { data: token } = await post(`${API_URL}auth/refresh-token`, null, {
          headers: {
            ["x-refresh-token"]: cookies.refresh,
          },
        });

        if (token) {
          setRefreshToken(token.refresh, token.rememberMe ?? false);
          setSocketToken(token.socketToken);
          setAccessToken(token);
        }
      } catch (err) {
        if (err.removeRefreshToken) {
          dispatch({
            type: "INITIALIZE",
            payload: {
              isAuthenticated: false,
              user: null,
              modules: [{}],
            },
          });

          await IndexedDB.removeToken("all");
        }
      }
    }, 100);
  };

  const forceLogout = async () => {
    setSession(null);
    dispatch({ type: "LOGOUT" });

    try {
      await post("auth/logout?device=all");
    } catch (error) {
      console.log("Logout error:", error.message);
    }

    await IndexedDB.removeToken("all");
  };

  useDidUpdate(() => {
    const isAnyInvalid = secPrefix.some((key) => {
      const value = String(Cookies.get(key));
      return !value || value === "undefined" || value === "null";
    });

    if (isAnyInvalid) {
      secPrefix.map((name) => {
        Cookies.remove(name);
      });
    }

    if (isAnyInvalid && cookies.refresh) {
      fetchRefreshToken();
    }

    if (isAnyInvalid && String(cookies.refresh) === "undefined") {
      dispatch({
        type: "INITIALIZE",
        payload: {
          isAuthenticated: false,
          user: null,
          modules: [{}],
        },
      });

      // window.location = "/";
    }
  }, [cookies]);

  useEffect(() => {
    const init = async () => {
      let info = null;

      try {
        const isAnyInvalid = secPrefix.some((key) => {
          const value = String(Cookies.get(key));
          return !value || value === "undefined" || value === "null";
        });

        info = await IndexedDB.getToken("info");

        if (info) {
          dispatch({
            type: "INITIALIZE",
            payload: {
              isAuthenticated: true,
              user: info.user,
              modules: info.modules,
            },
          });
        }

        if (isAnyInvalid && cookies.refresh) {
          let { data: token } = await post(
            `${API_URL}auth/refresh-token`,
            null,
            {
              headers: {
                ["x-refresh-token"]: cookies.refresh,
              },
            },
          );

          if (token) {
            setRefreshToken(token.refresh, token.rememberMe ?? false);
            setSocketToken(token.socketToken);
            setAccessToken(token);
          }

          let { data } = await get("auth/check-allowed");
          info = decodeAndEncode(data, false);

          dispatch({
            type: "INITIALIZE",
            payload: {
              isAuthenticated: true,
              user: info.user,
              modules: info.modules,
            },
          });
          await IndexedDB.storeToken(data, "info");
        } else if (String(cookies._STATE_1_KEY) !== "undefined") {
          let { data } = await get("auth/check-allowed");
          info = decodeAndEncode(data, false);

          dispatch({
            type: "INITIALIZE",
            payload: {
              isAuthenticated: true,
              user: info.user,
              modules: info.modules,
            },
          });
          await IndexedDB.storeToken(data, "info");
        } else {
          dispatch({
            type: "INITIALIZE",
            payload: {
              isAuthenticated: false,
              user: null,
              modules: [{}],
            },
          });
        }
      } catch (err) {
        if (err.status === 429) {
          error500Ref.current = 429;
        }

        if (err.code === "ERR_NETWORK") {
          dispatch({
            type: "LOGIN_ERROR",
            payload: {
              errorMessage: err,
            },
          });
          error500Ref.current = 500;
        }

        if (err.removeRefreshToken || !info) {
          dispatch({
            type: "INITIALIZE",
            payload: {
              isAuthenticated: false,
              user: null,
              modules: [{}],
            },
          });

          await IndexedDB.removeToken("all");
        }
      } finally {
        initialCalled.current = false;
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (values) => {
    dispatch({
      type: "LOGIN_REQUEST",
    });

    try {
      let deviceId = await DeviceFingerprint.getFingerprint();
      values = { ...values, deviceId };

      let { data } = await post("auth/login", values);

      if (data.twoFa) {
        setTwoStep({
          enabled: true,
          qrCode: data?.qrcode || null,
          used: data?.used || false,
          token: data?.tempToken,
          rememberMe: values.rememberMe ?? false,
        });
        return;
      } else {
        setRefreshToken(data.refresh, values.rememberMe ?? false);
        setSocketToken(data.socketToken);
        setAccessToken(data);
      }

      let { data: infoData } = await get("auth/check-allowed");

      await IndexedDB.storeToken(infoData, "info");

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: decodeAndEncode(infoData, false),
      });
    } catch (err) {
      dispatch({
        type: "LOGIN_ERROR",
        payload: {
          errorMessage: err,
        },
      });
    }
  };

  const reCallCheckAllow = async (login = false) => {
    try {
      if (login) {
        dispatch({
          type: "INITIALIZE",
          payload: {
            isAuthenticated: true,
            user: {},
            modules: [],
          },
        });
      }

      let { data } = await get("auth/check-allowed");
      const response = decodeAndEncode(data, false);

      dispatch({
        type: "INITIALIZE",
        payload: {
          isAuthenticated: true,
          user: response.user,
          modules: response.modules,
        },
      });
      setTwoStep({ enabled: false });
      await IndexedDB.storeToken(data, "info");
    } catch (error) {
      console.log(error);
    }
  };

  const logout = async (all = "") => {
    let description =
      all == ""
        ? "Are you sure you want to log out? You will need to sign in again to access your account."
        : all == "all"
          ? "Log out of all active sessions across all devices, including your current session. It may take up to 30 minutes for other devices to be logged out."
          : "This will end the session on the selected device. You will remain logged in on this device and need to sign in again on the other one to continue access.";

    let result = await confirm({
      pending: {
        title: "Are you sure?",
        description,
        actionText: "Log out",
      },
      success: {
        title: "Logout successful",
        description: "You have been logged out as requested.",
      },
      error: {
        title: "Logout failed",
        description:
          "Something went wrong. Please check your internet connection and try again.",
      },
    });

    if (result.status) {
      try {
        await post(`auth/logout?device=${all}`);
        result?.setConfirmLoading(false);
        result.setSuccess(true);

        if (all == "all" || all == "") {
          result.close();
          setSession(null);
          dispatch({ type: "LOGOUT" });
          await IndexedDB.removeToken("all");
        }

        window.location = "/login";
        return true;
      } catch (error) {
        console.log(error);
        result.setDialogContent({
          error: {
            title: "Logout failed",
            description:
              error?.errorMessage ??
              "Something went wrong. Please check your internet connection and try again.",
          },
        });

        result?.setConfirmLoading(false);
        result.setError(true);

        return false;
      }
    }
    return false;
  };

  const loginAgain = () => {
    dispatch({
      type: "INITIALIZE",
      payload: {
        isAuthenticated: false,
        user: null,
        modules: [{}],
      },
    });

    dispatch({
      type: "TWO_STEP",
      payload: { enabled: false },
    });

    toast.info("Login Again");
  };

  const setTwoStep = (twoStep) => {
    dispatch({
      type: "TWO_STEP",
      payload: twoStep,
    });
  };

  const setError = (errorMessage) => {
    dispatch({
      type: "LOGIN_ERROR",
      payload: {
        errorMessage: errorMessage,
      },
    });
  };

  if (error500Ref.current === 500 || error500Ref.current === 429) {
    return (
      <div className="min-h-100vh relative flex w-full flex-col items-center justify-center p-4">
        <RepairServer
          className="size-64 w-full"
          style={{
            "--primary": "#23a3a5",
            "--dark-400": "#1a6c6d",
            "--dark-600": "#1e5253",
          }}
        />
        <p className="text-primary-600 dark:text-primary-500 pt-8 text-7xl font-bold">
          {error500Ref.current === 429 ? "429" : "521"}
        </p>
        <p className="dark:text-dark-50 pt-4 text-xl font-semibold text-gray-800">
          Oops! Something Broke
        </p>
        <p className="dark:text-dark-200 pt-2 text-balance text-gray-500">
          {error500Ref.current === 429
            ? "Too many requests from this IP, please try again later"
            : "The server seems to be taking a nap. Please hang tight and try again in a little while."}
        </p>
      </div>
    );
  }

  if (!children) {
    return null;
  }

  return (
    <AuthContext
      value={{
        ...state,
        login,
        logout,
        loginAgain,
        setTwoStep,
        forceLogout,
        setError,
        reCallCheckAllow,
      }}
    >
      {children}
    </AuthContext>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node,
};
