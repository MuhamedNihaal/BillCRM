// Import Dependencies
import { RouterProvider } from "react-router";
import { AuthProvider } from "app/contexts/auth/Provider";
import { BreakpointProvider } from "app/contexts/breakpoint/Provider";
import { LocaleProvider } from "app/contexts/locale/Provider";
import { SidebarProvider } from "app/contexts/sidebar/Provider";
import { ThemeProvider } from "app/contexts/theme/Provider";
import { ConfirmDialogProvider } from "components/ConfirmModal";
import router from "app/router/router";
import { CookiesProvider } from "react-cookie";

import "./firebaseConfig";

// ----------------------------------------------------------------------

function App() {
  return (
    <ConfirmDialogProvider>
      <CookiesProvider>
        <AuthProvider>
          <ThemeProvider>
            <LocaleProvider>
              <BreakpointProvider>
                <SidebarProvider>
                  <RouterProvider router={router} />
                </SidebarProvider>
              </BreakpointProvider>
            </LocaleProvider>
          </ThemeProvider>
        </AuthProvider>
      </CookiesProvider>
    </ConfirmDialogProvider>
  );
}

export default App;
