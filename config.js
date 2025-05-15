export const PORT = process.env.PORT || 4000;
export const PROJECT_NAME = process.env.PROJECT_NAME;
export const SHORT_CODE = process.env.SHORT_CODE;
export const DATABASE_URL = process.env.DATABASE_URL;
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
export const AUTH_OTP_MESSAGE = process.env.AUTH_OTP_MESSAGE ?? null;
export const BODY_SIZE_LIMIT = process.env.BODY_SIZE_LIMIT ?? "1mb";
export const OTP_SECRET_KEY = process.env.OTP_SECRET_KEY ?? "f2145997f29de";
export const ACCESS_TOKEN_JWT_EXPIRE = process.env.ACCESS_TOKEN_JWT_EXPIRE ?? "15m";
export const ACCESS_TOKEN_RES_EXPIRE = process.env.ACCESS_TOKEN_RES_EXPIRE ?? 900000;
export const REFRESH_TOKEN_RES_EXPIRE = process.env.REFRESH_TOKEN_RES_EXPIRE ?? 2592000000;
export const SECRET_KEY = process.env.SECRET_KEY;
export const SECRET_IV = process.env.SECRET_IV;

export const PRODUCTION = process.env.PRODUCTION || null;

export const MessageCredential = {
  authkey: "331338AOs3RoGbpR5ed9ab85P1",
  sender: "SRVITH",
  route: 4,
  country: 0,
  DLT_TE_ID: "1207171810604734125",
};

export const FRONTEND_URL = "https://";

export const COLLECTIONS = {
  OTPMESSAGE: "OtpMessage",
  CUSTOMER: "Customer",
  RELATION: "Relation",
  CUSTOMERAPPTOKEN: "CustomerAppToken",
  CUSTOMERWEBTOKEN: "CustomerWebToken",

  USER_TOKEN: "userTokens",
  USER: "User",
  USERS: "users",
  LOGIN_ATTEMPTS: "login_attempts",
  PRIVILEGES: "privileges",

  MODULES: "modules",
  MAIN_MENUS: "mainMenus",
  SUB_MENUS: "subMenus",
  USER_ACTIVITY_LOGS: "user_activity_logs",
  COUNTER: "counter",

  CORPORATE: "corporates",
  TARGET_MACHINES: "target_machines",
  UNITS: "units",
  METHODS: "methods",
  HOSPITAL: "hospitals",
  DOCTORS: "doctors",
  LAB: "labs",
  ANTIBIOTICS: "antibiotics",
  ANALYSIS_TYPE: "analysis_types",
  CONSUMABLE_CATEGORY: "consumable_categories",
  CONSUMABLE: "consumables",
  RANGE_TYPE: "range-types",
  SAMPLE: "sample",
  DEPARTMENT: "department",
  SAMPLE_DATA: "sample_data",
  RANGE_TYPE: "range_types",
  BRANCH: "branches",
  OUT_SOURCE_LAB: "out_source_lab",
  TEST: "tests",
  TEST_BUNDLE: "test_bundles",
  COMPANY: "company",
  COUNTRY: "countries",
  STATE: "states",
  DISTRICT: "districts",
  COLLECTION_CENTER: "collectionCenters",

  ACCOUNT_HEAD: "accountHead",
  ACCOUNT_SUB_HEAD: "accountSubHead",
  CHART_OF_ACCOUNT: "chartOfAccount",
  FUND_TRANSFER: "fundTransfer",
  TRANSACTION_LOG: "transactionLog",
  INCOME_EXPENSE: "incomeExpense",
  CREDIT_OR_DEBIT: "debitCredit",
  CREDITS: "credits",
  CREDIT_NOTE: "creditNotes",
  PAYMENTS: "payments",

  OFFER_CODE: "offerCode",
  OFFER_CODE_LOG: "offerCodeLog",

  BILLING: "billing",
  PRODUCT: "products",
  CUSTOMER_CATEGORY: "customer_categories",
  SUPPLIER: "suppliers",
  PURCHASE: "purchase",
  PURCHASE_ACCEPTED: "purchaseAcceptedItems",
  STOCK: "stock",
  STOCK_LOG: "stockLogs",
  DISCOUNT_REQUEST: "discount_requests",
  BILLING_TESTS: "billing_tests",
  REMARKS: "remarks",
};



export const PRIVILEGES = {
  ADMIN: "67ca826f9ebbcf241e60d459",
  DEVELOPER: "67d7f201d3811d524524b0a0",
};

export const DISCOUNT_APPROVER = {
  admin: "67ca826f9ebbcf241e60d459",
  manager: "68186a442f85dcb003621ebc",
};

export const ACCOUNT_HEAD = {
  EXPENSE: "65dc333401e1f55ffee67adb",
  INCOME: "65dc332901e1f55ffee67ad1",
  BANK: "65dc333901e1f55ffee67ae3",
};

export const ACCOUNT_SUBHEAD = {
  OFFICE_ACCOUNT: "67e235f5d6686ff281cbfba9",
  ONLINE: "67e2399ed6686ff281cbfbb8",
  SALARY: "67e239bcd6686ff281cbfbbf",
  BILL: "67e23a26d6686ff281cbfbc6",
  SUPPLIER_ACCOUNT: "6822e02b7a459e94fac7d770",
};

export const CHART_OF_ACCOUNT = {
  BILL: "662f3d4f8ed17906b8dab7dc",
  STAFF_REMUNERATION: "662f3d7f8ed17906b8dab7eb",
  GPAY: "6644d18f70241537c47e9d4d",
  PAYTM: "6644d30970241537c47e9d53",
};

export const PAYMENTS_METHOD = Object.freeze({ ONLINE: 1, CASH: 2 });
export const INCOME_EXPENSE_TYPES = Object.freeze({ INCOME: 1, EXPENSE: 2 });
export const TRANSACTION_LOG_TYPES = Object.freeze({ CREDIT: 1, DEBIT: 2 });
