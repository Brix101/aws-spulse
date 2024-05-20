import { eq } from "drizzle-orm";
import { users } from "src/schema/users";
import { publicProcedure } from "src/trpc";
import { checkTokens } from "src/utils/auth-token";

export const getMe = publicProcedure.query(async ({ ctx }) => {
  const { id, rid } = ctx.req.cookies;

  try {
    const { user: maybeUser, userId } = await checkTokens(id, rid);

    if (maybeUser) {
      return { user: maybeUser };
    }

    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    return { user };
  } catch {
    return { user: null };
  }
});
