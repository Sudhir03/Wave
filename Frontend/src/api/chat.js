import api from "./apiClient";

/* =========================
   Conversations
========================= */
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

/* =========================
   Messages (pagination)
========================= */
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

/* =========================
   SEND TEXT MESSAGE
========================= */
export const sendTextMessage = async ({
  token,
  conversationId,
  content,
  clientId,
}) => {
  const res = await api.post(
    "/chats/send/text",
    {
      conversationId,
      content,
      clientId,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};

/* =========================
   SEND MEDIA MESSAGE
========================= */
export const sendMediaMessage = async ({
  token,
  conversationId,
  files,
  clientId,
}) => {
  const formData = new FormData();

  formData.append("conversationId", conversationId);
  formData.append("clientId", clientId);

  files.forEach((file, idx) => formData.append("files", file));

  const res = await api.post("/chats/send/media", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};
