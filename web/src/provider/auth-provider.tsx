import { clientUtils } from "@/utils/trpc";
import { useLoaderData, useOutlet } from "react-router-dom";

import { AuthContextProvider } from "./auth-context-provider";
import { UserResource } from "@aws-spulse/api";

export async function authLoader() {
  const data = await clientUtils.user.getMe.ensureData();

  return data as { user: UserResource | null };
}

export function AuthProvider() {
  const outlet = useOutlet();

  const initialData = useLoaderData() as Awaited<ReturnType<typeof authLoader>>;

  return (
    <AuthContextProvider
      initialState={{
        userId: initialData?.user?.id,
        user: initialData.user,
      }}
    >
      {outlet}
    </AuthContextProvider>
  );
}
