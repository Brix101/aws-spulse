import "@/assets/css/index.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { authLoader, AuthProvider } from "@/provider/auth-provider";
import { DashboardLayout } from "./components/layout/dashboard-layout";
import { LandingLayout } from "./components/layout/landing-layout";
import { Toaster } from "./components/ui/sonner";
import { AboutPage } from "./pages/AboutPage";
import { DashboardHomePage } from "./pages/DashboardHomePage";
import HomePage from "./pages/HomePage";
import { SignInPage } from "./pages/SignInPage";

const browserRouter = createBrowserRouter([
  {
    loader: authLoader,
    Component: AuthProvider,
    children: [
      {
        path: "/",
        Component: LandingLayout,
        children: [
          {
            index: true,
            Component: HomePage,
          },
          {
            path: "about",
            Component: AboutPage,
          },
        ],
      },
      {
        path: "/dashboard",
        Component: DashboardLayout,
        children: [
          {
            index: true,
            Component: DashboardHomePage,
          },
        ],
      },
      {
        path: "/auth",
        children: [
          {
            path: "sign-in",
            Component: SignInPage,
          },
        ],
      },
    ],
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={browserRouter} />
      <Toaster richColors closeButton />
    </>
  );
}
export default App;
