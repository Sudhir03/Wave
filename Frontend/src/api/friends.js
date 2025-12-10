import api from "./apiClient";

// GET /friends/my
export const getMyFriends = async ({ token }) => {
  const res = await api.get("/friends/my", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

// POST /friends/:id/remove-friend
export const removeFriend = async ({ id, token }) => {
  const res = await api.post(
    `/friends/${id}/remove-friend`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};
