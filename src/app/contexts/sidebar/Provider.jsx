// Import Dependencies
import PropTypes from "prop-types";

// Local Imports
import { useDisclosure, useDidUpdate, useIsomorphicEffect } from "hooks";
import { useBreakpointsContext } from "../breakpoint/context";
import { SidebarContext } from "./context";
import { useState } from "react";

const initialState = {
  isExpanded: false,
  setIsExpanded: () => {},
};

export function SidebarProvider({ children }) {
  let [isConfigChanged, setIsConfigChanged] = useState(() => {
    let obj = { refresh: 0 };

    let config = JSON.parse(localStorage.getItem("config") || "{}");

    if (config) obj = { ...obj, ...config };

    return obj;
  });

  const { xlAndUp, lgAndDown, name } = useBreakpointsContext();

  const [isExpanded, { open, close, toggle }] = useDisclosure(
    initialState.isExpanded && xlAndUp,
  );

  // Close Sidebar when Breakpoint changed
  useDidUpdate(() => {
    lgAndDown && close();
  }, [name]);

  useIsomorphicEffect(() => {
    const documentBody = document?.body;
    if (documentBody) {
      isExpanded
        ? documentBody.classList.add("is-sidebar-open")
        : documentBody.classList.remove("is-sidebar-open");
    }
  }, [isExpanded]);

  if (!children) {
    return;
  }

  return (
    <SidebarContext
      value={{
        isExpanded,
        toggle,
        open,
        close,
        isConfigChanged,
        setIsConfigChanged,
      }}
    >
      {children}
    </SidebarContext>
  );
}

SidebarProvider.propTypes = {
  children: PropTypes.node,
};
