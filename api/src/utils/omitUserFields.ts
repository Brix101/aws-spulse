import { UserResource } from "~/index";
import { User } from "~/schema/users";

export const omitUserField = (user: User): UserResource => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
};
