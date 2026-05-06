import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "expo-router";
import { ActivityIndicator, Alert } from "react-native";

import { getRecommendations } from "@/src/api/recommendations";
import { createReport } from "@/src/api/safety";
import { createSwipe } from "@/src/api/swipes";
import { AppText } from "@/src/components/AppText";
import { Button } from "@/src/components/Button";
import { Card } from "@/src/components/Card";
import { DogCard } from "@/src/components/DogCard";
import { EmptyState } from "@/src/components/EmptyState";
import { Screen } from "@/src/components/Screen";
import { useMe } from "@/src/hooks/useMe";
import { useSession } from "@/src/hooks/useSession";

export default function DiscoverScreen() {
  const queryClient = useQueryClient();
  const { token, hydrated } = useSession();
  const meQuery = useMe();
  const options = { token };
  const recommendationsQuery = useQuery({
    queryKey: ["recommendations", token],
    queryFn: () => getRecommendations(options),
    enabled: Boolean(token && meQuery.data?.profileComplete),
  });
  const active = recommendationsQuery.data?.recommendations?.[0];
  const sourcePet = meQuery.data?.pets?.[0];

  const swipeMutation = useMutation({
    mutationFn: (action: "like" | "pass") => {
      if (!sourcePet || !active) {
        throw new Error("Create a dog profile before swiping.");
      }
      return createSwipe(options, {
        petId: sourcePet.id,
        targetPetId: active.pet.id,
        action,
        idempotencyKey: `${sourcePet.id}-${active.pet.id}-${action}`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
    onError: (error: Error) => Alert.alert("Swipe failed", error.message),
  });

  if (!hydrated) {
    return <LoadingScreen />;
  }

  if (!token) {
    return <LoginPrompt />;
  }

  if (meQuery.isLoading) {
    return <LoadingScreen />;
  }

  if (!meQuery.data?.profileComplete) {
    return (
      <Screen>
        <EmptyState
          title="Finish setup first"
          body="PawPaw only opens recommendations after owner and dog profiles are complete."
          actionLabel="Open Profile"
          onAction={() => undefined}
        />
        <Link href="/(tabs)/profile" asChild>
          <Button label="Go to Profile" />
        </Link>
      </Screen>
    );
  }

  return (
    <Screen>
      <Card className="gap-2">
        <AppText variant="title">Discover</AppText>
        <AppText className="text-paw-muted">
          Live recommendations from PostgreSQL, filtered by compatibility, safety, and previous swipes.
        </AppText>
      </Card>

      {recommendationsQuery.isLoading ? <LoadingBlock /> : null}
      {active ? (
        <DogCard
          recommendation={active}
          disabled={swipeMutation.isPending}
          onLike={() => swipeMutation.mutate("like")}
          onPass={() => swipeMutation.mutate("pass")}
          onReport={() =>
            createReport(options, {
              targetType: "pet",
              targetId: String(active.pet.id),
              reason: `Review ${active.pet.name} recommendation card`,
            })
              .then(() => Alert.alert("Report sent", "The admin queue will review this card."))
              .catch((error: Error) => Alert.alert("Report failed", error.message))
          }
          onBlock={() => Alert.alert("Block", "Block wiring is available in Safety sprint flow.")}
        />
      ) : recommendationsQuery.isError ? (
        <EmptyState
          title="Could not load recommendations"
          body={(recommendationsQuery.error as Error).message}
          actionLabel="Retry"
          onAction={() => recommendationsQuery.refetch()}
        />
      ) : (
        <EmptyState
          title="No candidates right now"
          body="Refresh the feed or seed more nearby dog profiles."
          actionLabel="Refresh"
          onAction={() => recommendationsQuery.refetch()}
        />
      )}
    </Screen>
  );
}

function LoadingScreen() {
  return (
    <Screen>
      <LoadingBlock />
    </Screen>
  );
}

function LoadingBlock() {
  return (
    <Card className="items-center gap-3">
      <ActivityIndicator />
      <AppText className="text-paw-muted">Loading PawPaw...</AppText>
    </Card>
  );
}

function LoginPrompt() {
  return (
    <Screen>
      <Card className="gap-3">
        <AppText variant="title">PawPaw</AppText>
        <AppText className="text-paw-muted">Login to connect this iOS client to the existing PawPaw API.</AppText>
        <Link href="/login" asChild>
          <Button label="Login" />
        </Link>
      </Card>
    </Screen>
  );
}
