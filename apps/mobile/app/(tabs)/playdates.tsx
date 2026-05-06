import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "expo-router";
import { Alert } from "react-native";

import { getPlaydates, updatePlaydate } from "@/src/api/playdates";
import { AppText } from "@/src/components/AppText";
import { Button } from "@/src/components/Button";
import { Card } from "@/src/components/Card";
import { EmptyState } from "@/src/components/EmptyState";
import { PlaydateCard } from "@/src/components/PlaydateCard";
import { Screen } from "@/src/components/Screen";
import { useSession } from "@/src/hooks/useSession";

export default function PlaydatesScreen() {
  const queryClient = useQueryClient();
  const { token } = useSession();
  const options = { token };
  const playdatesQuery = useQuery({
    queryKey: ["playdates", token],
    queryFn: () => getPlaydates(options),
    enabled: Boolean(token),
  });
  const mutation = useMutation({
    mutationFn: ({ id, action }: { id: number; action: "respond" | "cancel" | "check-in" }) =>
      updatePlaydate(options, id, action, action === "respond" ? "confirmed" : undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["playdates"] }),
    onError: (error: Error) => Alert.alert("Playdate update failed", error.message),
  });
  const playdates = playdatesQuery.data?.playdates || [];

  if (!token) {
    return <LoginRequired />;
  }

  return (
    <Screen>
      <Card className="gap-3">
        <AppText variant="title">Playdates</AppText>
        <AppText className="text-paw-muted">Plan public meetups and track confirmation, cancellation, and check-in.</AppText>
        <Link href="/playdate/new" asChild>
          <Button label="New playdate" />
        </Link>
      </Card>

      {playdates.length ? (
        playdates.map((playdate) => (
          <PlaydateCard
            key={playdate.id}
            playdate={playdate}
            onConfirm={() => mutation.mutate({ id: playdate.id, action: "respond" })}
            onCancel={() => mutation.mutate({ id: playdate.id, action: "cancel" })}
            onCheckIn={() => mutation.mutate({ id: playdate.id, action: "check-in" })}
          />
        ))
      ) : (
        <EmptyState title="No playdates yet" body="Create one after you match with another dog owner." />
      )}
    </Screen>
  );
}

function LoginRequired() {
  return (
    <Screen>
      <Card className="gap-3">
        <AppText variant="title">Login required</AppText>
        <Link href="/login" asChild>
          <Button label="Login" />
        </Link>
      </Card>
    </Screen>
  );
}
