import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUserIdentity } from "./users/getUserIdentity";

export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await getUserIdentity(ctx);

    if (!identity) {
      throw new Error("Called storeUser without authentication present");
    }

    const existingUsers = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .collect();

    if (existingUsers.length > 0) return;

    await ctx.db.insert("users", {
      name: identity.name ?? "Anonymous",
      email: identity.email ?? "", // ✅ Add this line — fallback if email missing
      imageUrl: identity.picture,
      tokenIdentifier: identity.tokenIdentifier,
    });
  },
});
