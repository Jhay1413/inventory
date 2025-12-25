"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "../../lib/auth-client"
import { toast } from "sonner"
export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const router = useRouter()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null)
    setIsLoading(true)
    const { data, error } = await authClient.signIn.email({
      /**
       * The user email
       */
      email,
      /**
       * The user password
       */
      password,
      /**
       * A URL to redirect to after the user verifies their email (optional)
       */
      callbackURL: "/dashboard",
      /**
       * remember the user session after the browser is closed. 
       * @default true
       */
      rememberMe: false
    }, {
      //callbacks
    })

    if (error) {
      setIsLoading(false)
      const message = error.message || "Invalid email or password."
      setFormError(message)
      toast("Login error: " + message)
    } else {
      setIsLoading(false)
      router.push("/select-organization")
      router.refresh()
    }
  }


  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Sign in to R&amp;G GADGETS
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (formError) setFormError(null)
                  }}
                  placeholder="m@example.com"
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (formError) setFormError(null)
                  }}
                />
              </Field>
              {formError ? (
                <FieldDescription className="text-destructive" aria-live="polite">
                  {formError}
                </FieldDescription>
              ) : null}
              <Field>
                <Button type="submit" disabled={isLoading} >{isLoading ? "Logging in..." : "Login"}</Button>
                <Button variant="outline" type="button">
                  Login with Google
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account? <a href="#">Sign up</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
