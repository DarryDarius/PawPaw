import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

import { login } from "@/src/api/auth";
import { AppText } from "@/src/components/AppText";
import { Button } from "@/src/components/Button";
import { Card } from "@/src/components/Card";
import { FormField } from "@/src/components/FormField";
import { Screen } from "@/src/components/Screen";
import { defaultApiBaseUrl } from "@/src/api/config";
import { useSession } from "@/src/hooks/useSession";

export default function LoginScreen() {
  const queryClient = useQueryClient();
  const { setSessionToken } = useSession();
  const [email, setEmail] = useState("darius@example.com");
  const [nickname, setNickname] = useState("Darius");
  const [neighborhood, setNeighborhood] = useState("Hyde Park");

  const mutation = useMutation({
    mutationFn: () => login({ email, nickname, neighborhood }),
    onSuccess: async (payload) => {
      await setSessionToken(payload.session.token);
      queryClient.invalidateQueries();
      router.replace("/(tabs)/profile");
    },
    onError: (error: Error) => Alert.alert("Login failed", error.message),
  });

  return (
    <Screen>
      <Card className="gap-3">
        <AppText variant="title">Login to PawPaw</AppText>
        <AppText className="text-paw-muted">This uses the existing MVP backend at {defaultApiBaseUrl}.</AppText>
        <FormField label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <FormField label="Nickname" value={nickname} onChangeText={setNickname} />
        <FormField label="Neighborhood" value={neighborhood} onChangeText={setNeighborhood} />
        <Button label={mutation.isPending ? "Logging in..." : "Login or create session"} onPress={() => mutation.mutate()} disabled={mutation.isPending} />
      </Card>
    </Screen>
  );
}
