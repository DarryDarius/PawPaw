export type Dog = {
  id: string;
  ownerUserId: string;
  name: string;
  breed: string;
  birthDate: string;
  sex: string;
  avatarUrl: string;
  size: "small" | "medium" | "large";
  neutered: boolean;
  vaccineStatus: "verified" | "self_reported";
  energyLevel: "low" | "medium" | "high";
  personalityTags: string[];
  activityPreferences: string[];
  acceptsLargeDogs: boolean;
  neighborhood: string;
  distanceKm: number;
  availableWindows: string[];
  likedBack?: boolean;
};

export type Location = {
  id: string;
  name: string;
  type: string;
  neighborhood: string;
  distanceKm: number;
  isPublicPlace: boolean;
  safetyNotes: string;
};

export type Match = {
  id: string;
  targetPetId: string;
  status: "matched" | "unmatched";
  conversationId: string;
  messages: { id: string; sender: "me" | "them"; body: string; createdAt: string }[];
  createdAt: string;
};

export type Playdate = {
  id: string;
  matchId: string;
  targetPetId: string;
  locationId: string;
  startAt: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  vaccineRequired: boolean;
  note: string;
};

export type DemoState = {
  swipes: { targetPetId: string; action: "like" | "pass"; score: number; createdAt: string }[];
  matches: Match[];
  playdates: Playdate[];
  feedback: { playdateId: string; rating: number; repeatIntent: string; note: string }[];
  reports: { id: string; targetType: string; targetId: string; reason: string; status: "open" | "resolved" }[];
  blocks: { blockedUserId: string; reason: string }[];
};

export const me = {
  id: "u1",
  nickname: "Darius",
  neighborhood: "Hyde Park",
  availableWindows: ["weekday_evening", "weekend_morning"],
  meetupPreferences: ["Public places", "Small groups ok"],
  maxDistanceKm: 5,
  safetyPreferences: ["Verified vaccines preferred", "No exact home address"]
};

export const dogs: Dog[] = [
  {
    id: "p1",
    ownerUserId: "u1",
    name: "Mochi",
    breed: "Corgi",
    birthDate: "2023-05-12",
    sex: "female",
    avatarUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1000&q=80",
    size: "small",
    neutered: true,
    vaccineStatus: "verified",
    energyLevel: "medium",
    personalityTags: ["friendly", "gentle", "shy at first"],
    activityPreferences: ["walk", "dog park", "training"],
    acceptsLargeDogs: false,
    neighborhood: "Hyde Park",
    distanceKm: 0,
    availableWindows: ["weekday_evening", "weekend_morning"]
  },
  {
    id: "p2",
    ownerUserId: "u2",
    name: "Biscuit",
    breed: "Beagle",
    birthDate: "2022-10-02",
    sex: "male",
    avatarUrl: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1000&q=80",
    size: "medium",
    neutered: true,
    vaccineStatus: "verified",
    energyLevel: "medium",
    personalityTags: ["friendly", "curious", "food motivated"],
    activityPreferences: ["walk", "dog park", "short trip"],
    acceptsLargeDogs: true,
    neighborhood: "Hyde Park",
    distanceKm: 1.4,
    availableWindows: ["weekday_evening", "weekend_morning"],
    likedBack: true
  },
  {
    id: "p3",
    ownerUserId: "u3",
    name: "Luna",
    breed: "Toy Poodle",
    birthDate: "2021-07-18",
    sex: "female",
    avatarUrl: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1000&q=80",
    size: "small",
    neutered: true,
    vaccineStatus: "verified",
    energyLevel: "low",
    personalityTags: ["calm", "gentle", "people friendly"],
    activityPreferences: ["walk", "cafe", "small group"],
    acceptsLargeDogs: false,
    neighborhood: "Kenwood",
    distanceKm: 2.1,
    availableWindows: ["weekend_morning", "weekend_afternoon"]
  },
  {
    id: "p4",
    ownerUserId: "u4",
    name: "Otis",
    breed: "Golden Retriever",
    birthDate: "2020-03-09",
    sex: "male",
    avatarUrl: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=1000&q=80",
    size: "large",
    neutered: true,
    vaccineStatus: "self_reported",
    energyLevel: "high",
    personalityTags: ["playful", "high energy", "large dog friendly"],
    activityPreferences: ["dog park", "fetch", "short trip"],
    acceptsLargeDogs: true,
    neighborhood: "South Loop",
    distanceKm: 5.8,
    availableWindows: ["weekday_evening"],
    likedBack: true
  },
  {
    id: "p5",
    ownerUserId: "u5",
    name: "Pepper",
    breed: "Shiba Inu",
    birthDate: "2022-01-21",
    sex: "female",
    avatarUrl: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=1000&q=80",
    size: "medium",
    neutered: false,
    vaccineStatus: "verified",
    energyLevel: "medium",
    personalityTags: ["independent", "selective", "calm"],
    activityPreferences: ["walk", "training"],
    acceptsLargeDogs: false,
    neighborhood: "Hyde Park",
    distanceKm: 0.9,
    availableWindows: ["weekend_afternoon"]
  }
];

export const locations: Location[] = [
  {
    id: "loc1",
    name: "Jackson Bark",
    type: "Dog park",
    neighborhood: "Hyde Park",
    distanceKm: 1.2,
    isPublicPlace: true,
    safetyNotes: "Fenced public dog park, best for daytime meetups."
  },
  {
    id: "loc2",
    name: "Promontory Point",
    type: "Lakefront walk",
    neighborhood: "Hyde Park",
    distanceKm: 1.7,
    isPublicPlace: true,
    safetyNotes: "Open lakefront route, keep dogs leashed."
  },
  {
    id: "loc3",
    name: "Hyde Park Pet Friendly Cafe",
    type: "Cafe patio",
    neighborhood: "Hyde Park",
    distanceKm: 0.8,
    isPublicPlace: true,
    safetyNotes: "Good for calm dogs and short first meetings."
  }
];

export const initialDemoState: DemoState = {
  swipes: [],
  matches: [],
  playdates: [],
  feedback: [],
  reports: [
    {
      id: "r1",
      targetType: "location",
      targetId: "loc1",
      reason: "Review safety note for evening meetups",
      status: "open"
    }
  ],
  blocks: []
};

export function scoreDog(dog: Dog) {
  let score = 52;
  const reasons: string[] = [];
  if (dog.neighborhood === me.neighborhood) {
    score += 14;
    reasons.push("Same neighborhood");
  }
  if (dog.vaccineStatus === "verified") {
    score += 10;
    reasons.push("Verified vaccines");
  }
  if (dog.energyLevel === dogs[0].energyLevel) {
    score += 8;
    reasons.push("Similar energy");
  }
  if (dog.availableWindows.some((window) => me.availableWindows.includes(window))) {
    score += 9;
    reasons.push("Shared availability");
  }
  if (dog.distanceKm <= me.maxDistanceKm) {
    score += 7;
    reasons.push(`${dog.distanceKm} km away`);
  }
  return { score: Math.min(score, 98), reasons };
}
