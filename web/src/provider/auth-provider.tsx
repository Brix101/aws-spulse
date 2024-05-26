import { useOutlet } from "react-router-dom";

import { clientUtils } from "@/utils/trpc";
import { UserContextProvider } from "./user-context-provider";

export async function authLoader() {
  const data = await clientUtils.auth.getMe.ensureData();

  return data;
}

export function AuthProvider() {
  const outlet = useOutlet();

  return <UserContextProvider>{outlet}</UserContextProvider>;
}
