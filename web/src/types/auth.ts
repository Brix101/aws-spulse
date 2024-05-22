import { UserResource } from "@aws-spulse/api";

export type InitialState = {
  userId: string | undefined;
  user: UserResource | undefined | null;
};

export interface Resources {
  user?: UserResource | null;
}
