import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Github } from "lucide-react"
import { login } from "@/services/authService"
import { useNavigate } from "react-router-dom"
import { useState, type FormEvent } from "react"
import { useToast } from "@/contexts/toast-context"

type LoginErrors = {
  identifier?: string
  password?: string
  form?: string
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<LoginErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const nextErrors: LoginErrors = {}

    if (!identifier.trim()) {
      nextErrors.identifier = "Vui lòng nhập email hoặc tên đăng nhập."
    }

    if (!password) {
      nextErrors.password = "Vui lòng nhập mật khẩu."
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setIsSubmitting(true)
      const response = await login({
        identifier: identifier.trim(),
        password,
      })

      toast({
        title: "Đăng nhập thành công",
        description: "Chào mừng bạn quay lại Smart Study Planner.",
        variant: "success",
      })
      const role = response.data.data.user.role
      navigate(role === "admin" ? "/admin/users" : "/dashboard")
    } catch (err) {
      console.error(err)
      setErrors({
        form: "Sai mật khẩu hoặc tên đăng nhập.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md border-t-4 border-t-primary shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Chào mừng trở lại!
          </CardTitle>
          <CardDescription>
            Đăng nhập vào Smart Study Planner để tiếp tục lộ trình của bạn.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="flex items-center gap-2" type="button">
                <Github className="h-4 w-4" />
                Github
              </Button>
              <Button variant="outline" className="flex items-center gap-2" type="button">
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">
                  Hoặc sử dụng tài khoản
                </span>
              </div>
            </div>

            {errors.form && (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
                {errors.form}
              </p>
            )}

            <div className="grid gap-2">
              <Label htmlFor="identifier">Email hoặc tên đăng nhập</Label>
              <Input
                id="identifier"
                type="text"
                placeholder="tenban@example.com hoặc ten_dang_nhap"
                value={identifier}
                aria-invalid={Boolean(errors.identifier || errors.form)}
                className={
                  errors.identifier || errors.form
                    ? "border-red-500 focus-visible:ring-red-500"
                    : undefined
                }
                onChange={(e) => {
                  setIdentifier(e.target.value)
                  setErrors((current) => ({
                    ...current,
                    identifier: undefined,
                    form: undefined,
                  }))
                }}
              />
              {errors.identifier && (
                <p className="text-sm font-medium text-red-600">{errors.identifier}</p>
              )}
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mật khẩu</Label>
                <Button variant="link" className="px-0 text-xs font-normal" type="button">
                  Quên mật khẩu?
                </Button>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                aria-invalid={Boolean(errors.password || errors.form)}
                className={
                  errors.password || errors.form
                    ? "border-red-500 focus-visible:ring-red-500"
                    : undefined
                }
                onChange={(e) => {
                  setPassword(e.target.value)
                  setErrors((current) => ({
                    ...current,
                    password: undefined,
                    form: undefined,
                  }))
                }}
              />
              {errors.password && (
                <p className="text-sm font-medium text-red-600">{errors.password}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập ngay"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Bạn mới dùng Smart Study?{" "}
              <a
                href="/register"
                className="text-primary underline-offset-4 hover:underline"
              >
                Đăng ký miễn phí
              </a>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
