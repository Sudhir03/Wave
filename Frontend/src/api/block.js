// src/api/block.js
import api from "./apiClient";

/**
 * POST /block/:userId
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
 * POST /block/:userId/unblock
 * Unblock a user
 */
export const unblockUser = async ({ userId, token }) => {
  const res = await api.post(
    `/block/${userId}/unblock`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};

export const getBlockedUsers = async ({ token }) => {
  const res = await api.get("/block", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};
