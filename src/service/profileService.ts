import { api } from "@/lib/api.ts";

export interface UserProfile {
  _id: string;
  name?: string;
  email?: string;
  avatar?: string;
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

export const getProfile = async () => {
  const response = await api.get<ProfileResponse>("/me/profile");
  return response.data;
};
