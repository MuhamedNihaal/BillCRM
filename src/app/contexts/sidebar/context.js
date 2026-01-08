import { createSafeContext } from "utils/createSafeContext";

/**
 * @typedef {Object} SideBarContextValue
 * @property {boolean} isExpanded
 * @property {function} toggle
 * @property {function} open
 * @property {function} close
 *
 * @property {Object} isConfigChanged
 * @property {function} setIsConfigChanged
 */

/** @type {[React.FC<{value: SideBarContextValue, children: React.ReactNode}>, () => SideBarContextValue]} */
export const [SidebarContext, useSidebarContext] = createSafeContext(
  "useSidebarContext must be used within SidebarProvider",
);
