import { type FormEvent, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Loader2, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button.tsx"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx"
import { Input } from "@/components/ui/input.tsx"
import { Label } from "@/components/ui/label.tsx"
import { useToast } from "@/contexts/toast-context"
import { adminLogin } from "@/services/adminService"

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      await adminLogin({ username, password })
      toast({
        title: "Dang nhap admin thanh cong",
        description: "Ban co the quan ly nguoi dung trong he thong.",
        variant: "success",
      })
      navigate("/admin/users")
    } catch (error) {
      console.error("Admin login failed:", error)
      toast({
        title: "Dang nhap admin that bai",
        description: "Username hoac mat khau admin khong dung.",
        variant: "error",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md border-t-4 border-t-primary shadow-lg">
        <form onSubmit={handleSubmit}>
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Admin Login
            </CardTitle>
            <CardDescription>
              Dang nhap bang tai khoan admin de quan ly user.
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="admin-username">Username</Label>
              <Input
                id="admin-username"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="admin"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="admin-password">Mat khau</Label>
              <Input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
          </CardContent>

          <CardFooter>
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Dang nhap
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
