import Image from "next/image"

import { LoginForm } from "../../components/login-form"

export default function Page() {
  return (
    <div className="min-h-svh">
      <div className="grid min-h-svh md:grid-cols-2">
        <div className="relative hidden md:flex flex-col justify-between bg-muted p-10">
          <div>
            <div className="text-xl font-semibold">R&amp;G GADGETS</div>
            <div className="mt-2 max-w-md text-sm text-muted-foreground">
              Inventory &amp; sales management
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center">
            <div className="relative h-72 w-72">
              <Image
                src="/LOGIN-LOGO.png"
                alt="R&G GADGETS"
                fill
                className="object-contain opacity-80"
                priority
              />
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} R&amp;G GADGETS
          </div>
        </div>

        <div className="flex items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-md">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  )
}
