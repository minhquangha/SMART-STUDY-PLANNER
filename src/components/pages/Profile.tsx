import { useCallback, useEffect, useMemo, useState } from "react"
import {
  BookOpen,
  Calendar,
  Clock,
  Flame,
  Loader2,
  Mail,
  RefreshCw,
  UserRound,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getProfile, type UserProfile } from "@/service/profileService.ts"

const roleLabel: Record<string, string> = {
  admin: "Quản trị viên",
  user: "Học viên",
}

const formatDate = (dateValue?: string) => {
  if (!dateValue) {
    return "Chưa có dữ liệu"
  }

  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) {
    return "Chưa có dữ liệu"
  }

  return date.toLocaleDateString("vi-VN")
}

const formatStudyTime = (minutes = 0) => {
  if (minutes < 60) {
    return `${minutes} phút`
  }

  const hours = minutes / 60
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)} giờ`
}

const getInitial = (name?: string) => {
  const trimmedName = name?.trim()
  return trimmedName ? trimmedName.charAt(0).toUpperCase() : "U"
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await getProfile()

      if (!response.success || !response.data) {
        throw new Error("Invalid profile response")
      }

      setProfile(response.data)
    } catch (err) {
      console.error("Lỗi khi lấy thông tin hồ sơ:", err)
      setError("Không thể tải thông tin hồ sơ. Vui lòng thử lại.")
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchProfile()
  }, [fetchProfile])

  const profileView = useMemo(() => {
    if (!profile) {
      return null
    }

    const displayName = profile.name?.trim() || "Người dùng"
    const email = profile.email?.trim() || "Chưa có email"
    const role = profile.role?.trim() || "user"
    const studyPreferences = profile.studyPreferences ?? []

    return {
      displayName,
      email,
      role: roleLabel[role] ?? role,
      avatar: profile.avatar?.trim(),
      bio: profile.bio?.trim() || "Chưa có thông tin giới thiệu.",
      createdAt: formatDate(profile.createdAt),
      streak: profile.streak ?? 0,
      totalStudyTime: profile.totalStudyTime ?? 0,
      studyPreferences,
    }
  }, [profile])

  if (loading) {
    return (
      <div className="flex min-h-[360px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !profileView) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center gap-3 text-center">
        <p className="font-medium text-destructive">
          {error || "Không có dữ liệu hồ sơ."}
        </p>
        <Button variant="outline" className="gap-2" onClick={() => void fetchProfile()}>
          <RefreshCw className="h-4 w-4" />
          Tải lại
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hồ sơ cá nhân</h1>
          <p className="text-muted-foreground">
            Quản lý thông tin và tiến trình học tập của bạn.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader className="pb-2 text-center">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-200 shadow-sm">
              {profileView.avatar ? (
                <img
                  src={profileView.avatar}
                  alt={profileView.displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-slate-600">
                  {getInitial(profileView.displayName)}
                </span>
              )}
            </div>
            <CardTitle className="text-xl">{profileView.displayName}</CardTitle>
            <p className="text-sm text-muted-foreground">{profileView.role}</p>
          </CardHeader>
          <CardContent className="mt-4 space-y-4 border-t pt-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{profileView.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Tham gia: {profileView.createdAt}</span>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6 md:col-span-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card className="border-orange-100 bg-orange-50">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-full bg-orange-100 p-3 text-orange-600">
                  <Flame className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-orange-800">
                    Chuỗi ngày học
                  </p>
                  <p className="text-2xl font-bold text-orange-900">
                    {profileView.streak} ngày
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-100 bg-blue-50">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-full bg-blue-100 p-3 text-blue-600">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Tổng thời gian
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {formatStudyTime(profileView.totalStudyTime)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Chi tiết hồ sơ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Họ và tên</Label>
                  <Input
                    id="name"
                    value={profileView.displayName}
                    readOnly
                    className="bg-slate-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profileView.email}
                    readOnly
                    className="bg-slate-50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Giới thiệu ngắn</Label>
                <Textarea
                  id="bio"
                  value={profileView.bio}
                  readOnly
                  className="resize-none bg-slate-50"
                  rows={3}
                />
              </div>

              <div className="space-y-2 pt-2">
                <Label className="mb-2 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Môn học quan tâm
                </Label>
                <div className="flex flex-wrap gap-2">
                  {profileView.studyPreferences.length > 0 ? (
                    profileView.studyPreferences.map((preference, index) => (
                      <Badge key={`${preference}-${index}`} variant="secondary">
                        {preference}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm italic text-muted-foreground">
                      Chưa có môn học nào được chọn.
                    </span>
                  )}
                </div>
              </div>

              <div className="grid gap-4 pt-2 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Vai trò</Label>
                  <div className="flex h-10 items-center gap-2 rounded-md border bg-slate-50 px-3 text-sm">
                    <UserRound className="h-4 w-4 text-muted-foreground" />
                    {profileView.role}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Ngày tham gia</Label>
                  <div className="flex h-10 items-center gap-2 rounded-md border bg-slate-50 px-3 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {profileView.createdAt}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
