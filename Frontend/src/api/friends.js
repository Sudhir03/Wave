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

// POST /friends/:id/remove-friend (id is the Friend's User ID)
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

// GET /friends/ (Pending Requests - Incoming)
export const getPendingRequests = async ({ token }) => {
  const res = await api.get("/friends", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

// POST /friends/send
export const sendFriendRequest = async ({ receiverId, token }) => {
  const res = await api.post(
    "/friends/send",
    { receiverId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};

// GET /friends/sent
export const getSentFriendRequests = async ({ token }) => {
  const res = await api.get("/friends/sent", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

// POST /friends/:id/cancel (id is the Friendship ID)
export const cancelFriendRequest = async ({ requestId, token }) => {
  const res = await api.post(
    `/friends/${requestId}/cancel`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};

// POST /friends/:id/accept OR /friends/:id/decline
export const respondToFriendRequest = async ({ id, action, token }) => {
  const res = await api.post(
    `/friends/${id}/${action}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};
