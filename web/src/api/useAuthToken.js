import { useEffect } from "react";

export default function useAuthToken() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("authToken", token);
      // remove ?token=... from URL
      window.history.replaceState({}, "", "/buildings");
    }
  }, []);
}
