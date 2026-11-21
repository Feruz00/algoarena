import http from "../../utils/https";

const getDeletedItems = (params = {}) => {
  return new Promise((resolve, reject) => {
    http
      .get(`/restore/`, {
        params,
      })
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const restoreItem = (id, key) => {
  return new Promise((resolve, reject) => {
    http
      .patch(`/restore/${id}/${key}`)
      .then((res) => resolve(res.data))
      .catch((err) =>
        reject(err?.response?.data?.message || "Serwerde näsazlyk bar"),
      );
  });
};

const deleteItem = (id, key) => {
  return new Promise((resolve, reject) => {
    http
      .delete(`/restore/${id}/${key}`)
      .then((res) => resolve(res.data))
      .catch((err) =>
        reject(err?.response?.data?.message || "Serwerde näsazlyk bar"),
      );
  });
};

const deleteItems = (ids) => {
  return new Promise((resolve, reject) => {
    http
      .delete(`/restore/`, { data: { ids } })
      .then((res) => resolve(res.data))
      .catch((err) =>
        reject(err?.response?.data?.message || "Serwerde näsazlyk bar"),
      );
  });
};
export { getDeletedItems, restoreItem, deleteItem, deleteItems };
