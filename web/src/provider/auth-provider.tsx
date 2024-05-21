import { trpc } from "@/utils/trpc";
import { useOutlet } from "react-router-dom";
import { AuthContextProvider } from "./auth-context-provider";
import { createTRPCQueryUtils } from "@trpc/react-query";
import { queryClient } from "@/lib/react-query";

const clientUtils = createTRPCQueryUtils({ queryClient, client: trpc });

export async function authLoader() {
  const data = await clientUtils.user.getMe.ensureData();

  console.log(data);

  return { user: "asdf" };
}

export function AuthProvider() {
  const outlet = useOutlet();
  return <AuthContextProvider>{outlet}</AuthContextProvider>;
}
