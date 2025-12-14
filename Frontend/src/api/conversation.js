import api from "./apiClient";

// GET Conversation ID (Check Existence)
export const getConversationId = async ({ friendId, token }) => {
  const res = await api.get(`/conversations/${friendId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

// POST Conversation ID
export const createConversation = async ({ friendId, token }) => {
  const res = await api.post(
    `/conversations/${friendId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};
