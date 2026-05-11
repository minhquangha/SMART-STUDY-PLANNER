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
import { Sparkles } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useState, type FormEvent } from "react"
import { register } from "@/services/authService"
import { useToast } from "@/contexts/toast-context"

type RegisterErrors = {
  email?: string
  name?: string
  password?: string
  confirmPassword?: string
  form?: string
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const usernamePattern = /^[A-Za-z0-9_]+$/
const strongPasswordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,}$/

export default function RegisterPage() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [errors, setErrors] = useState<RegisterErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const nextErrors: RegisterErrors = {}
    const trimmedName = name.trim()
    const trimmedEmail = email.trim()

    if (!trimmedEmail) {
      nextErrors.email = "Vui lòng nhập email."
    } else if (!emailPattern.test(trimmedEmail)) {
      nextErrors.email = "Email không đúng định dạng."
    }

    if (!trimmedName) {
      nextErrors.name = "Vui lòng nhập tên đăng nhập."
    } else if (trimmedName.length < 3 || trimmedName.length > 30) {
      nextErrors.name = "Tên đăng nhập phải từ 3 đến 30 ký tự."
    } else if (!usernamePattern.test(trimmedName)) {
      nextErrors.name = "Tên đăng nhập chỉ gồm chữ, số và dấu gạch dưới."
    }

    if (!password) {
      nextErrors.password = "Vui lòng nhập mật khẩu."
    } else if (/\s/.test(password)) {
      nextErrors.password = "Mật khẩu không được chứa khoảng trắng."
    } else if (!strongPasswordPattern.test(password)) {
      nextErrors.password = "Mật khẩu cần ít nhất 8 ký tự, gồm chữ, số và ký tự đặc biệt."
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = "Vui lòng nhập lại mật khẩu."
    } else if (confirmPassword !== password) {
      nextErrors.confirmPassword = "Mật khẩu nhập lại không khớp."
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setIsSubmitting(true)
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
      })

      toast({
        title: "Đăng ký thành công",
        description: "Bạn có thể đăng nhập bằng tài khoản vừa tạo.",
        variant: "success",
      })
      navigate("/login")
    } catch (error) {
      console.error("Register failed", error)
      setErrors({
        form: "Email hoặc tên đăng nhập đã tồn tại hoặc thông tin chưa hợp lệ.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <Card className="w-full max-w-md border-t-4 border-t-black shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mb-2 flex justify-center">
            <div className="rounded-full bg-green-100 p-2">
              <Sparkles className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Tạo tài khoản mới
          </CardTitle>
          <CardDescription>
            Bắt đầu hành trình học tập thông minh ngay hôm nay.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="grid gap-4">
            {errors.form && (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
                {errors.form}
              </p>
            )}

            <div className="grid gap-2">
              <Label htmlFor="email">Email của bạn</Label>
              <Input
                id="email"
                type="email"
                placeholder="tenban@example.com"
                value={email}
                aria-invalid={Boolean(errors.email)}
                className={errors.email ? "border-red-500 focus-visible:ring-red-500" : undefined}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setErrors((current) => ({ ...current, email: undefined, form: undefined }))
                }}
              />
              {errors.email && (
                <p className="text-sm font-medium text-red-600">{errors.email}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Tên đăng nhập</Label>
              <Input
                id="name"
                type="text"
                placeholder="ten_dang_nhap"
                value={name}
                aria-invalid={Boolean(errors.name)}
                className={errors.name ? "border-red-500 focus-visible:ring-red-500" : undefined}
                onChange={(e) => {
                  setName(e.target.value)
                  setErrors((current) => ({ ...current, name: undefined, form: undefined }))
                }}
              />
              {errors.name ? (
                <p className="text-sm font-medium text-red-600">{errors.name}</p>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">
                  Từ 3 đến 30 ký tự, không chứa khoảng trắng.
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                placeholder="Tối thiểu 8 ký tự"
                value={password}
                aria-invalid={Boolean(errors.password)}
                className={errors.password ? "border-red-500 focus-visible:ring-red-500" : undefined}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setErrors((current) => ({ ...current, password: undefined, form: undefined }))
                }}
              />
              {errors.password ? (
                <p className="text-sm font-medium text-red-600">{errors.password}</p>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">
                  Gồm ít nhất 8 ký tự, có chữ, số và ký tự đặc biệt.
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Nhập lại mật khẩu</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                aria-invalid={Boolean(errors.confirmPassword)}
                className={
                  errors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : undefined
                }
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  setErrors((current) => ({
                    ...current,
                    confirmPassword: undefined,
                    form: undefined,
                  }))
                }}
              />
              {errors.confirmPassword && (
                <p className="text-sm font-medium text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            <Button
              className="mt-2 w-full bg-black hover:bg-gray-700"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang đăng ký..." : "Đăng ký tài khoản"}
            </Button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">
                  Hoặc tiếp tục với
                </span>
              </div>
            </div>

            <Button variant="outline" className="flex w-full items-center gap-2" type="button">
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
          </CardContent>
          <CardFooter>
            <p className="w-full text-center text-sm text-muted-foreground">
              Đã có tài khoản?{" "}
              <a
                href="/login"
                className="font-semibold text-black hover:underline"
              >
                Đăng nhập ngay
              </a>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
