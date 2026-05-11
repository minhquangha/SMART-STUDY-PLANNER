import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react"
import {
  BookOpen,
  Calendar,
  Clock,
  Flame,
  ImageUp,
  Loader2,
  Mail,
  Pencil,
  RefreshCw,
  Save,
  UserRound,
  X,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/contexts/toast-context"
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  type UpdateProfilePayload,
  type UserAvatar,
  type UserProfile,
} from "@/services/profileService"

type ProfileFormData = {
  name: string
  bio: string
  studyPreferencesText: string
}

const roleLabel: Record<string, string> = {
  admin: "Quản trị viên",
  user: "Học viên",
}

const emptyFormData: ProfileFormData = {
  name: "",
  bio: "",
  studyPreferencesText: "",
}

const MAX_AVATAR_FILE_SIZE = 2 * 1024 * 1024
const ACCEPTED_AVATAR_TYPES = ["image/jpeg", "image/png"]

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

const parseStudyPreferences = (value: string) => {
  const preferences = value
    .split(",")
    .map((preference) => preference.trim())
    .filter(Boolean)

  return Array.from(new Set(preferences))
}

const getAvatarUrl = (avatar?: string | UserAvatar) => {
  if (!avatar) {
    return ""
  }

  if (typeof avatar === "string") {
    return avatar.trim()
  }

  return avatar.url?.trim() ?? ""
}

const getProfileFormData = (profile: UserProfile): ProfileFormData => ({
  name: profile.name?.trim() ?? "",
  bio: profile.bio?.trim() ?? "",
  studyPreferencesText: (profile.studyPreferences ?? []).join(", "),
})

export default function ProfilePage() {
  const { toast } = useToast()
  const avatarInputRef = useRef<HTMLInputElement | null>(null)
  const avatarPreviewUrlRef = useRef<string | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [formData, setFormData] = useState<ProfileFormData>(emptyFormData)
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null)
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearAvatarPreviewUrl = useCallback(() => {
    if (avatarPreviewUrlRef.current) {
      URL.revokeObjectURL(avatarPreviewUrlRef.current)
      avatarPreviewUrlRef.current = null
    }

    setAvatarPreviewUrl("")
  }, [])

  useEffect(() => clearAvatarPreviewUrl, [clearAvatarPreviewUrl])

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await getProfile()

      if (!response.success || !response.data) {
        throw new Error("Invalid profile response")
      }

      setProfile(response.data)
      setFormData(getProfileFormData(response.data))
      setSelectedAvatarFile(null)
      setUploadProgress(0)
      clearAvatarPreviewUrl()
      setIsEditing(false)
    } catch (err) {
      console.error("Lỗi khi lấy thông tin hồ sơ:", err)
      setError("Không thể tải thông tin hồ sơ. Vui lòng thử lại.")
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [clearAvatarPreviewUrl])

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
      avatar: getAvatarUrl(profile.avatar),
      bio: profile.bio?.trim() || "Chưa có thông tin giới thiệu.",
      createdAt: formatDate(profile.createdAt),
      streak: profile.streak ?? 0,
      totalStudyTime: profile.totalStudyTime ?? 0,
      studyPreferences,
    }
  }, [profile])

  const previewName =
    isEditing && formData.name.trim()
      ? formData.name.trim()
      : profileView?.displayName
  const previewAvatar = avatarPreviewUrl || profileView?.avatar
  const displayedPreferences = isEditing
    ? parseStudyPreferences(formData.studyPreferencesText)
    : profileView?.studyPreferences ?? []

  const updateFormField = (field: keyof ProfileFormData, value: string) => {
    setFormData((currentFormData) => ({
      ...currentFormData,
      [field]: value,
    }))
  }

  const resetAvatarSelection = () => {
    setSelectedAvatarFile(null)
    setUploadProgress(0)
    clearAvatarPreviewUrl()
  }

  const handleStartEditing = () => {
    if (!profile) {
      return
    }

    setFormData(getProfileFormData(profile))
    resetAvatarSelection()
    setIsEditing(true)
  }

  const handleCancelEditing = () => {
    if (profile) {
      setFormData(getProfileFormData(profile))
    }

    resetAvatarSelection()
    setIsEditing(false)
  }

  const handleAvatarFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""

    if (!file) {
      return
    }

    if (!ACCEPTED_AVATAR_TYPES.includes(file.type)) {
      toast({
        title: "Ảnh không hợp lệ",
        description: "Vui lòng chọn ảnh JPG hoặc PNG.",
        variant: "error",
      })
      return
    }

    if (file.size > MAX_AVATAR_FILE_SIZE) {
      toast({
        title: "Ảnh quá lớn",
        description: "Vui lòng chọn ảnh có dung lượng tối đa 2 MB.",
        variant: "error",
      })
      return
    }

    clearAvatarPreviewUrl()

    const previewUrl = URL.createObjectURL(file)
    avatarPreviewUrlRef.current = previewUrl
    setAvatarPreviewUrl(previewUrl)
    setSelectedAvatarFile(file)
    setUploadProgress(0)
  }

  const handleSaveProfile = async () => {
    const name = formData.name.trim()

    if (!name) {
      toast({
        title: "Tên không hợp lệ",
        description: "Vui lòng nhập họ và tên trước khi lưu.",
        variant: "error",
      })
      return
    }

    const payload: UpdateProfilePayload = {
      name,
      bio: formData.bio.trim(),
      studyPreferences: parseStudyPreferences(formData.studyPreferencesText),
    }

    setIsSaving(true)

    try {
      const response = await updateProfile(payload)

      if (!response.success || !response.data) {
        throw new Error("Invalid profile update response")
      }

      let nextProfile = response.data

      if (selectedAvatarFile) {
        setUploadProgress(0)
        const avatarResponse = await uploadAvatar(selectedAvatarFile, (progress) => {
          setUploadProgress(progress)
        })

        if (!avatarResponse.success || !avatarResponse.data?.avatar) {
          throw new Error("Invalid avatar upload response")
        }

        nextProfile = {
          ...nextProfile,
          avatar: avatarResponse.data.avatar,
        }
      }

      setProfile(nextProfile)
      setFormData(getProfileFormData(nextProfile))
      setSelectedAvatarFile(null)
      setUploadProgress(0)
      clearAvatarPreviewUrl()
      setIsEditing(false)
      toast({
        title: "Đã cập nhật hồ sơ",
        description: "Thông tin cá nhân của bạn đã được lưu.",
      })
    } catch (err) {
      console.error("Lỗi khi cập nhật hồ sơ:", err)
      toast({
        title: "Không thể cập nhật hồ sơ",
        description: "Vui lòng kiểm tra thông tin và thử lại.",
        variant: "error",
      })
    } finally {
      setIsSaving(false)
    }
  }

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
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => void fetchProfile()}
        >
          <RefreshCw className="h-4 w-4" />
          Tải lại
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Hồ sơ cá nhân
          </h1>
          <p className="text-muted-foreground">
            Quản lý thông tin và tiến trình học tập của bạn.
          </p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={handleCancelEditing}
                disabled={isSaving}
              >
                <X className="h-4 w-4" />
                Hủy
              </Button>
              <Button
                type="button"
                className="gap-2"
                onClick={() => void handleSaveProfile()}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Lưu
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={handleStartEditing}
            >
              <Pencil className="h-4 w-4" />
              Sửa
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader className="pb-2 text-center">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-200 shadow-sm">
              {previewAvatar ? (
                <img
                  src={previewAvatar}
                  alt={previewName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-slate-600">
                  {getInitial(previewName)}
                </span>
              )}
            </div>
            <CardTitle className="text-xl">{previewName}</CardTitle>
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
                    value={isEditing ? formData.name : profileView.displayName}
                    readOnly={!isEditing}
                    disabled={isSaving}
                    onChange={(event) =>
                      updateFormField("name", event.target.value)
                    }
                    className={!isEditing ? "bg-slate-50" : undefined}
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
                <Label htmlFor="avatarFile">Ảnh đại diện</Label>
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <input
                        ref={avatarInputRef}
                        id="avatarFile"
                        type="file"
                        accept={ACCEPTED_AVATAR_TYPES.join(",")}
                        className="hidden"
                        disabled={isSaving}
                        onChange={handleAvatarFileChange}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="gap-2"
                        disabled={isSaving}
                        onClick={() => avatarInputRef.current?.click()}
                      >
                        <ImageUp className="h-4 w-4" />
                        Chọn ảnh
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="gap-2"
                        disabled={isSaving || !selectedAvatarFile}
                        onClick={resetAvatarSelection}
                      >
                        <X className="h-4 w-4" />
                        Bỏ chọn
                      </Button>
                    </div>
                    {selectedAvatarFile ? (
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p className="truncate">
                          Đã chọn: {selectedAvatarFile.name}
                        </p>
                        {isSaving ? (
                          <div className="space-y-1">
                            <Progress value={uploadProgress} />
                            <p>{uploadProgress}%</p>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <Input
                    id="avatarFile"
                    value={
                      profileView.avatar
                        ? "Đã có ảnh đại diện"
                        : "Chưa có ảnh đại diện"
                    }
                    readOnly
                    className="bg-slate-50"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Giới thiệu ngắn</Label>
                <Textarea
                  id="bio"
                  value={isEditing ? formData.bio : profileView.bio}
                  readOnly={!isEditing}
                  disabled={isSaving}
                  onChange={(event) =>
                    updateFormField("bio", event.target.value)
                  }
                  className={`resize-none ${!isEditing ? "bg-slate-50" : ""}`}
                  rows={3}
                />
              </div>

              <div className="space-y-2 pt-2">
                <Label
                  htmlFor="studyPreferences"
                  className="flex items-center gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Môn học quan tâm
                </Label>
                {isEditing ? (
                  <Input
                    id="studyPreferences"
                    value={formData.studyPreferencesText}
                    disabled={isSaving}
                    placeholder="Math, English, Physics"
                    onChange={(event) =>
                      updateFormField(
                        "studyPreferencesText",
                        event.target.value
                      )
                    }
                  />
                ) : null}
                <div className="flex flex-wrap gap-2">
                  {displayedPreferences.length > 0 ? (
                    displayedPreferences.map((preference, index) => (
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
