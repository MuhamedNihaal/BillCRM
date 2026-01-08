import { createSafeContext } from "utils/createSafeContext";

/**
 * @typedef {Object} AuthContext
 * @property {boolean} isAuthenticated
 * @property {boolean} isLoading
 * @property {Error | null} errorMessage
 * @property {Object} user
 * @property {Record<string, any>} modules
 * @property {boolean | null} twoStep
 * @property {(value: object) => void} login
 * @property {(value: "" | "all" | string) => void} logout
 * @property {(twoStep: boolean | null) => void} setTwoStep
 * @property {(error: Error | null) => void} setError
 * @property {() => void} reCallCheckAllow
 */

/**
 * @type {[React.FC<{value: AuthContext, children: React.ReactNode}>, () => AuthContext]}
 */
export const [AuthContext, useAuthContext] = createSafeContext(
  "useAuthContext must be used within AuthProvider",
);
