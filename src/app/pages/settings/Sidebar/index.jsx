// Local Imports
import { MainPanel } from "app/layouts/MainLayout/Sidebar/MainPanel";
// import { navigation } from "app/navigation";
import { SidebarPanel } from "./SidebarPanel";
import { useAuthContext } from "app/contexts/auth/context";

// ----------------------------------------------------------------------

export function Sidebar() {
  const { modules } = useAuthContext();
  // useIsomorphicEffect(() => {
  //   const documentBody = document?.body;
  //   if (documentBody) {
  //     documentBody.classList.remove("manual");
  //   }

  //   return () => {
  //     if (documentBody) {
  //       documentBody.classList.add("manual");
  //     }
  //   };
  // }, []);

  return (
    <>
      <MainPanel nav={modules} activeSegment={"/settings"} />
      <SidebarPanel />
    </>
  );
}
