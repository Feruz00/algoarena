import http from "../../utils/https";

const createRoleApi = (data = {}) => {
  return new Promise((resolve, reject) => {
    http
      .post(`/roles/`, data)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err?.response?.data?.message || "Serwerde näsazlyk bar");
      });
  });
};

const getRolesApi = (params = {}) => {
  return new Promise((resolve, reject) => {
    http
      .get(`/roles/`, {
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

const getRoleApi = (id) => {
  return new Promise((resolve, reject) => {
    http
      .get(`/roles/${id}`)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const updateRoleApi = (id, data = {}) => {
  return new Promise((resolve, reject) => {
    http
      .patch(`/roles/${id}`, data)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err?.response?.data?.message || "Serwerde näsazlyk bar");
      });
  });
};

const deleteRoleApi = (id) => {
  return new Promise((resolve, reject) => {
    http
      .delete(`/roles/${id}`)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err?.response?.data?.message || "Serwerde näsazlyk bar");
      });
  });
};

const deleteRolesApi = (data) => {
  return new Promise((resolve, reject) => {
    http
      .delete(`/roles`, {
        data: {
          ids: data,
        },
        withCredentials: true,
      })
      .then((res) => {
        const { data } = res;
        resolve(data);
      })
      .catch((err) => {
        reject(err?.response?.data?.message || "Serwerde näsazlyk bar");
      });
  });
};

const deleteRolePermenantlyApi = (id) => {
  return new Promise((resolve, reject) => {
    http
      .delete(`/roles/permenantly/${id}`)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err?.response?.data?.message || "Serwerde näsazlyk bar");
      });
  });
};

const deleteRolesPermenantlyApi = (data) => {
  return new Promise((resolve, reject) => {
    http
      .delete(`${server}/roles`, {
        data: {
          ids: data,
        },
        withCredentials: true,
      })
      .then((res) => {
        const { data } = res;
        resolve(data);
      })
      .catch((err) => {
        reject(err?.response?.data?.message || "Serwerde näsazlyk bar");
      });
  });
};

const restoreRoleApi = (id) => {
  return new Promise((resolve, reject) => {
    http
      .delete(`/roles/restore/${id}`)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err?.response?.data?.message || "Serwerde näsazlyk bar");
      });
  });
};
export {
  createRoleApi,
  restoreRoleApi,
  updateRoleApi,
  getRoleApi,
  getRolesApi,
  deleteRoleApi,
  deleteRolesApi,
  deleteRolePermenantlyApi,
  deleteRolesPermenantlyApi,
};
