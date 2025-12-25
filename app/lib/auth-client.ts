import { createAuthClient } from "better-auth/react"
import { adminClient, inferAdditionalFields, organizationClient } from "better-auth/client/plugins"
import { ac, admin } from "./permission"

export const authClient = createAuthClient(
    {
        plugins: [inferAdditionalFields<typeof import("./auth").auth>(),
        organizationClient(),
        adminClient({
            ac,
            roles: {
                admin,
               
            }
        })
        ],
    }
)
export type Session = typeof authClient.$Infer.Session