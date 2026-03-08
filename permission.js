import crmAuth from "./middleware/crmAuth.js";

const withAuth =
  (menu, defaultOptions = {}) =>
  (router, path = "/", middleware = false, overrideOptions = {}) => {
    const options = { ...defaultOptions, ...overrideOptions };

    const auth = crmAuth({ menu, ...options });

    return middleware ? auth : router.use(path, auth);
  };

const subWithAuth =
  (sub_menu, defaultOptions = {}) =>
  (router, path = "/", middleware = false, overrideOptions = {}) => {
    const options = { ...defaultOptions, ...overrideOptions };

    const auth = crmAuth({ sub_menu, ...options });

    return middleware ? auth : router.use(path, auth);
  };

const permission_override = {
  allowPermission: { edit: true, create: true, remv: true },
};

export const COMMON_ROUTER = (router, path, middleware = false) => {
  const auth = crmAuth({ common: true });
  return middleware ? auth : router.use(path, auth);
};

export const MASTER_SETTING = {
  // sub menus
  department: subWithAuth("/master-setting/manage/department"),
  blockedIp: subWithAuth("/master-setting/security/blocked-ips"),
  activityLog: subWithAuth("/master-setting/security/activity-log"),

  // main menu
  collectionCenter: withAuth("/master-setting/collection-center"),
  user: withAuth("/master-setting/user"),
  company: withAuth("/master-setting/company"),
  branch: withAuth("/master-setting/branch"),

  privilege: withAuth("/master-setting/privilege", permission_override),
  module: withAuth("/master-setting/modules", permission_override),
  rules: withAuth("/master-setting/rules", permission_override),
};

export const FINANCE = {
  //? sub menu
  incomeExpenseReport: subWithAuth(
    "/finance/reports/income-expense-report",
    permission_override,
  ),
  profitAndLossReport: subWithAuth(
    "/finance/reports/profit-loss",
    permission_override,
  ),
  report: subWithAuth("/finance/reports/report", permission_override),
  dailyReport: subWithAuth(
    "/finance/reports/daily-report",
    permission_override,
  ),

  //? main menu
  dashboard: withAuth("/finance/dashboard", permission_override),
  chartOfAccount: withAuth("/finance/chart-of-account"),
  transactionLog: withAuth("/finance/transaction-log", permission_override),
  credits: withAuth("/finance/income-and-expense"),
  pendingDues: withAuth("/finance/pending-dues", permission_override),
  fundTransfer: withAuth("/finance/fund-transfer"),
  outstandingBills: withAuth("/finance/outstanding-bills", permission_override),
  creditDebit: withAuth("/finance/debit-and-credit", permission_override),
  head: withAuth("/finance/head"),
  subHead: withAuth("/finance/sub-head"),
};

export const WEBSITE = {
  //-- Offercode
  verifyOfferCode: withAuth("/website/billing", permission_override),
  offerCodeList: subWithAuth("/website/offer-code/list"),
  offerCodeLog: subWithAuth("/website/offer-code/logs"),

  careers: withAuth("/website/careers"),
  blogs: withAuth("/website/blogs"),
  testimonials: withAuth("/website/blogs"),
  contactInquiries: withAuth("/website/contact-inquiries"),
  gallery: withAuth("/website/gallery"),
  discounts: withAuth("/website/discounts"),
};

export const TEST = {
  // sub menus
  units: subWithAuth("/test/manage/units"),
  methods: subWithAuth("/test/manage/methods"),
  antibiotics: subWithAuth("/test/manage/antibiotics"),
  analysisType: subWithAuth("/test/manage/analysis-type"),
  consumable: subWithAuth("/test/manage/consumable"),
  consumableCategory: subWithAuth("/test/manage/consumable-category"),
  rangeType: subWithAuth("/test/manage/range-type"),
  sample: subWithAuth("/test/manage/sample"),
  sampleData: subWithAuth("/test/manage/sample-data"),
  healthRisk: subWithAuth("/test/manage/health-risk"),
  healthPackage: subWithAuth("/test/manage/health-package"),
  healthCondition: subWithAuth("/test/manage/health-condition"),
  remarks: subWithAuth("/test/manage/remarks"),

  test: subWithAuth("/test/tests/test"),
  group: subWithAuth("/test/tests/group"),
  subPackage: subWithAuth("/test/tests/sub-package"),
  package: subWithAuth("/test/tests/package"),
  culture: subWithAuth("/test/tests/culture"),
  examination: subWithAuth("/test/tests/examination"),

  // main menus
  dashboard: withAuth("/test/dashboard", permission_override),
  faq: withAuth("/test/faq"),
  testOverview: withAuth("/test/test-overview", permission_override),
};

export const BILL = {
  // sub menus
  collectionRequest: subWithAuth("/bill/collection/request"),
  collectionReport: subWithAuth("/bill/collection/report"),
  collectionWallet: subWithAuth("/bill/collection/wallet"),

  // Main Menus
  dashboard: withAuth("/bill/dashboard", permission_override),
  billing: withAuth("/bill/billing"),
  discountRequest: withAuth("/bill/discount-request", permission_override),
  accessionArea: withAuth("/bill/accession-area", permission_override),
  testArea: withAuth("/bill/test-area", permission_override),
  result: withAuth("/bill/result", permission_override),
  verification: withAuth("/bill/verification", permission_override),
  testReport: withAuth("/bill/test-report", permission_override),
};

export const CLINICAL = {
  //? sub menus
  customerCategory: subWithAuth("/clinical/manage/customer-category"),

  //? main menus
  corpClient: withAuth("/clinical/corp-client"),
  customer: withAuth("/clinical/customers"),
  lab: withAuth("/clinical/labs"),
  hospital: withAuth("/clinical/hospitals"),
  doctor: withAuth("/clinical/doctors"),
};

export const LEAD = {
  allLead: withAuth("/lead/all-lead", permission_override),
  addLead: withAuth("/lead/add-lead", permission_override),
  followUp: withAuth("/lead/follow-up", permission_override),
  trashed: withAuth("/lead/trashed", permission_override),
};
