import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

import { updateMe } from "@/src/api/profile";
import { AppText } from "@/src/components/AppText";
import { Button } from "@/src/components/Button";
import { Card } from "@/src/components/Card";
import { FormField } from "@/src/components/FormField";
import { Screen } from "@/src/components/Screen";
import { useMe } from "@/src/hooks/useMe";
import { useSession } from "@/src/hooks/useSession";

export default function OwnerOnboardingScreen() {
  const queryClient = useQueryClient();
  const { token } = useSession();
  const meQuery = useMe();
  const [nickname, setNickname] = useState(meQuery.data?.user.nickname || "Darius");
  const [neighborhood, setNeighborhood] = useState(meQuery.data?.user.neighborhood || "Hyde Park");
  const [maxDistanceKm, setMaxDistanceKm] = useState(String(meQuery.data?.ownerProfile.maxDistanceKm || 5));

  const mutation = useMutation({
    mutationFn: () =>
      updateMe(
        { token },
        {
          nickname,
          neighborhood,
          privacyLevel: "neighborhood",
          availableWindows: ["weekday_evening", "weekend_morning"],
          meetupPreferences: ["public_place_only", "small_group_ok"],
          maxDistanceKm: Number(maxDistanceKm || 5),
          safetyPreferences: ["vaccine_preferred", "no_home_address"],
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      router.replace("/onboarding/dog");
    },
    onError: (error: Error) => Alert.alert("Profile save failed", error.message),
  });

  return (
    <Screen>
      <Card className="gap-3">
        <AppText variant="title">Owner setup</AppText>
        <AppText className="text-paw-muted">Set the privacy-safe basics needed for recommendations.</AppText>
        <FormField label="Nickname" value={nickname} onChangeText={setNickname} />
        <FormField label="Neighborhood" value={neighborhood} onChangeText={setNeighborhood} />
        <FormField label="Max distance km" value={maxDistanceKm} onChangeText={setMaxDistanceKm} keyboardType="numeric" />
        <Button label={mutation.isPending ? "Saving..." : "Save and continue"} onPress={() => mutation.mutate()} disabled={mutation.isPending} />
      </Card>
    </Screen>
  );
}
