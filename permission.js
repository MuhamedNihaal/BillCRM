import crmAuth from "./middleware/crmAuth.js";

const withAuth =
  (menu, options = {}) =>
  (router, path, middleware = false) => {
    const auth = crmAuth({ menu, ...options });
    return middleware ? auth : router.use(path, auth);
  };

const permission_override = { allowPermission: { edit: true, create: true, remv: true } };

export const MASTER_SETTING = {
  // sub menus
  blockedIp: withAuth("/master-setting/security/blocked-ips"),
  activityLog: withAuth("/master-setting/security/activity-log"),

  // main menu
  user: withAuth("/master-setting/user"),
  branch: withAuth("/master-setting/branch"),
  corpClient: withAuth("/master-setting/corp-client"),

  privilege: withAuth("/master-setting/privilege", permission_override),
  module: withAuth("/master-setting/modules", permission_override),
  rules: withAuth("/master-setting/rules", permission_override),
};

export const FINANCE = {
  //? sub menu
  incomeExpenseReport: withAuth("/finance/reports/income-expense-report", permission_override),
  profitAndLossReport: withAuth("/finance/reports/profit-loss", permission_override),
  report: withAuth("/finance/reports/report", permission_override),

  //? main menu
  dashboard: withAuth("/finance/dashboard", permission_override),
  chartOfAccount: withAuth("/finance/chart-of-account"),
  transactionLog: withAuth("/finance/transaction-log"),
  incomeAndExpense: withAuth("/finance/income-and-expense"),
  pendingDues: withAuth("/finance/pending-dues", permission_override),
  fundTransfer: withAuth("/finance/fund-transfer"),
  outstandingBills: withAuth("/finance/outstanding-bills"),
  debitAndCredit: withAuth("/finance/debit-and-credit"),
  head: withAuth("/finance/head"),
  subHead: withAuth("/finance/sub-head"),
};

export const WEBSITE = {
  careers: withAuth("/website/careers"),
  blogs: withAuth("/website/blogs"),
  testimonials: withAuth("/website/blogs"),
  contactInquiries: withAuth("/website/contact-inquiries"),
  gallery: withAuth("/website/gallery"),
};

export const TEST = {
  // sub menus
  test: withAuth("/test/tests/test"),
  group: withAuth("/test/tests/group"),
  subPackage: withAuth("/test/tests/sub-package"),
  package: withAuth("/test/tests/package"),
  cultures: withAuth("/test/tests/cultures"),
  examination: withAuth("/test/tests/examination"),

  // main menus
  dashboard: withAuth("/test/dashboard", permission_override),
  faq: withAuth("/test/faq"),
  testOverview: withAuth("/test/test-overview", permission_override),
};

export const BILL = {
  // sub menus
  units: withAuth("/bill/manage/units"),
  methods: withAuth("/bill/manage/methods"),
  antibiotics: withAuth("/bill/manage/antibiotics"),
  analysisType: withAuth("/bill/manage/analysis-type"),
  consumable: withAuth("/bill/manage/consumable"),
  consumableCategory: withAuth("/bill/manage/consumable-category"),
  rangeType: withAuth("/bill/manage/range-type"),
  sample: withAuth("/bill/manage/sample"),
  sampleData: withAuth("/bill/manage/sample-data"),
  healthRisk: withAuth("/bill/manage/health-risk"),
  healthPackage: withAuth("/bill/manage/health-package"),
  healthCondition: withAuth("/bill/manage/health-condition"),
  department: withAuth("/bill/manage/department"),
  remarks: withAuth("/bill/manage/remarks"),
}