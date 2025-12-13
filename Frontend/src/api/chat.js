import api from "./apiClient";

// Fetches chat details and history using either friendId or conversationId
export const getUnifiedChatData = async ({ id, isFriendId, token }) => {
  const endpoint = isFriendId ? `/chats/by-user/${id}` : `/chats/${id}`;

  const res = await api.get(endpoint, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
};

// Sends a message. If conversationId is missing, it creates a new conversation first.
export const sendMessage = async (body) => {
  const { token, ...requestBody } = body;

  const res = await api.post("/chats/send", requestBody, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
};
