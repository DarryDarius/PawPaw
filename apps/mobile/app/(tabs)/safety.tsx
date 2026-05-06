import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "expo-router";
import { Alert, View } from "react-native";

import { getBlocks, unblockUser } from "@/src/api/safety";
import { AppText } from "@/src/components/AppText";
import { Button } from "@/src/components/Button";
import { Card } from "@/src/components/Card";
import { EmptyState } from "@/src/components/EmptyState";
import { Screen } from "@/src/components/Screen";
import { useSession } from "@/src/hooks/useSession";

export default function SafetyScreen() {
  const queryClient = useQueryClient();
  const { token } = useSession();
  const options = { token };
  const blocksQuery = useQuery({
    queryKey: ["blocks", token],
    queryFn: () => getBlocks(options),
    enabled: Boolean(token),
  });
  const mutation = useMutation({
    mutationFn: (blockedUserId: number) => unblockUser(options, blockedUserId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["blocks"] }),
    onError: (error: Error) => Alert.alert("Unblock failed", error.message),
  });

  if (!token) {
    return (
      <Screen>
        <Card className="gap-3">
          <AppText variant="title">Safety</AppText>
          <Link href="/login" asChild>
            <Button label="Login" />
          </Link>
        </Card>
      </Screen>
    );
  }

  const blocks = blocksQuery.data?.blocks || [];
  return (
    <Screen>
      <Card className="gap-3">
        <AppText variant="title">Safety</AppText>
        <AppText className="text-paw-muted">Public places, hidden exact addresses, reporting, and blocks are core MVP rules.</AppText>
      </Card>

      <Card className="gap-3">
        <AppText variant="subtitle">Blocked users</AppText>
        {blocks.length ? (
          blocks.map((block) => (
            <View key={block.blockedUserId} className="gap-2 rounded-paw border border-paw-line p-3">
              <AppText className="font-bold">User {block.blockedUserId}</AppText>
              <AppText variant="caption">{block.reason || "No reason saved"}</AppText>
              <Button label="Unblock" variant="outline" onPress={() => mutation.mutate(block.blockedUserId)} />
            </View>
          ))
        ) : (
          <EmptyState title="No blocked users" body="Blocked owners from Discover will appear here." />
        )}
      </Card>
    </Screen>
  );
}
