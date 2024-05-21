import React from "react";

type AuthContenxtProps = {
  user?: any;
};

const AuthContext = React.createContext<AuthContenxtProps>({
  user: undefined,
});

export function AuthContextProvider(props: React.PropsWithChildren) {
  const auth = {
    user: undefined,
  };

  return (
    <AuthContext.Provider value={auth}>{props.children}</AuthContext.Provider>
  );
}

export const useAuth = () => {
  return React.useContext(AuthContext);
};
