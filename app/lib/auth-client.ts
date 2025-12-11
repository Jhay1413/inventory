import { createAuthClient } from "better-auth/client"
import { inferAdditionalFields } from "better-auth/client/plugins"
import { auth } from "./auth"
const authClient = createAuthClient(
    {
        plugins: [inferAdditionalFields<typeof auth>()],
    }
)
export type Session = typeof authClient.$Infer.Session