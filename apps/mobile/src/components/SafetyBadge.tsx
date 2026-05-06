import { Badge } from "./Badge";

export function SafetyBadge({ vaccineStatus }: { vaccineStatus?: string }) {
  return <Badge label={vaccineStatus === "verified" ? "Verified vaccine" : "Self reported"} tone={vaccineStatus === "verified" ? "teal" : "warning"} />;
}
