// Import Dependencies
import PropTypes from "prop-types";
import { Fragment } from "react";

// Local Imports
import { useDocumentTitle } from "hooks";
import { APP_NAME } from "constants/app.constant";

// ----------------------------------------------------------------------

const Page = ({ title = null, component = Fragment, children }) => {
  const Component = component;
  useDocumentTitle((title ? `${title} - ` : "") + APP_NAME);
  return <Component>{children}</Component>;
};

Page.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  component: PropTypes.elementType,
};

export { Page };
