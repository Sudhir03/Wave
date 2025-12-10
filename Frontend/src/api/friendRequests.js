import api from "./apiClient";

export const getPendingRequests = async ({ token }) => {
  const res = await api.get("/friend-requests/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const sendFriendRequest = async ({ receiverId, token }) => {
  const res = await api.post(
    "/friend-requests/send",
    { receiverId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};

export const getSentFriendRequests = async ({ token }) => {
  const res = await api.get("/friend-requests/sent", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const cancelFriendRequest = async ({ requestId, token }) => {
  const res = await api.post(
    `/friend-requests/${requestId}/cancel`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};

export const respondToFriendRequest = async ({ id, action, token }) => {
  const res = await api.post(
    `/friend-requests/${id}/${action}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};
