export const PORT = process.env.PORT || 4000;
export const PROJECT_NAME = process.env.PROJECT_NAME;
export const SHORT_CODE = process.env.SHORT_CODE;
export const DATABASE_URL = process.env.DATABASE_URL;
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
export const MEDIA_TOKEN = process.env.MEDIA_TOKEN_SECRET ?? null;
export const MEDIA_TOKEN_EXPIRE = process.env.MEDIA_TOKEN_EXPIRE ?? "10m";
export const MEDIA_URL = process.env.MEDIA_URL ?? null;
export const AUTH_OTP_MESSAGE = process.env.AUTH_OTP_MESSAGE ?? null;
export const BODY_SIZE_LIMIT = process.env.BODY_SIZE_LIMIT ?? "1mb";
export const OTP_SECRET_KEY = process.env.OTP_SECRET_KEY ?? "f2145997f29de";
export const ACCESS_TOKEN_JWT_EXPIRE = process.env.ACCESS_TOKEN_JWT_EXPIRE ?? "15m";
export const ACCESS_TOKEN_RES_EXPIRE = process.env.ACCESS_TOKEN_RES_EXPIRE ?? 900000;
export const REFRESH_TOKEN_RES_EXPIRE = process.env.REFRESH_TOKEN_RES_EXPIRE ?? 2592000000;
export const SECRET_KEY = process.env.SECRET_KEY;
export const SECRET_IV = process.env.SECRET_IV;
export const RUN_CRON_JOBS = process.env.RUN_CRON_JOBS === "true";

export const IS_RUN_RABBITMQ = process.env.RABBITMQ === "true";
export const RABBITMQ_URL = process.env.RABBITMQ_URL ?? "amqp://localhost:5672";

export const PRODUCTION = process.env.PRODUCTION === "true";

export const COLLECTIONS = {
  //=====> Bill Related Collections
  DISCOUNT_REQUEST: "discount_requests",
  BILLING: "billing",
  BILLING_TESTS: "billing_tests",
  BILLED_TEST_RECORDS: "BilledTestRecords",
  BILLED_TEST_RECORD_LOG: "billedTestRecordLogs",
  // End Bill Related Collections

  //=====> Customer Related Collections
  CUSTOMER: "Customer",
  PROFILE: "Profile",
  RELATION: "Relation",

  COLLECTION_REQUEST: "CollectionRequest",
  OTPMESSAGE: "OtpMessage",
  CUSTOMERAPPTOKEN: "CustomerAppToken",
  CUSTOMERWEBTOKEN: "CustomerWebToken",

  //=====> Master & Security Collections
  USER_TOKEN: "userTokens",
  LOGIN_ATTEMPTS: "login_attempts",
  USERS: "users",
  PRIVILEGES: "privileges",
  USER_ACTIVITY_LOGS: "user_activity_logs",
  GALLERY: "galleries",
  //-> Menus and Modules
  MODULES: "modules",
  MAIN_MENUS: "mainMenus",
  SUB_MENUS: "subMenus",
  // USER: "User",

  // Other Collections
  COUNTER: "counter",
  DOCTORS: "doctors",
  CORPORATE: "corporates",
  HOSPITAL: "hospitals",
  LAB: "labs",
  OUT_SOURCE_LAB: "out_source_lab",
  BRANCH: "branches",
  COMPANY: "company",
  COLLECTION_CENTER: "collectionCenters",
  // End Other Collections

  //=====> Test Catalog
  TEST: "tests",
  TEST_BUNDLE: "test_bundles",
  TARGET_MACHINES: "target_machines",
  // End Test Catalog

  //====> Manage Related Collections
  UNITS: "units",
  METHODS: "methods",
  ANTIBIOTICS: "antibiotics",
  ANALYSIS_TYPE: "analysis_types",
  CONSUMABLE: "consumables",
  CONSUMABLE_CATEGORY: "consumable_categories",
  RANGE_TYPE: "range-types",
  SAMPLE: "sample",
  DEPARTMENT: "department",
  SAMPLE_DATA: "sample_data",
  RANGE_TYPE: "range_types",
  ORGAN: "organ",
  REMARKS: "remarks",
  HEALTHRISK: "healthRisk",
  HEALTHPACKAGE: "healthpackage",
  HEALTHCONDITION: "healthCondition",
  FAQ: "faq",
  // End Manage Related Collections

  // Options Only Collections
  COUNTRY: "countries",
  STATE: "states",
  DISTRICT: "districts",
  SIGNATURES: "signatures",
  // End Options Only Collections

  //=====> Finance Related Collections
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
  WALLET_COLLECTION: "walletCollection",
  // End Finance Related Collections

  OFFER_CODE: "offerCode",
  OFFER_CODE_LOG: "offerCodeLog",

  //====> Inventory Related Collections
  PRODUCT: "products",
  CUSTOMER_CATEGORY: "customer_categories",
  SUPPLIER: "suppliers",
  PURCHASE: "purchase",
  PURCHASE_ACCEPTED: "purchaseAcceptedItems",
  PURCHASE_REQUEST: "purchaseRequest",
  STOCK: "stock",
  STOCK_LOG: "stockLogs",
  // Inventory Related Collections'

  NOTIFICATION: "notification",

  //===> Lead Related Collections
  LEAD: "leads",
  LEAD_FOLLOUP: "lead_followups",
  APPOINTMENT: "appointments",
  CAREERS: "careers",
  BLOG: "blog",
  TESTIMONIAL: "testimonial",
  CART: "cart",
  ORDERS: "orders",
  PAYMENT_SESSION: "paymentSession",
  DISCOUNT: "discount",
  BOOKINGLOCK: "booking_lock",
  PAYMENT: "payment",
};
