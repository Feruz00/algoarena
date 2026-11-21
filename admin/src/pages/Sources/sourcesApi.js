import http from "../../utils/https";

const getSourcesApi = (params = {}) => {
  return new Promise((resolve, reject) => {
    http
      .get(`/sources/`, {
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

const getSourceApi = (id) => {
  return new Promise((resolve, reject) => {
    http
      .get(`/sources/${id}`)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const getSourceParentsApi = (id) => {
  return new Promise((resolve, reject) => {
    http
      .get(`/sources/${id}/parents`)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const deleteSourceApi = (id) => {
  return new Promise((resolve, reject) => {
    http
      .delete(`/sources/${id}`)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err?.response?.data?.message || "Serwerde näsazlyk bar");
      });
  });
};
const deleteSourcesApi = (data) => {
  return new Promise((resolve, reject) => {
    http
      .delete(`/sources/`, {
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

const deleteSourcePermenantlyApi = (id) => {
  return new Promise((resolve, reject) => {
    http
      .delete(`/sources/permenantly/${id}`)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err?.response?.data?.message || "Serwerde näsazlyk bar");
      });
  });
};

const deleteSourcesPermenantlyApi = (data) => {
  return new Promise((resolve, reject) => {
    http
      .delete(`${server}/sources/`, {
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

const restoreSourceApi = (id) => {
  return new Promise((resolve, reject) => {
    http
      .delete(`/sources/restore/${id}`)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err?.response?.data?.message || "Serwerde näsazlyk bar");
      });
  });
};

const updateSourceApi = (id, data = {}) => {
  return new Promise((resolve, reject) => {
    http
      .patch(`/sources/${id}`, data)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err?.response?.data?.message || "Serwerde näsazlyk bar");
      });
  });
};

const createSourceApi = (data = {}) => {
  return new Promise((resolve, reject) => {
    http
      .post(`/sources/`, data)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err?.response?.data?.message || "Serwerde näsazlyk bar");
      });
  });
};

export {
  getSourceApi,
  getSourcesApi,
  deleteSourceApi,
  deleteSourcesApi,
  deleteSourcePermenantlyApi,
  deleteSourcesPermenantlyApi,
  restoreSourceApi,
  updateSourceApi,
  getSourceParentsApi,
  createSourceApi,
};
