/**
 * @typedef {object} UserActivity
 * @property {string} action - The action performed.
 * @property {string} description - The final resolved description of the activity.
 * @property {string} ip - IP address of the user.
 * @property {any} [reference] - Additional reference data (object, array, string, etc.).
 * @property {boolean} [show=false] - Visibility flag for user profile.
 * @property {string|null} userId - ID of the user performing the action.
 * @property {string|null} username - Username
 * @property {string} date - Date
 * @property {string} time - Time
 */

import models from "@/models/index.js";

/**
 *
 * @param {object} params
 * @param {CustomRequest} params.req - Express request object containing user and IP info.
 * @param {string} params.action - The action performed.
 * @param {string} params.description - Description template, can include `{userName}` placeholder.
 * @param {string} [params.who] - Indicates the user on whose behalf the admin is performing the action.
 * @param {boolean} [params.show=true] - Whether the activity should be visible in user profile.
 * @param {any} [params.reference=null] - Additional contextual reference data.
 * @param {any} [params.username=null] - Additional username if not pass take from req.user
 *
 * @returns {Promise<import("mongoose").Document<UserActivity>>} The saved user activity document.
 */
const userActivity = async ({ req = null, action, description, show = true, reference = null, username = null, who = null }) => {
  try {
    if (!req) throw new Error("Request must be required");

    let userName = username
      ? username
      : !req?.user?.firstName && !req?.user?.lastName
      ? req?.user?.username
      : `${req?.user?.firstName || ""} ${req?.user?.lastName || ""}`;

    userName = userName?.trim();

    if (!userName) userName = "Unknown";

    const finalDescription = description.replace("{userName}", userName);

    let userId = who ?? req.user?._id ?? null;
    let changedBy = who ? req.user?._id : null;

    let data = await new models.UserActivity({
      action,
      description: finalDescription,
      ip: req.ip,
      show,
      changedBy,
      user: userId,
      reference,
      username: userName ?? null,
      deviceId: req?.deviceId ?? null,
    }).save();

    return data;
  } catch (error) {
    throw error;
  }
};

const ACTIVITY_ACTIONS = {
  COMMON: {
    SYSTEM_INIT: "SYSTEM_INIT",
    SYSTEM_SHUTDOWN: "SYSTEM_SHUTDOWN",
    VIEW_LIST: "VIEW_LIST",
    VIEW_DETAILS: "VIEW_DETAILS",
    SEARCH: "SEARCH",
    FILTER_APPLIED: "FILTER_APPLIED",
    EXPORT_DATA: "EXPORT_DATA",
    IMPORT_DATA: "IMPORT_DATA",
    DOWNLOAD_FILE: "DOWNLOAD_FILE",
    UPLOAD_FILE: "UPLOAD_FILE",
    PRINT_RECORD: "PRINT_RECORD",
    GENERATE_REPORT: "GENERATE_REPORT",
  },

  AUTH: {
    LOGGING_ATTEMPT: "LOGGING_ATTEMPT",
    USER_LOGIN: "USER_LOGIN",
    USER_LOGOUT: "USER_LOGOUT",
    USER_LOGIN_FAILED: "USER_LOGIN_FAILED",
    TOKEN_REFRESH: "TOKEN_REFRESH",
    USER_REGISTER: "USER_REGISTER",
    USER_PROFILE_UPDATE: "USER_PROFILE_UPDATE",
    USER_PASSWORD_CHANGE: "USER_PASSWORD_CHANGE",
    USER_PASSWORD_RESET_REQUEST: "USER_PASSWORD_RESET_REQUEST",
    USER_PASSWORD_RESET_SUCCESS: "USER_PASSWORD_RESET_SUCCESS",
    PERMISSION_UPDATED: "PERMISSION_UPDATED",
    ROLE_ASSIGNED: "ROLE_ASSIGNED",
    ROLE_REVOKED: "ROLE_REVOKED",
    ACCOUNT_LOCKED: "ACCOUNT_LOCKED",
    ACCOUNT_UNLOCKED: "ACCOUNT_UNLOCKED",
    MFA_ENABLED: "MFA_ENABLED",
    MFA_DISABLED: "MFA_DISABLED",
  },

  CRUD: {
    CREATE_RECORD: "CREATE_RECORD",
    READ_RECORD: "READ_RECORD",
    UPDATE_RECORD: "UPDATE_RECORD",
    PATCH_RECORD: "PATCH_RECORD",
    DELETE_RECORD: "DELETE_RECORD",
    RESTORE_RECORD: "RESTORE_RECORD",
    ARCHIVE_RECORD: "ARCHIVE_RECORD",
    DUPLICATE_RECORD: "DUPLICATE_RECORD",
  },

  FINANCE: {
    INVOICE_GENERATED: "INVOICE_GENERATED",
    INVOICE_UPDATED: "INVOICE_UPDATED",
    INVOICE_PAID: "INVOICE_PAID",
    PAYMENT_RECEIVED: "PAYMENT_RECEIVED",
    PAYMENT_FAILED: "PAYMENT_FAILED",
    REFUND_INITIATED: "REFUND_INITIATED",
    REFUND_COMPLETED: "REFUND_COMPLETED",
    LEDGER_ENTRY_CREATED: "LEDGER_ENTRY_CREATED",
    LEDGER_ENTRY_UPDATED: "LEDGER_ENTRY_UPDATED",
    EXPENSE_ADDED: "EXPENSE_ADDED",
    EXPENSE_UPDATED: "EXPENSE_UPDATED",
  },

  DATABASE: {
    DB_BACKUP_STARTED: "DB_BACKUP_STARTED",
    DB_BACKUP_COMPLETED: "DB_BACKUP_COMPLETED",
    DB_RESTORE_INITIATED: "DB_RESTORE_INITIATED",
    DB_RESTORE_COMPLETED: "DB_RESTORE_COMPLETED",
    DB_INDEX_CREATED: "DB_INDEX_CREATED",
    DB_INDEX_DROPPED: "DB_INDEX_DROPPED",
    DB_MIGRATION_APPLIED: "DB_MIGRATION_APPLIED",
    CACHE_HIT: "CACHE_HIT",
    CACHE_MISS: "CACHE_MISS",
    CACHE_INVALIDATED: "CACHE_INVALIDATED",
  },

  CLIENT: {
    CLIENT_CREATED: "CLIENT_CREATED",
    CLIENT_UPDATED: "CLIENT_UPDATED",
    CLIENT_DELETED: "CLIENT_DELETED",
    CLIENT_STATUS_CHANGED: "CLIENT_STATUS_CHANGED",
  },

  APPOINTMENT: {
    APPOINTMENT_BOOKED: "APPOINTMENT_BOOKED",
    APPOINTMENT_RESCHEDULED: "APPOINTMENT_RESCHEDULED",
    APPOINTMENT_CANCELLED: "APPOINTMENT_CANCELLED",
  },

  INVENTORY: {
    ITEM_ADDED: "ITEM_ADDED",
    ITEM_UPDATED: "ITEM_UPDATED",
    ITEM_DELETED: "ITEM_DELETED",
    STOCK_IN: "STOCK_IN",
    STOCK_OUT: "STOCK_OUT",
    STOCK_LOW_ALERT: "STOCK_LOW_ALERT",
  },

  SECURITY: {
    API_KEY_CREATED: "API_KEY_CREATED",
    API_KEY_REVOKED: "API_KEY_REVOKED",
    UNAUTHORIZED_ACCESS_ATTEMPT: "UNAUTHORIZED_ACCESS_ATTEMPT",
    CSRF_BLOCKED: "CSRF_BLOCKED",
    TOKEN_EXPIRED: "TOKEN_EXPIRED",
    FIREWALL_RULE_TRIGGERED: "FIREWALL_RULE_TRIGGERED",
  },

  NOTIFICATIONS: {
    EMAIL_SENT: "EMAIL_SENT",
    SMS_SENT: "SMS_SENT",
    WHATSAPP_SENT: "WHATSAPP_SENT",
    NOTIFICATION_READ: "NOTIFICATION_READ",
    NOTIFICATION_DELETED: "NOTIFICATION_DELETED",
  },

  SESSION: {
    SESSION_STARTED: "SESSION_STARTED",
    SESSION_EXPIRED: "SESSION_EXPIRED",
    DEVICE_REGISTERED: "DEVICE_REGISTERED",
    DEVICE_REMOVED: "DEVICE_REMOVED",
    LOCATION_CHANGED: "LOCATION_CHANGED",
  },
};

export { userActivity, ACTIVITY_ACTIONS };
export default userActivity;
