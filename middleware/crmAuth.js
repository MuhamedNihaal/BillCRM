import jwt from "jsonwebtoken";
import { asyncErrorHandler, Error } from "express-error-catcher";

// --- external import
import models from "@/models/index.js";
import { isSame } from "@/helper/index.js";
import getPublicUser from "@/utils/getPublicUser.js";
import * as config from "@/config/index.js";
import userActivity from "@/utils/userActivity.js";
import { verifyToken } from "@/utils/tokenHandler.js";

const permissionCheck = (method) => {
  method = typeof method === "string" ? method.toUpperCase() : null;
  const PERMISSION_MAP = [
    { field: "view", method: "GET" },
    { field: "create", method: "POST" },
    { field: "edit", method: "PUT" },
    { field: "remv", method: "DELETE" },
  ];

  return PERMISSION_MAP.find((p) => p.method === method)?.field ?? null;
};

/**
 *
 * @function UserAuth
 * @param {Object} [options={}] - Configuration object.
 * @param {string|null} [options.menu=null] - Top-level menu key to authorize.
 * @param {string|null} [options.sub_menu=null] - Sub-menu key to authorize.
 * @param {boolean} [options.master=false] - Whether the user must have master (super-admin) privileges.
 * @param {boolean} [options.common=false] - Whether common permissions apply.
 * @param {Object} [options.allowPermission] - CRUD-style permission flags.
 * @param {boolean} [options.allowPermission.create=false] - Allow create action.
 * @param {boolean} [options.allowPermission.view=false] - Allow view/read action.
 * @param {boolean} [options.allowPermission.edit=false] - Allow edit/update action.
 * @param {boolean} [options.allowPermission.remv=false] - Allow remove/delete action.
 * @returns {void}
 */
const crmAuth = ({ menu = null, sub_menu = null, master = false, common = false, allowPermission = null } = {}, res) => {
  if (typeof res !== "undefined") {
    res?.status(500)?.json({
      message: "Ensure proper authentication middleware parameters. Refer to README.md.",
    });
  }

  return asyncErrorHandler(async (req, res, next) => {
    try {
      if (!menu && !sub_menu && !master && !common) {
        throw new Error("Unauthorized action. Ensure proper authentication middleware parameters. Refer to README.md.");
      }

      const _token = req.cookies.token || req.headers["x-access-token"];

      if (!_token) throw new Error("Unauthorized - Access token is missing", 401, { tokenErr: true });

      let user = null;

      try {
        let _isTokenValid = verifyToken({ token: _token, type: "access", platform: "crm" });
        user = await models.User.findById(_isTokenValid?.id).populate("privilege", "name superAdmin").lean();

        req.deviceId = _isTokenValid?.deviceId ?? "";
        user = getPublicUser(user);
      } catch (error) {
        throw new Error("Login again", 401, { tokenErr: true });
      }

      if (!user) throw new Error("Access denied. Your account may be suspended or disabled.", 403);

      const role = user?.privilege ?? {};
      req.user = user;
      req.privilege = role?._id;

      const isAdmin =
        isSame(user._id, config.SUPER_ADMIN_ID) ||
        isSame(role?._id, config.privilege.SUPER_ADMIN) ||
        isSame(role?._id, config.privilege.DEVELOPER) ||
        role?.superAdmin;

      req.isAdmin = isAdmin;

      let branchMap = {
        1: "branch",
        2: "subBranch",
        3: "franchise",
        4: "collectionCenter",
      };

      // Roles 3 and 4 are Collection Center users.
      // Role 3 (Franchise) manages other client not owned by Noble.
      // Role 4 oversees collection centers owned and operated by Noble.

      let selectedBranchUser = null;
      if (!isAdmin) {
        selectedBranchUser = user[branchMap[user?.type]];
      }

      if (!isAdmin && !selectedBranchUser) {
        throw new Error("Access denied. You must be assigned to a branch or have administrator privileges.", 403);
      }

      req.userType = user?.type;

      if (isAdmin) {
        req.branch = req.headers.branch || null;
        req.subBranch = req.headers["sub-branch"] || null;
        req.franchise = req.headers.franchise || null;
        req.collectionCenter = req.headers["collection-center"] || null;
        req.branchType = Number(req.headers["branch-type"]) || null;

        req.department = req.headers["department"] || null;
      } else if (user?.type === 1) {
        //? main branch user
        req.branch = selectedBranchUser;
        req.branchType = Number(req.headers["branch-type"]) || user?.type;

        req.subBranch = req.headers["sub-branch"] || null;
        req.franchise = req.headers.franchise || null;
        req.collectionCenter = req.headers["collection-center"] || null;
      } else if (user?.type === 2) {
        //? sub branch user
        req.mainBranch = user?.branch;
        req.subBranch = selectedBranchUser;
        req.branchType = 2;
      } else if (user?.type === 3) {
        //? franchise user
        req.mainBranch = user?.branch;
        req.subBranch = user?.subBranch;
        req.branchType = 3;
        req.franchise = selectedBranchUser;
      } else if (user?.type === 4) {
        //? Collection center user
        req.mainBranch = user?.branch;
        req.subBranch = user?.subBranch;
        req.branchType = 4;
        req.collectionCenter = selectedBranchUser;
      }

      if (role?.superAdmin || req.isAdmin || common) return next();

      if (master) {
        userActivity({ req, action: "UN_AUTHORIZED_ACCESS", description: `{userName} attempted to access ${req?.originalUrl}` });

        throw new Error("You are not authorized to perform this action.", 403);
      }

      if (menu) {
        let isValid = await models.MainMenu.findOne({
          path: menu,
          status: 0,
        }).select("_id module");

        if (!isValid) {
          throw new Error("You do not have permission to perform this action in this menu.", 500);
        }

        let allowed = await models.Privilege.findOne(
          {
            _id: req.privilege,
            "alloted_main_menus.id": isValid?._id,
          },
          { "alloted_main_menus.$": 1 }
        ).lean();

        allowed = allowed?.alloted_main_menus[0];

        if (allowPermission) {
          allowed = { ...allowed, ...allowPermission };
        }

        if (!allowed[permissionCheck(req.method)] || isNull(allowed)) {
          await userActivity({
            req,
            action: "UN_AUTHORIZED_ACCESS",
            description: `[${req.method}] - {userName} attempted to access ${req.originalUrl}`,
            show: false,
          });

          throw new Error("You are not authorized to perform this action.", 403);
        }

        return next();
      }

      if (sub_menu) {
        let isValid = await models.SubMenu.findOne({
          path: sub_menu,
          status: 0,
        })
          .select("mainMenu _id")
          .lean();

        if (!isValid) {
          throw new Error("You do not have permission to perform this action in this sub menu.", 403);
        }

        let allowed = await models.Privilege.findOne(
          {
            _id: role._id,
            "alloted_submenus.id": isValid?._id,
          },
          { "alloted_submenus.$": 1 }
        ).lean();

        allowed = allowed?.alloted_submenus[0];

        if (allowPermission) {
          allowed = { ...allowed, ...allowPermission };
        }

        if ((!isNull(allowed) && !allowed[permissionCheck(req.method)]) || isNull(allowed)) {
          await userActivity({
            req,
            action: "UN_AUTHORIZED_ACCESS",
            description: `[${req.method}] - {userName} attempted to access ${req.originalUrl}`,
          });

          throw new Error("You are not authorized to perform this action.", 403);
        }

        return next();
      }
    } catch (err) {
      if (err?.data?.tokenErr || err?.tokenErr) {
        return res.status(401).json({
          message: "Unauthorized - Access token is missing",
          // message: "Your session has expired. Please log in again to continue.",
          reCallRefreshToken: true,
        });
      } else {
        return res.status(err?.statusCode ?? 400).json({ message: err?.message });
      }
    }
  });
};

export { crmAuth };
export default crmAuth;
