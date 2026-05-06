import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/src/api/profile";
import { useSession } from "./useSession";

export function useMe() {
  const { token } = useSession();
  return useQuery({
    queryKey: ["me", token],
    queryFn: () => getMe({ token }),
    enabled: Boolean(token),
    retry: 1,
  });
}
