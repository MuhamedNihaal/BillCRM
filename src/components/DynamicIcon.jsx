import * as LucideIcons from "lucide-react";
import * as HeroIcons from "@heroicons/react/24/outline";
import * as FaIcons from "react-icons/fa";
import * as BiIcons from "react-icons/bi";
import * as AiIcons from "react-icons/ai";

import _ from "lodash";
import { memo } from "react";

// ----------------------------------------------------------------------

/**
 *
 * @param {Object} props
 * @param {string} props.name
 * @param {string} [props.className]
 * @returns {JSX.Element|null}
 */
const DynamicIcon = ({ name, className }) => {
  name = _.upperFirst(_.camelCase(name));
  let Icon =
    LucideIcons[name] ||
    HeroIcons[`${name}Icon`] ||
    FaIcons[`${name}`] ||
    BiIcons[`${name}`] ||
    AiIcons[`${name}`];

  if (!Icon) {
    Icon = LucideIcons["Menu"];
  }
  return Icon ? <Icon className={className || "h-6 w-6"} /> : null;
};

export default memo(DynamicIcon);
