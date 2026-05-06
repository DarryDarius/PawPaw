export type ApiUser = {
  id: number;
  nickname: string;
  avatarUrl?: string;
  neighborhood?: string;
  privacyLevel: string;
  riskState: string;
};

export type ApiOwnerProfile = {
  availableWindows: string[];
  meetupPreferences: string[];
  maxDistanceKm: number;
  safetyPreferences: string[];
};

export type ApiPet = {
  id: number;
  ownerUserId: number;
  name: string;
  breed?: string;
  birthDate?: string;
  sex?: string;
  avatarUrl?: string;
  size: string;
  neutered?: boolean;
  vaccineStatus: string;
  personalityTags: string[];
  activityPreferences: string[];
  acceptsLargeDogs: boolean;
  energyLevel: string;
  neighborhood?: string;
};

export type ApiMe = {
  user: ApiUser;
  ownerProfile: ApiOwnerProfile;
  pets: ApiPet[];
  profileComplete: boolean;
};

export type ApiRecommendation = {
  pet: ApiPet;
  owner: {
    id: number;
    nickname: string;
    neighborhood?: string;
    availableWindows?: string[];
    maxDistanceKm?: number;
    meetupPreferences?: string[];
  };
  score: number;
  reasons: string[];
  reasonCodes: string[];
};

export type ApiMatch = {
  id: number;
  status: string;
  conversationId: number;
  pet: ApiPet;
  targetPet: ApiPet;
  createdAt: string;
};

export type ApiMessage = {
  id: number;
  conversationId: number;
  senderUserId: number;
  body: string;
  seq: number;
  createdAt: string;
};

export type ApiLocation = {
  id: number;
  name: string;
  type: string;
  city?: string;
  neighborhood?: string;
  isPublicPlace: boolean;
  safetyNotes?: string;
  distanceKm?: number;
};

export type ApiPlaydate = {
  id: number;
  creatorUserId: number;
  location: ApiLocation;
  startAt: string;
  visibility: string;
  vaccineRequired: boolean;
  status: string;
  note?: string;
  createdAt: string;
  participants: Array<{
    userId: number;
    petId: number;
    status: string;
    checkedInAt?: string;
    pet: ApiPet;
  }>;
};

export type ApiBlock = {
  blockedUserId: number;
  reason: string;
  createdAt: string;
};

export type ApiErrorPayload = {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
};
