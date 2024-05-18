import { router } from "../../trpc";
import { getMe } from "./getMe";
import { login } from "./login";
import { logout } from "./logout";
import { register } from "./register";

export const userRoutes = router({
  getMe,
  login,
  logout,
  register,
});
