// Import Depndencies
import { isRouteErrorResponse, useRouteError } from "react-router";
import { lazy } from "react";

// Local Imports
import { Loadable } from "components/shared/Loadable";

// ----------------------------------------------------------------------

const app = {
  401: lazy(() => import("./401")),
  404: lazy(() => import("./404")),
  429: lazy(() => import("./429")),
  500: lazy(() => import("./500")),
};

function RootErrorBoundary() {
  const error = useRouteError();
  
  if (isRouteErrorResponse(error)) {
    const Component = Loadable(app[error.status]);
    return <Component error={error} />;
  } else {
    const Component = Loadable(app[500]);
    return <Component error={error} />;
  }
}

export default RootErrorBoundary;
