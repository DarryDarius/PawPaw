import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, View } from "react-native";

import { getMessages, sendMessage } from "@/src/api/messages";
import { AppText } from "@/src/components/AppText";
import { Button } from "@/src/components/Button";
import { Card } from "@/src/components/Card";
import { FormField } from "@/src/components/FormField";
import { Screen } from "@/src/components/Screen";
import { useSession } from "@/src/hooks/useSession";

export default function ChatScreen() {
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ conversationId: string }>();
  const conversationId = Number(params.conversationId);
  const { token } = useSession();
  const [body, setBody] = useState("");
  const options = { token };
  const messagesQuery = useQuery({
    queryKey: ["messages", conversationId, token],
    queryFn: () => getMessages(options, conversationId),
    enabled: Boolean(token && conversationId),
  });
  const mutation = useMutation({
    mutationFn: () => sendMessage(options, conversationId, body),
    onSuccess: () => {
      setBody("");
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
    },
    onError: (error: Error) => Alert.alert("Message failed", error.message),
  });

  return (
    <Screen>
      <Card className="gap-3">
        <AppText variant="title">Chat</AppText>
        <AppText className="text-paw-muted">Matched owners can coordinate a short public first meetup.</AppText>
      </Card>

      <Card className="gap-2">
        {(messagesQuery.data?.messages || []).map((message) => (
          <View key={message.id} className="rounded-paw bg-paw-paper p-3">
            <AppText>{message.body}</AppText>
            <AppText variant="caption">{message.createdAt}</AppText>
          </View>
        ))}
        {!messagesQuery.data?.messages?.length ? <AppText className="text-paw-muted">No messages yet.</AppText> : null}
      </Card>

      <Card className="gap-3">
        <FormField label="Message" value={body} onChangeText={setBody} placeholder="Send a friendly hello..." />
        <Button label={mutation.isPending ? "Sending..." : "Send"} onPress={() => mutation.mutate()} disabled={!body.trim() || mutation.isPending} />
      </Card>
    </Screen>
  );
}
