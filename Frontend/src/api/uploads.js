import api from "./apiClient";

export const uploadProfileImage = async (file, token) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", "profile");

  const res = await api.post("/uploads", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};
