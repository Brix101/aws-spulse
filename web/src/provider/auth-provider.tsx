import { clientUtils } from "@/utils/trpc";
import { useOutlet } from "react-router-dom";
import { AuthContextProvider } from "./auth-context-provider";

export async function authLoader() {
  const data = await clientUtils.user.getMe.ensureData();

  return { data };
}

export function AuthProvider() {
  const outlet = useOutlet();
  return <AuthContextProvider>{outlet}</AuthContextProvider>;
}
