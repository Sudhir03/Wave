import api from "./apiClient";

/**
 * GET /calls/history
 * Get logged-in user's call history
 */
export const getMyCallHistory = async ({ token }) => {
  const res = await api.get("/calls/history", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};
