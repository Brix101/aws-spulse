import { eq } from "drizzle-orm";
import { db } from "../../db";
import { publicProcedure } from "../../trpc";
import { checkTokens } from "../../utils/auth-token";
import { users } from "../../schema/users";

export const getMe = publicProcedure.query(async ({ ctx }) => {
  const { id, rid } = ctx.req.cookies;

  try {
    const { user: maybeUser, userId } = await checkTokens(id, rid);

    if (maybeUser) {
      return { user: maybeUser };
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    return { user };
  } catch {
    return { user: null };
  }
});
