import api from "./apiClient";

export const getMyConversationPreferences = async ({ token }) => {
  const res = await api.get("/conversation-preferences", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// =======================
// GET Conversation Preference
// =======================
export const getConversationPreference = async ({ conversationId, token }) => {
  const res = await api.get(`/conversation-preferences/${conversationId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // { pinned: boolean, muted: boolean }
  return res.data;
};

// =======================
// PATCH Update Conversation Preference
// =======================
export const updateConversationPreference = async ({
  conversationId,
  data, // { pinned?, muted? }
  token,
}) => {
  const res = await api.patch(
    `/conversation-preferences/${conversationId}`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};
