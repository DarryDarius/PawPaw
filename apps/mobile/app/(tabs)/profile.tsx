import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "expo-router";
import { Alert, View } from "react-native";

import { logout } from "@/src/api/auth";
import { AppText } from "@/src/components/AppText";
import { Badge } from "@/src/components/Badge";
import { Button } from "@/src/components/Button";
import { Card } from "@/src/components/Card";
import { Screen } from "@/src/components/Screen";
import { useMe } from "@/src/hooks/useMe";
import { useSession } from "@/src/hooks/useSession";

export default function ProfileScreen() {
  const queryClient = useQueryClient();
  const { token, clearSession } = useSession();
  const meQuery = useMe();
  const logoutMutation = useMutation({
    mutationFn: async () => {
      if (token) {
        await logout(token).catch(() => undefined);
      }
      await clearSession();
    },
    onSuccess: () => {
      queryClient.clear();
    },
    onError: (error: Error) => Alert.alert("Logout failed", error.message),
  });

  if (!token) {
    return (
      <Screen>
        <Card className="gap-3">
          <AppText variant="title">Profile</AppText>
          <AppText className="text-paw-muted">Login to create your owner and dog profiles.</AppText>
          <Link href="/login" asChild>
            <Button label="Login" />
          </Link>
        </Card>
      </Screen>
    );
  }

  const me = meQuery.data;
  return (
    <Screen>
      <Card className="gap-3">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <AppText variant="title">{me?.user.nickname || "Profile"}</AppText>
            <AppText className="text-paw-muted">{me?.user.neighborhood || "Neighborhood pending"}</AppText>
          </View>
          <Badge label={me?.profileComplete ? "Ready" : "Setup needed"} tone={me?.profileComplete ? "teal" : "warning"} />
        </View>
        <Link href="/onboarding/owner" asChild>
          <Button label="Edit owner profile" variant="secondary" />
        </Link>
        <Link href="/onboarding/dog" asChild>
          <Button label="Add dog profile" />
        </Link>
      </Card>

      <Card className="gap-3">
        <AppText variant="subtitle">Dogs</AppText>
        {me?.pets?.length ? (
          me.pets.map((pet) => (
            <View key={pet.id} className="rounded-paw border border-paw-line p-3">
              <AppText className="font-bold">{pet.name}</AppText>
              <AppText variant="caption">
                {pet.breed || "Mixed breed"} · {pet.energyLevel} energy · {pet.vaccineStatus}
              </AppText>
            </View>
          ))
        ) : (
          <AppText className="text-paw-muted">No dogs yet.</AppText>
        )}
      </Card>

      <Button label="Logout" variant="outline" onPress={() => logoutMutation.mutate()} disabled={logoutMutation.isPending} />
    </Screen>
  );
}
