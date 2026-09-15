import { useAppState } from "../../context/useAppState";
import { useAuth } from "../../context/useAuth";

export function useFacility() {
  const { user } = useAuth();
  const { institutions } = useAppState();
  const facility = institutions.find((institution) => institution.id === user?.institutionId);
  return { user, facility };
}
