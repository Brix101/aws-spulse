import "@/assets/css/index.css";

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { authLoader, AuthProvider } from "./provider/auth-provider";
import Home from "./pages/Home";

function App() {
  const routers = createBrowserRouter(
    createRoutesFromElements(
      <Route element={<AuthProvider />} loader={authLoader}>
        <Route path="/" element={<Home />} />
      </Route>,
    ),
  );
  return <RouterProvider router={routers} />;
}
export default App;
