import api from "./apiClient";

export const getMyProfile = async ({ token }) => {
  const res = await api.get("/users/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const updateMyProfile = async ({ token, payload }) => {
  const res = await api.patch("/users/me", payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const updateMyAvatar = async ({ token, file }) => {
  const formData = new FormData();
  formData.append("avatar", file);

  const res = await api.patch("/users/me/avatar", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

export const updateMyPassword = async ({ token, newPassword }) => {
  const res = await api.patch(
    "/users/me/password",
    { newPassword },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};

export const searchUsers = async ({ query, token }) => {
  const res = await api.get(`/users/search?q=${encodeURIComponent(query)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};
