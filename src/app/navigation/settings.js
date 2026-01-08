// Import Dependencies
import {
  BellAlertIcon,
  ShieldCheckIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { TbPalette, TbDevices } from "react-icons/tb";

// Local Imports
import SettingIcon from "assets/dualicons/setting.svg?react";
import { NAV_TYPE_ITEM } from "constants/app.constant";

// ----------------------------------------------------------------------

export const settings = {
  id: "settings",
  type: NAV_TYPE_ITEM,
  path: "/settings",
  title: "Settings",
  transKey: "nav.settings.settings",
  Icon: SettingIcon,
  childs: [
    {
      id: "profile",
      type: NAV_TYPE_ITEM,
      path: "/settings/profile",
      title: "Profile",
      // transKey: 'nav.settings.general',
      Icon: UserIcon,
    },
    {
      id: "appearance",
      type: NAV_TYPE_ITEM,
      path: "/settings/appearance",
      title: "Appearance",
      // transKey: 'nav.settings.appearance',
      Icon: TbPalette,
    },
    {
      id: "security",
      type: NAV_TYPE_ITEM,
      path: "/settings/security",
      title: "Password & Security",
      // transKey: 'nav.settings.general',
      Icon: ShieldCheckIcon,
    },
    {
      id: "notification",
      type: NAV_TYPE_ITEM,
      path: "/settings/notifications",
      title: "Notifications",
      // transKey: 'nav.settings.general',
      Icon: BellAlertIcon,
    },
    {
      id: "sessions",
      type: NAV_TYPE_ITEM,
      path: "/settings/sessions",
      title: "Sessions",
      // transKey: 'nav.settings.sessions',
      Icon: TbDevices,
    },
  ],
};
