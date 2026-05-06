import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

import { createPet } from "@/src/api/pets";
import { AppText } from "@/src/components/AppText";
import { Button } from "@/src/components/Button";
import { Card } from "@/src/components/Card";
import { FormField } from "@/src/components/FormField";
import { Screen } from "@/src/components/Screen";
import { useSession } from "@/src/hooks/useSession";

const defaultAvatar = "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1000&q=80";

export default function DogOnboardingScreen() {
  const queryClient = useQueryClient();
  const { token } = useSession();
  const [name, setName] = useState("Mochi");
  const [breed, setBreed] = useState("Corgi");
  const [neighborhood, setNeighborhood] = useState("Hyde Park");

  const mutation = useMutation({
    mutationFn: () =>
      createPet(
        { token },
        {
          name,
          breed,
          birthDate: "2023-05-12",
          sex: "female",
          avatarUrl: defaultAvatar,
          size: "small",
          neutered: true,
          vaccineStatus: "verified",
          personalityTags: ["friendly", "gentle", "shy_at_first"],
          activityPreferences: ["walk", "dog_park"],
          acceptsLargeDogs: false,
          energyLevel: "medium",
          neighborhood,
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
      router.replace("/(tabs)");
    },
    onError: (error: Error) => Alert.alert("Dog save failed", error.message),
  });

  return (
    <Screen>
      <Card className="gap-3">
        <AppText variant="title">Dog setup</AppText>
        <AppText className="text-paw-muted">Create at least one dog profile to unlock Discover.</AppText>
        <FormField label="Dog name" value={name} onChangeText={setName} />
        <FormField label="Breed" value={breed} onChangeText={setBreed} />
        <FormField label="Neighborhood" value={neighborhood} onChangeText={setNeighborhood} />
        <Button label={mutation.isPending ? "Saving..." : "Create dog"} onPress={() => mutation.mutate()} disabled={mutation.isPending} />
      </Card>
    </Screen>
  );
}
