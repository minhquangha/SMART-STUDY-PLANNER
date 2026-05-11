import { api } from "@/services/api";

export interface UserAvatar {
  url?: string;
  publicId?: string;
}

export interface UserProfile {
  _id: string;
  name?: string;
  email?: string;
  avatar?: string | UserAvatar;
  bio?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
  studyPreferences?: string[];
  streak?: number;
  totalStudyTime?: number;
}

export interface ProfileResponse {
  success: boolean;
  data: UserProfile;
}

export interface UpdateProfilePayload {
  name?: string;
  bio?: string;
  studyPreferences?: string[];
}

export interface UploadAvatarResponse {
  success: boolean;
  data: {
    avatarUrl: string;
    avatar: UserAvatar;
  };
}

export const getProfile = async () => {
  const response = await api.get<ProfileResponse>("/me/profile");
  return response.data;
};

export const updateProfile = async (payload: UpdateProfilePayload) => {
  const response = await api.patch<ProfileResponse>("/me/profile", payload);
  return response.data;
};

export const uploadAvatar = async (
  file: File,
  onProgress?: (progress: number) => void
) => {
  const formData = new FormData();
  formData.append("avatar", file);

  const response = await api.post<UploadAvatarResponse>(
    "/api/users/avatar",
    formData,
    {
      onUploadProgress: (event) => {
        if (!event.total || !onProgress) {
          return;
        }

        onProgress(Math.round((event.loaded * 100) / event.total));
      },
    }
  );

  return response.data;
};
