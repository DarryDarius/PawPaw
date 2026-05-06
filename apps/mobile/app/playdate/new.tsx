import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

import { getMatches } from "@/src/api/matches";
import { createPlaydate, getLocations } from "@/src/api/playdates";
import { AppText } from "@/src/components/AppText";
import { Button } from "@/src/components/Button";
import { Card } from "@/src/components/Card";
import { FormField } from "@/src/components/FormField";
import { Screen } from "@/src/components/Screen";
import { useSession } from "@/src/hooks/useSession";

export default function NewPlaydateScreen() {
  const queryClient = useQueryClient();
  const { token } = useSession();
  const options = { token };
  const matchesQuery = useQuery({ queryKey: ["matches", token], queryFn: () => getMatches(options), enabled: Boolean(token) });
  const locationsQuery = useQuery({ queryKey: ["locations", token], queryFn: () => getLocations(options), enabled: Boolean(token) });
  const [startAt, setStartAt] = useState("2026-05-09T10:00:00Z");
  const [note, setNote] = useState("First meetup at a public place.");
  const match = matchesQuery.data?.matches?.[0];
  const location = locationsQuery.data?.locations?.[0];

  const mutation = useMutation({
    mutationFn: () => {
      if (!match || !location) {
        throw new Error("Need at least one match and one public location.");
      }
      return createPlaydate(options, {
        matchId: match.id,
        locationId: location.id,
        startAt,
        note,
        vaccineRequired: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playdates"] });
      router.replace("/(tabs)/playdates");
    },
    onError: (error: Error) => Alert.alert("Playdate create failed", error.message),
  });

  return (
    <Screen>
      <Card className="gap-3">
        <AppText variant="title">New playdate</AppText>
        <AppText className="text-paw-muted">
          {match ? `Inviting ${match.targetPet.name}` : "Create a match first"} · {location ? location.name : "No public location loaded"}
        </AppText>
        <FormField label="Start time ISO" value={startAt} onChangeText={setStartAt} />
        <FormField label="Note" value={note} onChangeText={setNote} />
        <Button label={mutation.isPending ? "Creating..." : "Create playdate"} onPress={() => mutation.mutate()} disabled={!match || !location || mutation.isPending} />
      </Card>
    </Screen>
  );
}
