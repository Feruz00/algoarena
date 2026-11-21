import http from "../../utils/https";

const getTagsApi = (params = {}) => {
  return new Promise((resolve, reject) => {
    http
      .get("/tags/", { params })
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
};

const getTagApi = (id) => {
  return new Promise((resolve, reject) => {
    http
      .get(`/tags/${id}`)
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
};

const createTagApi = (data = {}) => {
  return new Promise((resolve, reject) => {
    http
      .post("/tags/", data)
      .then((res) => resolve(res.data))
      .catch((err) =>
        reject(err?.response?.data?.message || "Serwerde näsazlyk bar"),
      );
  });
};

const updateTagApi = (id, data = {}) => {
  return new Promise((resolve, reject) => {
    http
      .patch(`/tags/${id}`, data)
      .then((res) => resolve(res.data))
      .catch((err) =>
        reject(err?.response?.data?.message || "Serwerde näsazlyk bar"),
      );
  });
};

// Soft-delete one tag
const deleteTagApi = (id) => {
  return new Promise((resolve, reject) => {
    http
      .delete(`/tags/${id}`)
      .then((res) => resolve(res.data))
      .catch((err) =>
        reject(err?.response?.data?.message || "Serwerde näsazlyk bar"),
      );
  });
};

// Soft-delete multiple tags
const deleteTagsApi = (ids) => {
  return new Promise((resolve, reject) => {
    http
      .delete("/tags/", { data: { ids } })
      .then((res) => resolve(res.data))
      .catch((err) =>
        reject(err?.response?.data?.message || "Serwerde näsazlyk bar"),
      );
  });
};

// Restore a soft-deleted tag
const restoreTagApi = (id) => {
  return new Promise((resolve, reject) => {
    http
      .delete(`/tags/restore/${id}`)
      .then((res) => resolve(res.data))
      .catch((err) =>
        reject(err?.response?.data?.message || "Serwerde näsazlyk bar"),
      );
  });
};

// Permanently delete one tag
const deleteTagPermanentlyApi = (id) => {
  return new Promise((resolve, reject) => {
    http
      .delete(`/tags/permenantly/${id}`)
      .then((res) => resolve(res.data))
      .catch((err) =>
        reject(err?.response?.data?.message || "Serwerde näsazlyk bar"),
      );
  });
};

// Permanently delete multiple tags
const deleteTagsPermanentlyApi = (ids) => {
  return new Promise((resolve, reject) => {
    http
      .delete("/tags/permenantly", { data: { ids } })
      .then((res) => resolve(res.data))
      .catch((err) =>
        reject(err?.response?.data?.message || "Serwerde näsazlyk bar"),
      );
  });
};

export {
  getTagsApi,
  getTagApi,
  createTagApi,
  updateTagApi,
  deleteTagApi,
  deleteTagsApi,
  restoreTagApi,
  deleteTagPermanentlyApi,
  deleteTagsPermanentlyApi,
};
