import { FormEvent, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Dog,
  Flag,
  Heart,
  Home,
  LayoutDashboard,
  Loader2,
  MapPin,
  MessageCircle,
  PawPrint,
  RefreshCw,
  Shield,
  SlidersHorizontal,
  Sparkles,
  UserRound,
  X
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, defaultApiBaseUrl, saveApiBaseUrl } from "@/lib/api";
import { cn } from "@/lib/utils";
import { DemoState, Dog as DemoDog, dogs, initialDemoState, locations as demoLocations, me as demoMe, scoreDog } from "@/data/demo";

type View = "discover" | "profile" | "matches" | "playdates" | "places" | "safety" | "admin";

type ApiPet = {
  id: number;
  ownerUserId: number;
  name: string;
  breed?: string;
  avatarUrl?: string;
  size?: string;
  vaccineStatus?: string;
  energyLevel?: string;
  personalityTags?: string[];
  activityPreferences?: string[];
  acceptsLargeDogs?: boolean;
  neighborhood?: string;
};

type ApiMe = {
  user: { id: number; nickname: string; neighborhood?: string; avatarUrl?: string; riskState?: string };
  ownerProfile: { availableWindows?: string[]; meetupPreferences?: string[]; maxDistanceKm?: number; safetyPreferences?: string[] };
  pets: ApiPet[];
  profileComplete: boolean;
};

type ApiRecommendation = {
  pet: ApiPet;
  owner: { id: number; nickname: string; neighborhood?: string; availableWindows?: string[] };
  score: number;
  reasons: string[];
};

type ApiMatch = {
  id: number;
  status: string;
  conversationId: number;
  pet: ApiPet;
  targetPet: ApiPet;
  createdAt: string;
};

type ApiLocation = {
  id: number;
  name: string;
  type: string;
  neighborhood?: string;
  distanceKm?: number;
  isPublicPlace: boolean;
  safetyNotes?: string;
};

type ApiPlaydate = {
  id: number;
  status: string;
  startAt: string;
  vaccineRequired: boolean;
  note?: string;
  location: ApiLocation;
  participants?: { userId: number; pet?: ApiPet; status?: string }[];
};

type AdminReport = { id: number; reason: string; targetType: string; targetId: string; status: string };

type AdminDashboard = {
  users?: number;
  pets?: number;
  likes?: number;
  passes?: number;
  matches?: number;
  playdates?: number;
  completedPlaydates?: number;
  feedback?: number;
  reports?: AdminReport[];
  blocks?: number;
  recommendationLogs?: number;
  messages?: number;
};

type Candidate = {
  id: string;
  ownerId: string;
  name: string;
  breed: string;
  avatarUrl: string;
  score: number;
  reasons: string[];
  tags: string[];
  neighborhood: string;
  distance: string;
  vaccine: string;
  energy: string;
  raw: ApiRecommendation | DemoDog;
};

const dogFallback = "https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=1200&q=80";

const navItems: { id: View; label: string; icon: typeof PawPrint }[] = [
  { id: "discover", label: "Discover", icon: PawPrint },
  { id: "matches", label: "Matches", icon: Heart },
  { id: "playdates", label: "Playdates", icon: CalendarCheck },
  { id: "places", label: "Places", icon: MapPin },
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "safety", label: "Safety", icon: Shield },
  { id: "admin", label: "Admin", icon: LayoutDashboard }
];

function loadDemoState() {
  const saved = window.localStorage.getItem("pawpaw-react-demo-state");
  if (!saved) return initialDemoState;
  try {
    return { ...initialDemoState, ...JSON.parse(saved) } as DemoState;
  } catch {
    return initialDemoState;
  }
}

function formatTags(tags?: string[]) {
  return (tags || []).slice(0, 4);
}

export function App() {
  const queryClient = useQueryClient();
  const [activeView, setActiveView] = useState<View>("discover");
  const [apiBaseUrl, setApiBaseUrl] = useState(defaultApiBaseUrl);
  const [token, setToken] = useState(window.localStorage.getItem("pawpaw-session-token") || "");
  const [demo, setDemo] = useState<DemoState>(loadDemoState);
  const live = token.length > 0;

  useEffect(() => {
    window.localStorage.setItem("pawpaw-react-demo-state", JSON.stringify(demo));
  }, [demo]);

  const authHeaders = { apiBaseUrl, token };
  const meQuery = useQuery({
    queryKey: ["me", token],
    queryFn: () => apiRequest<ApiMe>(apiBaseUrl, token, "/me"),
    enabled: live
  });
  const recommendationsQuery = useQuery({
    queryKey: ["recommendations", token],
    queryFn: () => apiRequest<{ recommendations: ApiRecommendation[] }>(apiBaseUrl, token, "/recommendations/feed"),
    enabled: live
  });
  const matchesQuery = useQuery({
    queryKey: ["matches", token],
    queryFn: () => apiRequest<{ matches: ApiMatch[] }>(apiBaseUrl, token, "/matches"),
    enabled: live
  });
  const locationsQuery = useQuery({
    queryKey: ["locations", token],
    queryFn: () => apiRequest<{ locations: ApiLocation[] }>(apiBaseUrl, token, "/locations"),
    enabled: live
  });
  const playdatesQuery = useQuery({
    queryKey: ["playdates", token],
    queryFn: () => apiRequest<{ playdates: ApiPlaydate[] }>(apiBaseUrl, token, "/playdates"),
    enabled: live
  });
  const adminQuery = useQuery({
    queryKey: ["admin", token],
    queryFn: async () => {
      const [dashboard, reports] = await Promise.all([
        apiRequest<{ dashboard: Record<string, number> }>(apiBaseUrl, token, "/admin/dashboard"),
        apiRequest<{ reports: AdminReport[] }>(apiBaseUrl, token, "/admin/reports")
      ]);
      return { ...dashboard.dashboard, reports: reports.reports };
    },
    enabled: live && activeView === "admin"
  });
  const blocksQuery = useQuery({
    queryKey: ["blocks", token],
    queryFn: () => apiRequest<{ blocks: { blockedUserId: number; reason: string; createdAt: string }[] }>(apiBaseUrl, token, "/blocks"),
    enabled: live && activeView === "safety"
  });

  const candidates = useMemo<Candidate[]>(() => {
    if (live) {
      return (recommendationsQuery.data?.recommendations || []).map((item) => ({
        id: String(item.pet.id),
        ownerId: String(item.owner.id),
        name: item.pet.name,
        breed: item.pet.breed || "Mixed breed",
        avatarUrl: item.pet.avatarUrl || dogFallback,
        score: item.score,
        reasons: item.reasons || [],
        tags: formatTags(item.pet.personalityTags),
        neighborhood: item.owner.neighborhood || item.pet.neighborhood || "Nearby",
        distance: "live distance",
        vaccine: item.pet.vaccineStatus || "unknown",
        energy: item.pet.energyLevel || "medium",
        raw: item
      }));
    }
    const blocked = new Set(demo.blocks.map((block) => block.blockedUserId));
    const swiped = new Set(demo.swipes.map((swipe) => swipe.targetPetId));
    return dogs
      .filter((dog) => dog.ownerUserId !== demoMe.id && !blocked.has(dog.ownerUserId) && !swiped.has(dog.id))
      .map((dog) => {
        const score = scoreDog(dog);
        return {
          id: dog.id,
          ownerId: dog.ownerUserId,
          name: dog.name,
          breed: dog.breed,
          avatarUrl: dog.avatarUrl,
          score: score.score,
          reasons: score.reasons,
          tags: formatTags(dog.personalityTags),
          neighborhood: dog.neighborhood,
          distance: `${dog.distanceKm} km`,
          vaccine: dog.vaccineStatus,
          energy: dog.energyLevel,
          raw: dog
        };
      })
      .sort((a, b) => b.score - a.score);
  }, [demo.blocks, demo.swipes, live, recommendationsQuery.data]);

  const profileProgress = live
    ? meQuery.data?.profileComplete
      ? 100
      : Math.min(((meQuery.data?.pets?.length || 0) > 0 ? 55 : 25) + (meQuery.data?.ownerProfile?.availableWindows?.length ? 25 : 0), 90)
    : 100;

  const loginMutation = useMutation({
    mutationFn: async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const nextBaseUrl = String(form.get("apiBaseUrl") || apiBaseUrl).trim();
      saveApiBaseUrl(nextBaseUrl);
      setApiBaseUrl(nextBaseUrl);
      return apiRequest<{ session: { token: string } }>(nextBaseUrl, "", "/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: String(form.get("email") || ""),
          nickname: String(form.get("nickname") || ""),
          neighborhood: String(form.get("neighborhood") || "Hyde Park")
        })
      });
    },
    onSuccess: (payload) => {
      window.localStorage.setItem("pawpaw-session-token", payload.session.token);
      setToken(payload.session.token);
      toast.success("Live API connected");
      queryClient.invalidateQueries();
    },
    onError: (error: Error) => toast.error(error.message)
  });

  const swipeMutation = useMutation({
    mutationFn: async ({ candidate, action }: { candidate: Candidate; action: "like" | "pass" }) => {
      const sourcePetId = meQuery.data?.pets?.[0]?.id;
      if (!sourcePetId) throw new Error("Create a dog profile before swiping");
      return apiRequest(authHeaders.apiBaseUrl, authHeaders.token, "/swipes", {
        method: "POST",
        body: JSON.stringify({
          petId: sourcePetId,
          targetPetId: Number(candidate.id),
          action,
          idempotencyKey: `${sourcePetId}-${candidate.id}-${action}`
        })
      });
    },
    onSuccess: (_, variables) => {
      toast.success(variables.action === "like" ? "Liked. Match check complete." : "Passed. Candidate removed.");
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
    onError: (error: Error) => toast.error(error.message)
  });

  function handleLogout() {
    if (token) {
      apiRequest(apiBaseUrl, token, "/auth/logout", { method: "POST", body: "{}" }).catch(() => undefined);
    }
    window.localStorage.removeItem("pawpaw-session-token");
    setToken("");
    queryClient.clear();
    toast.message("Back to static demo mode");
  }

  function handleDemoSwipe(candidate: Candidate, action: "like" | "pass") {
    const dog = candidate.raw as DemoDog;
    const now = new Date().toISOString();
    setDemo((current) => {
      const next: DemoState = {
        ...current,
        swipes: [...current.swipes, { targetPetId: dog.id, action, score: candidate.score, createdAt: now }]
      };
      if (action === "like" && dog.likedBack && !next.matches.some((match) => match.targetPetId === dog.id)) {
        next.matches = [
          {
            id: `match-${Date.now()}`,
            targetPetId: dog.id,
            status: "matched",
            conversationId: `conv-${Date.now()}`,
            createdAt: now,
            messages: [
              {
                id: `msg-${Date.now()}`,
                sender: "them",
                body: `You matched with ${dog.name}. Pick a public place to plan the first playdate.`,
                createdAt: now
              }
            ]
          },
          ...current.matches
        ];
      }
      return next;
    });
    toast.success(action === "like" && dog.likedBack ? `It is a match with ${dog.name}` : action === "like" ? "Like saved" : "Passed");
  }

  function reportCandidate(candidate: Candidate) {
    if (live) {
      apiRequest(apiBaseUrl, token, "/reports", {
        method: "POST",
        body: JSON.stringify({ targetType: "pet", targetId: candidate.id, reason: `Review ${candidate.name} recommendation card` })
      })
        .then(() => toast.success("Report sent to admin queue"))
        .catch((error: Error) => toast.error(error.message));
      return;
    }
    setDemo((current) => ({
      ...current,
      reports: [
        { id: `r-${Date.now()}`, targetType: "pet", targetId: candidate.id, reason: `Review ${candidate.name} recommendation card`, status: "open" },
        ...current.reports
      ]
    }));
    toast.success("Report sent to admin queue");
  }

  function blockCandidate(candidate: Candidate) {
    if (live) {
      apiRequest(apiBaseUrl, token, "/blocks", {
        method: "POST",
        body: JSON.stringify({ blockedUserId: Number(candidate.ownerId), reason: "Blocked from recommendation surface" })
      })
        .then(() => {
          toast.success("User blocked");
          queryClient.invalidateQueries({ queryKey: ["recommendations"] });
          queryClient.invalidateQueries({ queryKey: ["blocks"] });
        })
        .catch((error: Error) => toast.error(error.message));
      return;
    }
    setDemo((current) => ({
      ...current,
      blocks: [...current.blocks, { blockedUserId: candidate.ownerId, reason: "Blocked from recommendations" }]
    }));
    toast.success("User blocked and hidden");
  }

  return (
    <div className="app-shell">
      <Sidebar activeView={activeView} setActiveView={setActiveView} live={live} onLogout={handleLogout} />
      <MobileNav activeView={activeView} setActiveView={setActiveView} />
      <main className="main-area">
        <Header
          live={live}
          activeView={activeView}
          me={meQuery.data}
          profileProgress={profileProgress}
          onOpenProfile={() => setActiveView("profile")}
          loading={meQuery.isFetching || recommendationsQuery.isFetching}
        />
        <div className="mt-6">
          {activeView === "discover" && (
            <DiscoverView
              candidates={candidates}
              live={live}
              loading={recommendationsQuery.isLoading}
              onRefresh={() => recommendationsQuery.refetch()}
              onSwipe={(candidate, action) => (live ? swipeMutation.mutate({ candidate, action }) : handleDemoSwipe(candidate, action))}
              onReport={reportCandidate}
              onBlock={blockCandidate}
              busy={swipeMutation.isPending}
            />
          )}
          {activeView === "profile" && (
            <ProfileView
              live={live}
              me={meQuery.data}
              loginMutation={loginMutation}
              apiBaseUrl={apiBaseUrl}
              updateAfterSave={() => {
                queryClient.invalidateQueries({ queryKey: ["me"] });
                queryClient.invalidateQueries({ queryKey: ["recommendations"] });
              }}
              authHeaders={authHeaders}
            />
          )}
          {activeView === "matches" && (
            <MatchesView
              live={live}
              matches={matchesQuery.data?.matches || []}
              demo={demo}
              setDemo={setDemo}
              authHeaders={authHeaders}
              refresh={() => {
                queryClient.invalidateQueries({ queryKey: ["matches"] });
                setActiveView("playdates");
              }}
            />
          )}
          {activeView === "playdates" && (
            <PlaydatesView
              live={live}
              matches={matchesQuery.data?.matches || []}
              locations={locationsQuery.data?.locations || []}
              playdates={playdatesQuery.data?.playdates || []}
              demo={demo}
              setDemo={setDemo}
              authHeaders={authHeaders}
              refresh={() => {
                queryClient.invalidateQueries({ queryKey: ["playdates"] });
                queryClient.invalidateQueries({ queryKey: ["admin"] });
              }}
            />
          )}
          {activeView === "places" && <PlacesView live={live} locations={locationsQuery.data?.locations || []} />}
          {activeView === "safety" && (
            <SafetyView
              live={live}
              demo={demo}
              setDemo={setDemo}
              blocks={blocksQuery.data?.blocks || []}
              authHeaders={authHeaders}
              refresh={() => {
                queryClient.invalidateQueries({ queryKey: ["blocks"] });
                queryClient.invalidateQueries({ queryKey: ["recommendations"] });
              }}
            />
          )}
          {activeView === "admin" && (
            <AdminView
              live={live}
              demo={demo}
              dashboard={adminQuery.data}
              loading={adminQuery.isFetching}
              authHeaders={authHeaders}
              refresh={() => queryClient.invalidateQueries({ queryKey: ["admin"] })}
              setDemo={setDemo}
            />
          )}
        </div>
      </main>
    </div>
  );
}

function Sidebar({ activeView, setActiveView, live, onLogout }: { activeView: View; setActiveView: (view: View) => void; live: boolean; onLogout: () => void }) {
  return (
    <aside className="sidebar">
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <PawPrint className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xl font-black leading-none">PawPaw</p>
            <p className="text-xs text-muted-foreground">Dog playdate matching</p>
          </div>
        </div>
        <nav className="mt-8 grid gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={cn(
                  "flex h-10 items-center gap-3 rounded-md px-3 text-left text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  activeView === item.id && "bg-foreground text-background hover:bg-foreground hover:text-background"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto rounded-lg border border-border bg-background p-4">
          <Badge variant={live ? "success" : "warning"}>{live ? "Live API" : "Static demo"}</Badge>
          <p className="mt-3 text-sm text-muted-foreground">
            {live ? "Connected to local backend and PostgreSQL seed data." : "Works on GitHub Pages without a backend."}
          </p>
          {live && (
            <Button variant="outline" size="sm" className="mt-4 w-full" onClick={onLogout}>
              Disconnect
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}

function MobileNav({ activeView, setActiveView }: { activeView: View; setActiveView: (view: View) => void }) {
  return (
    <div className="mobile-nav">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-black">
          <PawPrint className="h-5 w-5 text-primary" />
          PawPaw
        </div>
        <Select value={activeView} onValueChange={(value) => setActiveView(value as View)}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {navItems.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function Header({
  live,
  activeView,
  me,
  profileProgress,
  onOpenProfile,
  loading
}: {
  live: boolean;
  activeView: View;
  me?: ApiMe;
  profileProgress: number;
  onOpenProfile: () => void;
  loading: boolean;
}) {
  const title = navItems.find((item) => item.id === activeView)?.label || "PawPaw";
  return (
    <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Badge variant={live ? "success" : "warning"}>{live ? "Live API mode" : "Demo mode"}</Badge>
            {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>
          <h1 className="text-3xl font-black tracking-normal text-foreground">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Match compatible dogs, plan public playdates, and keep the safety loop visible from first swipe to feedback.
          </p>
        </div>
        <div className="w-full max-w-sm rounded-lg bg-muted p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">{live ? me?.user.nickname || "Live user" : demoMe.nickname}</p>
              <p className="text-xs text-muted-foreground">{live ? me?.user.neighborhood || "Neighborhood pending" : demoMe.neighborhood}</p>
            </div>
            <Button variant="outline" size="sm" onClick={onOpenProfile}>
              Setup <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>Profile readiness</span>
              <span>{profileProgress}%</span>
            </div>
            <Progress value={profileProgress} />
          </div>
        </div>
      </div>
    </section>
  );
}

function DiscoverView({
  candidates,
  live,
  loading,
  onRefresh,
  onSwipe,
  onReport,
  onBlock,
  busy
}: {
  candidates: Candidate[];
  live: boolean;
  loading: boolean;
  onRefresh: () => void;
  onSwipe: (candidate: Candidate, action: "like" | "pass") => void;
  onReport: (candidate: Candidate) => void;
  onBlock: (candidate: Candidate) => void;
  busy: boolean;
}) {
  const active = candidates[0];
  return (
    <div className="discover-grid">
      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex min-h-[520px] items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        ) : active ? (
          <>
            <img className="dog-photo" src={active.avatarUrl} alt={`${active.name} the dog`} />
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-2xl">{active.name}</CardTitle>
                  <CardDescription>
                    {active.breed} · {active.neighborhood} · {active.distance}
                  </CardDescription>
                </div>
                <div className="rounded-lg bg-primary px-3 py-2 text-center text-primary-foreground">
                  <p className="text-2xl font-black leading-none">{active.score}</p>
                  <p className="text-[11px] font-semibold">score</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant={active.vaccine === "verified" ? "success" : "warning"}>{active.vaccine}</Badge>
                <Badge variant="secondary">{active.energy} energy</Badge>
                {active.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="mt-4 rounded-lg bg-muted p-4">
                <p className="text-sm font-semibold">Why this match</p>
                <ul className="mt-2 grid gap-1 text-sm text-muted-foreground">
                  {active.reasons.slice(0, 4).map((reason) => (
                    <li key={reason} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Button variant="outline" size="lg" disabled={busy} onClick={() => onSwipe(active, "pass")}>
                  <X className="h-5 w-5" />
                  Pass
                </Button>
                <Button size="lg" disabled={busy} onClick={() => onSwipe(active, "like")}>
                  <Heart className="h-5 w-5" />
                  Like
                </Button>
              </div>
              <div className="mt-3 flex gap-2">
                <Button className="flex-1" variant="ghost" onClick={() => onReport(active)}>
                  <Flag className="h-4 w-4" />
                  Report
                </Button>
                <Button className="flex-1" variant="ghost" onClick={() => onBlock(active)}>
                  <Shield className="h-4 w-4" />
                  Block
                </Button>
              </div>
            </CardContent>
          </>
        ) : (
          <EmptyState icon={Dog} title="No candidates right now" body={live ? "Refresh the live feed or add more seed profiles." : "Reset the demo state to bring cards back."}>
            <Button onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </EmptyState>
        )}
      </Card>
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Recommendation queue</CardTitle>
            <CardDescription>{live ? "Ordered by backend compatibility score." : "Local demo uses distance, safety, schedule, and energy fit."}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {candidates.slice(0, 5).map((candidate) => (
              <div key={candidate.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                <img src={candidate.avatarUrl} alt="" className="h-12 w-12 rounded-md object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{candidate.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{candidate.reasons.slice(0, 2).join(" · ")}</p>
                </div>
                <Badge>{candidate.score}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Safety defaults</CardTitle>
            <CardDescription>Privacy-first MVP rules are visible in the product surface.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <InfoRow icon={MapPin} title="Public places only" value="No precise home address" />
            <InfoRow icon={Shield} title="Block and report" value="Removed from future recommendations" />
            <InfoRow icon={Sparkles} title="Feedback loop" value="After completed playdates" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ProfileView({
  live,
  me,
  loginMutation,
  apiBaseUrl,
  updateAfterSave,
  authHeaders
}: {
  live: boolean;
  me?: ApiMe;
  loginMutation: ReturnType<typeof useMutation<{ session: { token: string } }, Error, FormEvent<HTMLFormElement>>>;
  apiBaseUrl: string;
  updateAfterSave: () => void;
  authHeaders: { apiBaseUrl: string; token: string };
}) {
  const saveOwner = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await apiRequest(authHeaders.apiBaseUrl, authHeaders.token, "/me", {
        method: "PATCH",
        body: JSON.stringify({
          nickname: String(form.get("nickname") || ""),
          neighborhood: String(form.get("neighborhood") || ""),
          privacyLevel: "neighborhood",
          availableWindows: [String(form.get("availableWindow") || "weekend_morning")],
          meetupPreferences: ["public_place_only", "small_group_ok"],
          maxDistanceKm: Number(form.get("maxDistanceKm") || 5),
          safetyPreferences: ["vaccine_preferred", "no_home_address"]
        })
      });
      toast.success("Owner profile saved");
      updateAfterSave();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const createPet = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await apiRequest(authHeaders.apiBaseUrl, authHeaders.token, "/pets", {
        method: "POST",
        body: JSON.stringify({
          name: String(form.get("name") || ""),
          breed: String(form.get("breed") || ""),
          birthDate: String(form.get("birthDate") || ""),
          sex: String(form.get("sex") || "female"),
          avatarUrl: String(form.get("avatarUrl") || dogFallback),
          size: String(form.get("size") || "medium"),
          neutered: true,
          vaccineStatus: "verified",
          personalityTags: ["friendly", "gentle"],
          activityPreferences: ["walk", "dog_park"],
          acceptsLargeDogs: true,
          energyLevel: String(form.get("energyLevel") || "medium"),
          neighborhood: String(form.get("neighborhood") || me?.user.neighborhood || "Hyde Park")
        })
      });
      toast.success("Dog profile created");
      updateAfterSave();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <div className="page-grid">
      <div className="grid gap-4">
        {!live && (
          <Card>
            <CardHeader>
              <CardTitle>Connect live API</CardTitle>
              <CardDescription>Use the Go backend, PostgreSQL seed data, and real session token.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="form-grid" onSubmit={(event) => loginMutation.mutate(event)}>
                <Field label="API base URL" name="apiBaseUrl" defaultValue={apiBaseUrl} />
                <Field label="Email" name="email" defaultValue="darius@example.com" />
                <Field label="Nickname" name="nickname" defaultValue="Darius" />
                <Field label="Neighborhood" name="neighborhood" defaultValue="Hyde Park" />
                <div className="col-span-full">
                  <Button type="submit" disabled={loginMutation.isPending}>
                    {loginMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    Login or create session
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Owner onboarding</CardTitle>
            <CardDescription>{live ? "Saved through PATCH /me." : "Demo profile is already complete for GitHub Pages."}</CardDescription>
          </CardHeader>
          <CardContent>
            {live ? (
              <form className="form-grid" onSubmit={saveOwner}>
                <Field label="Nickname" name="nickname" defaultValue={me?.user.nickname || "Darius"} />
                <Field label="Neighborhood" name="neighborhood" defaultValue={me?.user.neighborhood || "Hyde Park"} />
                <Field label="Max distance km" name="maxDistanceKm" type="number" defaultValue={String(me?.ownerProfile.maxDistanceKm || 5)} />
                <div className="grid gap-2">
                  <Label>Availability</Label>
                  <Select name="availableWindow" defaultValue={me?.ownerProfile.availableWindows?.[0] || "weekend_morning"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekday_evening">Weekday evening</SelectItem>
                      <SelectItem value="weekend_morning">Weekend morning</SelectItem>
                      <SelectItem value="weekend_afternoon">Weekend afternoon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-full">
                  <Button type="submit">Save owner profile</Button>
                </div>
              </form>
            ) : (
              <DemoProfileSummary />
            )}
          </CardContent>
        </Card>
        {live && (
          <Card>
            <CardHeader>
              <CardTitle>Create dog profile</CardTitle>
              <CardDescription>Recommendations stay locked until at least one dog profile exists.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="form-grid" onSubmit={createPet}>
                <Field label="Name" name="name" defaultValue="Mochi" />
                <Field label="Breed" name="breed" defaultValue="Corgi" />
                <Field label="Birth date" name="birthDate" type="date" defaultValue="2023-05-12" />
                <Field label="Neighborhood" name="neighborhood" defaultValue={me?.user.neighborhood || "Hyde Park"} />
                <Field label="Avatar URL" name="avatarUrl" defaultValue={dogs[0].avatarUrl} />
                <div className="grid gap-2">
                  <Label>Size</Label>
                  <Select name="size" defaultValue="small">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Energy</Label>
                  <Select name="energyLevel" defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Sex</Label>
                  <Select name="sex" defaultValue="female">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-full">
                  <Button type="submit">Create dog</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Current dogs</CardTitle>
          <CardDescription>{live ? `${me?.pets?.length || 0} saved live profiles` : "Static demo profile"}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {(live ? me?.pets || [] : [dogs[0]]).map((pet) => (
            <div key={pet.id} className="flex gap-3 rounded-lg border border-border p-3">
              <img src={(pet as ApiPet).avatarUrl || (pet as DemoDog).avatarUrl || dogFallback} alt="" className="h-16 w-16 rounded-md object-cover" />
              <div>
                <p className="font-semibold">{pet.name}</p>
                <p className="text-sm text-muted-foreground">{pet.breed || "Mixed breed"}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  <Badge variant="outline">{pet.size || "medium"}</Badge>
                  <Badge variant="success">{pet.vaccineStatus || "verified"}</Badge>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function MatchesView({
  live,
  matches,
  demo,
  setDemo,
  authHeaders,
  refresh
}: {
  live: boolean;
  matches: ApiMatch[];
  demo: DemoState;
  setDemo: (updater: (current: DemoState) => DemoState) => void;
  authHeaders: { apiBaseUrl: string; token: string };
  refresh: () => void;
}) {
  const [selected, setSelected] = useState<string>("");
  const demoMatches = demo.matches.filter((match) => match.status === "matched");
  const activeID = selected || (live ? String(matches[0]?.id || "") : demoMatches[0]?.id || "");
  const activeDemoMatch = demoMatches.find((match) => match.id === activeID);
  const activeApiMatch = matches.find((match) => String(match.id) === activeID);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = String(form.get("body") || "").trim();
    if (!body) return;
    if (live && activeApiMatch) {
      try {
        await apiRequest(authHeaders.apiBaseUrl, authHeaders.token, `/conversations/${activeApiMatch.conversationId}/messages`, {
          method: "POST",
          body: JSON.stringify({ body })
        });
        toast.success("Message sent");
      } catch (error) {
        toast.error((error as Error).message);
      }
      return;
    }
    if (activeDemoMatch) {
      setDemo((current) => ({
        ...current,
        matches: current.matches.map((match) =>
          match.id === activeDemoMatch.id
            ? { ...match, messages: [...match.messages, { id: `msg-${Date.now()}`, sender: "me", body, createdAt: new Date().toISOString() }] }
            : match
        )
      }));
      toast.success("Message sent");
    }
  }

  const items = live
    ? matches.map((match) => ({ id: String(match.id), title: match.targetPet.name, subtitle: match.targetPet.breed || "Matched dog", image: match.targetPet.avatarUrl || dogFallback }))
    : demoMatches.map((match) => {
        const dog = dogs.find((item) => item.id === match.targetPetId);
        return { id: match.id, title: dog?.name || "Matched dog", subtitle: dog?.breed || "Ready to chat", image: dog?.avatarUrl || dogFallback };
      });

  return (
    <div className="page-grid">
      <Card>
        <CardHeader>
          <CardTitle>Mutual likes</CardTitle>
          <CardDescription>Only matches can open chat and create playdates.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {items.length ? (
            items.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelected(item.id)}
                className={cn("flex items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:bg-muted", activeID === item.id && "border-primary bg-primary/5")}
              >
                <img src={item.image} alt="" className="h-14 w-14 rounded-md object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{item.title}</p>
                  <p className="truncate text-sm text-muted-foreground">{item.subtitle}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))
          ) : (
            <EmptyState icon={Heart} title="No matches yet" body="Like a dog who already liked back to unlock chat." />
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Chat and next step</CardTitle>
          <CardDescription>Move from match to a safe public meetup.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-72 rounded-lg bg-muted p-3">
            {!activeID ? (
              <p className="text-sm text-muted-foreground">Select a match to open the conversation.</p>
            ) : live ? (
              <p className="text-sm text-muted-foreground">Live conversation is ready. Send a message through the backend conversation endpoint.</p>
            ) : (
              <div className="grid gap-2">
                {activeDemoMatch?.messages.map((message) => (
                  <div key={message.id} className={cn("max-w-[85%] rounded-lg px-3 py-2 text-sm", message.sender === "me" ? "ml-auto bg-primary text-primary-foreground" : "bg-background")}>
                    {message.body}
                  </div>
                ))}
              </div>
            )}
          </div>
          <form className="mt-3 flex gap-2" onSubmit={sendMessage}>
            <Input name="body" placeholder="Send a friendly hello..." disabled={!activeID} />
            <Button type="submit" disabled={!activeID}>
              <MessageCircle className="h-4 w-4" />
              Send
            </Button>
          </form>
          <Button className="mt-3 w-full" variant="secondary" disabled={!activeID} onClick={refresh}>
            <CalendarCheck className="h-4 w-4" />
            Plan playdate
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function PlaydatesView({
  live,
  matches,
  locations,
  playdates,
  demo,
  setDemo,
  authHeaders,
  refresh
}: {
  live: boolean;
  matches: ApiMatch[];
  locations: ApiLocation[];
  playdates: ApiPlaydate[];
  demo: DemoState;
  setDemo: (updater: (current: DemoState) => DemoState) => void;
  authHeaders: { apiBaseUrl: string; token: string };
  refresh: () => void;
}) {
  const availableLocations = live ? locations : demoLocations;
  const livePlaydates = live ? playdates : [];
  const createPlaydate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (live) {
      try {
        await apiRequest(authHeaders.apiBaseUrl, authHeaders.token, "/playdates", {
          method: "POST",
          body: JSON.stringify({
            matchId: Number(form.get("matchId")),
            locationId: Number(form.get("locationId")),
            startAt: String(form.get("startAt")),
            note: String(form.get("note") || ""),
            vaccineRequired: form.get("vaccineRequired") === "on"
          })
        });
        toast.success("Playdate created");
        refresh();
      } catch (error) {
        toast.error((error as Error).message);
      }
      return;
    }
    const matchID = String(form.get("matchId") || "");
    const match = demo.matches.find((item) => item.id === matchID);
    if (!match) return toast.error("Create a match first");
    setDemo((current) => ({
      ...current,
      playdates: [
        {
          id: `playdate-${Date.now()}`,
          matchId: match.id,
          targetPetId: match.targetPetId,
          locationId: String(form.get("locationId")),
          startAt: String(form.get("startAt")),
          status: "pending",
          vaccineRequired: form.get("vaccineRequired") === "on",
          note: String(form.get("note") || "")
        },
        ...current.playdates
      ]
    }));
    toast.success("Playdate created");
  };

  const updateDemoStatus = (id: string, status: DemoState["playdates"][number]["status"]) => {
    setDemo((current) => ({ ...current, playdates: current.playdates.map((item) => (item.id === id ? { ...item, status } : item)) }));
  };
  const updateLiveStatus = async (id: number, action: "respond" | "cancel" | "check-in") => {
    const path = action === "respond" ? `/playdates/${id}/respond` : `/playdates/${id}/${action}`;
    try {
      await apiRequest(authHeaders.apiBaseUrl, authHeaders.token, path, { method: "POST", body: action === "respond" ? JSON.stringify({ status: "confirmed" }) : "{}" });
      toast.success("Playdate updated");
      refresh();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const saveFeedback = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (live) {
      const playdate = livePlaydates.find((item) => String(item.id) === String(form.get("playdateId")));
      const other = playdate?.participants?.find((participant) => participant.userId !== Number(0));
      try {
        await apiRequest(authHeaders.apiBaseUrl, authHeaders.token, `/playdates/${form.get("playdateId")}/feedback`, {
          method: "POST",
          body: JSON.stringify({
            toUserId: other?.userId || 1,
            rating: Number(form.get("rating") || 5),
            repeatIntent: String(form.get("repeatIntent") || "yes"),
            safetyFlag: false,
            note: String(form.get("note") || "")
          })
        });
        toast.success("Feedback saved");
        refresh();
      } catch (error) {
        toast.error((error as Error).message);
      }
      return;
    }
    setDemo((current) => ({
      ...current,
      feedback: [
        {
          playdateId: String(form.get("playdateId")),
          rating: Number(form.get("rating") || 5),
          repeatIntent: String(form.get("repeatIntent") || "yes"),
          note: String(form.get("note") || "")
        },
        ...current.feedback
      ]
    }));
    toast.success("Feedback saved");
  };

  const rows = live
    ? livePlaydates.map((item) => ({ id: String(item.id), title: `${item.participants?.[0]?.pet?.name || "Matched dog"} at ${item.location.name}`, status: item.status, startAt: item.startAt }))
    : demo.playdates.map((item) => {
        const dog = dogs.find((dog) => dog.id === item.targetPetId);
        const location = demoLocations.find((location) => location.id === item.locationId);
        return { id: item.id, title: `${dog?.name || "Matched dog"} at ${location?.name || "Public place"}`, status: item.status, startAt: item.startAt };
      });
  const completedRows = rows.filter((row) => row.status === "completed");

  return (
    <div className="page-grid">
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>New playdate</CardTitle>
            <CardDescription>Only public places are available for first meetups.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="form-grid" onSubmit={createPlaydate}>
              <div className="grid gap-2">
                <Label>Match</Label>
                <Select name="matchId" defaultValue={live ? String(matches[0]?.id || "") : demo.matches[0]?.id || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose match" />
                  </SelectTrigger>
                  <SelectContent>
                    {(live ? matches : demo.matches).map((match) => (
                      <SelectItem key={String(match.id)} value={String(match.id)}>
                        {live ? (match as ApiMatch).targetPet.name : dogs.find((dog) => dog.id === (match as DemoState["matches"][number]).targetPetId)?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Public location</Label>
                <Select name="locationId" defaultValue={String(availableLocations[0]?.id || "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose place" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLocations.map((location) => (
                      <SelectItem key={String(location.id)} value={String(location.id)}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Field label="Start time" name="startAt" type="datetime-local" defaultValue="2026-05-02T10:00" />
              <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <Label htmlFor="vaccineRequired">Vaccine required</Label>
                <Switch id="vaccineRequired" name="vaccineRequired" defaultChecked />
              </div>
              <div className="col-span-full grid gap-2">
                <Label>Note</Label>
                <Textarea name="note" placeholder="Keep the first meetup short and public." />
              </div>
              <div className="col-span-full">
                <Button type="submit" disabled={live ? matches.length === 0 : demo.matches.length === 0}>
                  Create playdate
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
            <CardDescription>Pending, confirmed, and completed playdates.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {rows.length ? (
              rows.map((row) => (
                <div key={row.id} className="rounded-lg border border-border p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold">{row.title}</p>
                      <p className="text-sm text-muted-foreground">{row.startAt}</p>
                    </div>
                    <Badge variant={row.status === "completed" ? "success" : row.status === "cancelled" ? "destructive" : "warning"}>{row.status}</Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {live ? (
                      <>
                        <Button size="sm" variant="outline" onClick={() => updateLiveStatus(Number(row.id), "respond")}>
                          Confirm
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => updateLiveStatus(Number(row.id), "check-in")}>
                          Check in
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => updateLiveStatus(Number(row.id), "cancel")}>
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="outline" onClick={() => updateDemoStatus(row.id, "confirmed")}>
                          Confirm
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => updateDemoStatus(row.id, "completed")}>
                          Complete
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => updateDemoStatus(row.id, "cancelled")}>
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <EmptyState icon={CalendarCheck} title="No playdates yet" body="Create a match first, then invite them to a public place." />
            )}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Feedback</CardTitle>
          <CardDescription>Available after a playdate is completed.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3" onSubmit={saveFeedback}>
            <div className="grid gap-2">
              <Label>Completed playdate</Label>
              <Select name="playdateId" defaultValue={completedRows[0]?.id || ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose completed playdate" />
                </SelectTrigger>
                <SelectContent>
                  {completedRows.map((row) => (
                    <SelectItem key={row.id} value={row.id}>
                      {row.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Field label="Rating" name="rating" type="number" defaultValue="5" />
            <div className="grid gap-2">
              <Label>Repeat intent</Label>
              <Select name="repeatIntent" defaultValue="yes">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="maybe">Maybe</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Textarea name="note" placeholder="How did it go?" />
            <Button type="submit" disabled={!completedRows.length}>
              Save feedback
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function PlacesView({ live, locations }: { live: boolean; locations: ApiLocation[] }) {
  const rows = live ? locations : demoLocations;
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {rows.map((location) => (
        <Card key={String(location.id)}>
          <CardHeader>
            <Badge variant="success">Public</Badge>
            <CardTitle>{location.name}</CardTitle>
            <CardDescription>
              {location.type} · {location.neighborhood || "Nearby"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{location.safetyNotes || "Public meetup location reviewed for the MVP."}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function SafetyView({
  live,
  demo,
  setDemo,
  blocks,
  authHeaders,
  refresh
}: {
  live: boolean;
  demo: DemoState;
  setDemo: (updater: (current: DemoState) => DemoState) => void;
  blocks: { blockedUserId: number; reason: string; createdAt: string }[];
  authHeaders: { apiBaseUrl: string; token: string };
  refresh: () => void;
}) {
  async function unblock(id: string) {
    if (live) {
      try {
        await apiRequest(authHeaders.apiBaseUrl, authHeaders.token, `/blocks/${id}`, { method: "DELETE" });
        toast.success("User unblocked");
        refresh();
      } catch (error) {
        toast.error((error as Error).message);
      }
      return;
    }
    setDemo((current) => ({ ...current, blocks: current.blocks.filter((block) => block.blockedUserId !== id) }));
  }

  const blockRows = live ? blocks.map((block) => ({ id: String(block.blockedUserId), reason: block.reason })) : demo.blocks.map((block) => ({ id: block.blockedUserId, reason: block.reason }));
  return (
    <div className="page-grid">
      <Card>
        <CardHeader>
          <CardTitle>Privacy and safety defaults</CardTitle>
          <CardDescription>Small-group launch controls for real user trials.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <InfoRow icon={Home} title="Precise address hidden" value="Only neighborhood and distance band are shown." />
          <InfoRow icon={MapPin} title="Public locations" value="Playdates can only be created at public seed locations." />
          <InfoRow icon={AlertTriangle} title="Report queue" value="Reports appear in Admin for review and resolution." />
          <InfoRow icon={Shield} title="Blocks" value="Blocked owners do not return to the recommendation feed." />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Blocked users</CardTitle>
          <CardDescription>Manage users hidden from recommendations.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {blockRows.length ? (
            blockRows.map((block) => (
              <div key={block.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                <div>
                  <p className="font-semibold">User {block.id}</p>
                  <p className="text-sm text-muted-foreground">{block.reason || "No reason saved"}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => unblock(block.id)}>
                  Unblock
                </Button>
              </div>
            ))
          ) : (
            <EmptyState icon={Shield} title="No blocked users" body="Block actions from Discover will appear here." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AdminView({
  live,
  demo,
  dashboard,
  loading,
  authHeaders,
  refresh,
  setDemo
}: {
  live: boolean;
  demo: DemoState;
  dashboard?: AdminDashboard;
  loading: boolean;
  authHeaders: { apiBaseUrl: string; token: string };
  refresh: () => void;
  setDemo: (updater: (current: DemoState) => DemoState) => void;
}) {
  const metrics: [string, number][] = live
    ? [
        ["Users", dashboard?.users || 0],
        ["Pets", dashboard?.pets || 0],
        ["Likes", dashboard?.likes || 0],
        ["Matches", dashboard?.matches || 0],
        ["Playdates", dashboard?.playdates || 0],
        ["Completed", dashboard?.completedPlaydates || 0],
        ["Reports", dashboard?.reports?.length || 0],
        ["Blocks", dashboard?.blocks || 0]
      ]
    : [
        ["Users", 5],
        ["Pets", dogs.length],
        ["Likes", demo.swipes.filter((swipe) => swipe.action === "like").length],
        ["Matches", demo.matches.length],
        ["Playdates", demo.playdates.length],
        ["Completed", demo.playdates.filter((item) => item.status === "completed").length],
        ["Reports", demo.reports.filter((item) => item.status === "open").length],
        ["Blocks", demo.blocks.length]
      ];
  const reports = live ? dashboard?.reports || [] : demo.reports;

  async function resolveReport(id: string | number) {
    if (live) {
      try {
        await apiRequest(authHeaders.apiBaseUrl, authHeaders.token, `/admin/reports/${id}/resolve`, { method: "POST", body: "{}" });
        toast.success("Report resolved");
        refresh();
      } catch (error) {
        toast.error((error as Error).message);
      }
      return;
    }
    setDemo((current) => ({ ...current, reports: current.reports.map((report) => (report.id === id ? { ...report, status: "resolved" } : report)) }));
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black">Launch dashboard</h2>
          <p className="text-sm text-muted-foreground">Recommendation, playdate, and safety funnel.</p>
        </div>
        <Button variant="outline" onClick={refresh} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Refresh
        </Button>
      </div>
      <div className="metric-grid">
        {metrics.map(([label, value]) => (
          <Card key={label}>
            <CardHeader className="p-4">
              <CardDescription>{label}</CardDescription>
              <CardTitle className="text-3xl">{value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Report queue</CardTitle>
          <CardDescription>Resolve reports before broader gray release.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {reports.length ? (
            reports.map((report) => (
              <div key={String(report.id)} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3">
                <div>
                  <p className="font-semibold">{report.reason}</p>
                  <p className="text-sm text-muted-foreground">
                    {report.targetType}:{report.targetId} · {report.status}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => resolveReport(report.id)} disabled={report.status === "resolved"}>
                  Resolve
                </Button>
              </div>
            ))
          ) : (
            <EmptyState icon={Flag} title="No reports" body="Report events from Discover will show up here." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, name, defaultValue, type = "text" }: { label: string; name: string; defaultValue?: string; type?: string }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} defaultValue={defaultValue} />
    </div>
  );
}

function DemoProfileSummary() {
  return (
    <div className="grid gap-3">
      <InfoRow icon={UserRound} title={demoMe.nickname} value={`${demoMe.neighborhood} · ${demoMe.maxDistanceKm} km max distance`} />
      <InfoRow icon={SlidersHorizontal} title="Availability" value={demoMe.availableWindows.join(", ")} />
      <InfoRow icon={Shield} title="Safety" value={demoMe.safetyPreferences.join(", ")} />
    </div>
  );
}

function InfoRow({ icon: Icon, title, value }: { icon: typeof PawPrint; title: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{value}</p>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, body, children }: { icon: typeof PawPrint; title: string; body: string; children?: React.ReactNode }) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{body}</p>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
