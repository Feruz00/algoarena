import http from "../../../utils/https";

const createTestGroupApi = (data = {}) =>
  http
    .post("/test-groups/", data)
    .then((res) => res.data)
    .catch((err) =>
      Promise.reject(err?.response?.data?.message || "Serwerde näsazlyk bar"),
    );

const getTestGroupsApi = (params = {}) =>
  http
    .get("/test-groups/", { params })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));

const getTestGroupApi = (id) =>
  http
    .get(`/test-groups/${id}`)
    .then((res) => res.data)
    .catch((err) =>
      Promise.reject(err?.response?.data?.message || "Serwerde näsazlyk bar"),
    );

const updateTestGroupApi = (id, data = {}) =>
  http
    .patch(`/test-groups/${id}`, data)
    .then((res) => res.data)
    .catch((err) =>
      Promise.reject(err?.response?.data?.message || "Serwerde näsazlyk bar"),
    );

const updateTestGroupOrderApi = (problemId, data = {}) =>
  http
    .patch(`/test-groups/order/${problemId}`, data)
    .then((res) => res.data)
    .catch((err) =>
      Promise.reject(err?.response?.data?.message || "Serwerde näsazlyk bar"),
    );

const deleteTestGroupApi = (id) =>
  http
    .delete(`/test-groups/${id}`)
    .then((res) => res.data)
    .catch((err) =>
      Promise.reject(err?.response?.data?.message || "Serwerde näsazlyk bar"),
    );

const deleteTestGroupsApi = (ids = []) =>
  http
    .delete("/test-groups/", { data: { ids }, withCredentials: true })
    .then((res) => res.data)
    .catch((err) =>
      Promise.reject(err?.response?.data?.message || "Serwerde näsazlyk bar"),
    );

const restoreTestGroupApi = (id) =>
  http
    .delete(`/test-groups/restore/${id}`)
    .then((res) => res.data)
    .catch((err) =>
      Promise.reject(err?.response?.data?.message || "Serwerde näsazlyk bar"),
    );

const deleteTestGroupPermanentlyApi = (id) =>
  http
    .delete(`/test-groups/permenantly/${id}`)
    .then((res) => res.data)
    .catch((err) =>
      Promise.reject(err?.response?.data?.message || "Serwerde näsazlyk bar"),
    );

const deleteTestGroupsPermanentlyApi = (ids = []) =>
  http
    .delete("/test-groups/permenantly/", {
      data: { ids },
      withCredentials: true,
    })
    .then((res) => res.data)
    .catch((err) =>
      Promise.reject(err?.response?.data?.message || "Serwerde näsazlyk bar"),
    );

export {
  updateTestGroupOrderApi,
  createTestGroupApi,
  getTestGroupsApi,
  getTestGroupApi,
  updateTestGroupApi,
  deleteTestGroupApi,
  deleteTestGroupsApi,
  restoreTestGroupApi,
  deleteTestGroupPermanentlyApi,
  deleteTestGroupsPermanentlyApi,
};
