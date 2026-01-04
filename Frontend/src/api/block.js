import api from "./apiClient";

/**
 * POST /blocks/:userId/block
 * Block a user
 */
export const blockUser = async ({ userId, token }) => {
  const res = await api.post(
    `/block/${userId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};

/**
 * DELETE /blocks/:userId/block
 * Unblock a user
 */
export const unblockUser = async ({ userId, token }) => {
  const res = await api.delete(`/block/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

/**
 * GET /blocks
 * Get blocked users
 */
export const getBlockedUsers = async ({ token }) => {
  const res = await api.get("/block", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};
