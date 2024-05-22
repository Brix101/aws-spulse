import { UserResource } from "src/api-type";
import { User } from "src/schema/users";

export const omitUserField = (user: User): UserResource => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
};
