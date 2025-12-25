import { betterAuth } from "better-auth";
import { prisma } from "./db";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin as adminPlugin, organization } from "better-auth/plugins"
import { ac, admin } from "./permission";
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "sqlite"
    }),
    emailAndPassword: {
        enabled: true,
    },
    plugins: [nextCookies(),
    organization(),
    adminPlugin({
        ac,
        roles: {
            admin,

        }
    }),
    ] // make sure this is the last plugin in the array
});