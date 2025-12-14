import api from "./apiClient";

export const getMyConversations = async ({ pageParam = null, token }) => {
  const res = await api.get("/chats/my-conversations", {
    params: {
      limit: 10,
      cursor: pageParam,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const getMessages = async ({ conversationId, cursor, token }) => {
  const params = new URLSearchParams();
  params.append("limit", 20);

  if (cursor) params.append("cursor", cursor);

  const res = await api.get(
    `/chats/${conversationId}/messages?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};

// Fetches chat details and history using either friendId or conversationId
export const getUnifiedChatData = async ({ id, token }) => {
  const endpoint = `/chats/${id}`;

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
