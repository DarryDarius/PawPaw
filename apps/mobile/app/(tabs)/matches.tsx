import { useQuery } from "@tanstack/react-query";
import { Link } from "expo-router";

import { getMatches } from "@/src/api/matches";
import { AppText } from "@/src/components/AppText";
import { Button } from "@/src/components/Button";
import { Card } from "@/src/components/Card";
import { EmptyState } from "@/src/components/EmptyState";
import { MatchRow } from "@/src/components/MatchRow";
import { Screen } from "@/src/components/Screen";
import { useSession } from "@/src/hooks/useSession";

export default function MatchesScreen() {
  const { token } = useSession();
  const matchesQuery = useQuery({
    queryKey: ["matches", token],
    queryFn: () => getMatches({ token }),
    enabled: Boolean(token),
  });
  const matches = matchesQuery.data?.matches || [];

  if (!token) {
    return <LoginGate />;
  }

  return (
    <Screen>
      <Card className="gap-2">
        <AppText variant="title">Matches</AppText>
        <AppText className="text-paw-muted">Mutual likes unlock chat and playdate planning.</AppText>
      </Card>

      {matches.length ? (
        matches.map((match) => (
          <Link key={match.id} href={`/chat/${match.conversationId}?matchId=${match.id}`} asChild>
            <MatchRow match={match} />
          </Link>
        ))
      ) : (
        <EmptyState title="No matches yet" body="Like compatible dogs in Discover. Mutual likes appear here." />
      )}
    </Screen>
  );
}

function LoginGate() {
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
