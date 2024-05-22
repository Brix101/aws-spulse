import { InitialState } from "@/types/auth";
import { createContextAndHook } from "@/utils/createContextAndHook";
import { deriveState } from "@/utils/deriveState";
import { trpc } from "@/utils/trpc";
import { UserResource } from "@aws-spulse/api";
import React from "react";

const [UserContext, useUserContext] = createContextAndHook<
  UserResource | null | undefined
>("UserContext");

type AuthContextProvider = {
  initialState?: InitialState;
  children: React.ReactNode;
};

type AuthContextProviderState = {
  user?: UserResource | null;
};

export function AuthContextProvider(props: AuthContextProvider) {
  const { initialState, children } = props;
  const { data, isLoading } = trpc.user.getMe.useQuery();

  const [state, setState] = React.useState<AuthContextProviderState>({
    user: data?.user,
  });

  React.useEffect(() => {
    if (data) {
      setState({ user: data.user });
    }
    return () => {
      setState({});
    };
  }, [data]);

  const { user, userId } = deriveState(isLoading, state, initialState);
  const userCtx = React.useMemo(() => ({ value: user }), [userId, user]);

  return (
    <UserContext.Provider value={userCtx}>{children}</UserContext.Provider>
  );
}

type UseUserReturn =
  | { isLoaded: false; isSignedIn: undefined; user: undefined }
  | { isLoaded: true; isSignedIn: false; user: null }
  | { isLoaded: true; isSignedIn: true; user: UserResource };

export const useAuthUser = (): UseUserReturn => {
  const user = useUserContext();
  if (user === undefined) {
    return { isLoaded: false, isSignedIn: undefined, user: undefined };
  }

  if (user === null) {
    return { isLoaded: true, isSignedIn: false, user: null };
  }

  return { isLoaded: true, isSignedIn: true, user };
};
