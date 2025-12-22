//! Core Models
import UserActivity from "./userActivity.js";
import User from "./user.js";
import LoginAttempt from "./loginAttempt.js";
import UserTokens from "./userTokens.js";
import PrivilegePermission from "./privilegePermission.js";
import Privilege from "./privilege.js";
import Modules from "./modules.js";
import MainMenu from "./mainMenu.js";
import SubMenu from "./subMenu.js";
import Company from "./company.js";
import Branch from "./branch.js";
import CollectionCenter from "./collectionCenter.js";
import Department from "./department.js";

//? Finance Models
import AccountHead from "./accountHead.js";
import AccountSubHead from "./accountSubHead.js";
import ChartOfAccount from "./chartOfAccount.js";

//? Common Models
import Counter from "./counter.js";
import Country from "./country.js";
import State from "./State.js";
import District from "./districts.js";


//? Main Models
import Billing from "./billing.js";
import Corporative from "./corporative.js";

export default {
  //? Core Models
  LoginAttempt,
  User,
  UserActivity,
  UserTokens,
  PrivilegePermission,
  Privilege,
  Modules,
  MainMenu,
  SubMenu,
  Company,
  Branch,
  CollectionCenter,
  Department,

  //? Finance
  AccountHead,
  AccountSubHead,
  ChartOfAccount,

  //? Common
  Counter,
  Country,
  State,
  District,

  Test: {},

  Units: {},
  Methods: {},
  Antibiotics: {},
  AnalysisType: {},
  ConsumableCategory: {},
  Consumable: {},
  RangeType: {},
  Sample: {},
  SampleData: {},
  Remarks: {},

  //? Master Settings
  Corporative,

  //? Billing
  Billing,
};
