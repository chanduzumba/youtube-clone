import { useMemo } from "react";

export function useAuth() {
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const authToken = useMemo(() => localStorage.getItem("token") || "", []);

  const authHeaders = useMemo(
    () => ({
      headers: { Authorization: `Bearer ${authToken}` },
    }),
    [authToken],
  );

  const getCurrentUserId = () =>
    currentUser?._id || currentUser?.id || currentUser?.userId || null;

  return { currentUser, authToken, authHeaders, getCurrentUserId };
}

export default useAuth;
