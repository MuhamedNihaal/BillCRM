export const APP_NAME = import.meta.env.VITE_APP_NAME ?? "CRM";
export const APP_KEY = import.meta.env.VITE_APP_NAME ?? "CRM";

export const API_URL = import.meta.env.VITE_API_URL;

export const SECRET_KEY = import.meta.env.VITE_SECRET_KEY ?? null;
export const SECRET_IV = import.meta.env.VITE_SECRET_IV ?? null;
export const PRODUCTION = import.meta.env.VITE_NODE_ENV === "production";

export const NOTIFICATION_VAPID_KEY = import.meta.env
  .REACT_APP_NOTIFICATION_VAPID_KEY;

// Redirect Paths
export const REDIRECT_URL_KEY = "redirect";
export const HOME_PATH = "/";
export const GHOST_ENTRY_PATH = "/login";

// Navigation Types
export const NAV_TYPE_ROOT = "root";
export const NAV_TYPE_GROUP = "group";
export const NAV_TYPE_COLLAPSE = "collapse";
export const NAV_TYPE_ITEM = "item";
export const NAV_TYPE_DIVIDER = "divider";

export const COLORS = [
  "neutral",
  "primary",
  "secondary",
  "info",
  "success",
  "warning",
  "error",
];

export const LEAD_PRIORITY = {
  1: "Cool",
  2: "Warm",
  3: "Hot",
};
