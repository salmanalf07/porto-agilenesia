import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { login } from "@/app/actions"
import { AgilenesiaLogo } from "@/components/agilenesia-logo"

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-md">
        <div className="flex justify-center items-center">
          <AgilenesiaLogo />
        </div>
        <h2 className="text-2xl font-bold text-center text-foreground font-heading">Client Portal Login</h2>
        <form action={login} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="user@agilenesia.com" required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>
        <div className="text-center text-sm text-muted-foreground mt-4">
          <p>Contoh Akun:</p>
          <p>
            Admin: <span className="font-semibold">admin@agilenesia.com</span> /{" "}
            <span className="font-semibold">adminpassword</span>
          </p>
          <p>
            Client: <span className="font-semibold">client@agilenesia.com</span> /{" "}
            <span className="font-semibold">clientpassword</span>
          </p>
        </div>
      </div>
    </div>
  )
}
