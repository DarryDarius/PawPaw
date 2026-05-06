import { Link } from "expo-router";

import { AppText } from "@/src/components/AppText";
import { Button } from "@/src/components/Button";
import { Card } from "@/src/components/Card";
import { Screen } from "@/src/components/Screen";

export default function NotFoundScreen() {
  return (
    <Screen>
      <Card className="gap-3">
        <AppText variant="title">Page not found</AppText>
        <AppText className="text-paw-muted">This mobile route is not part of the PawPaw MVP.</AppText>
        <Link href="/(tabs)" asChild>
          <Button label="Back to PawPaw" />
        </Link>
      </Card>
    </Screen>
  );
}
