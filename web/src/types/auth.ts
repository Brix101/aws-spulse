import { RouterOutputs } from "@/utils/trpc";

export type UserResource = NonNullable<RouterOutputs["auth"]["getMe"]["user"]>;

export type InitialState = {
  userId: string | undefined;
  user: UserResource | undefined | null;
};

export interface Resources {
  user?: UserResource | null;
}
