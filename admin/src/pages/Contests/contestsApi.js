import http from "../../utils/https";

const getContestsApi = (params = {}) => {
  return new Promise((resolve, reject) => {
    http
      .get(`/contests/`, {
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

const deleteContestApi = (id) => {
  return new Promise((resolve, reject) => {
    http
      .delete(`/contests/${id}`)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err?.response?.data?.message || "Serwerde näsazlyk bar");
      });
  });
};
const deleteContestsApi = (data) => {
  return new Promise((resolve, reject) => {
    http
      .delete(`/contests/`, {
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

const deleteContestPermenantlyApi = (id) => {
  return new Promise((resolve, reject) => {
    http
      .delete(`/contests/permenantly/${id}`)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err?.response?.data?.message || "Serwerde näsazlyk bar");
      });
  });
};

const deleteContestsPermenantlyApi = (data) => {
  return new Promise((resolve, reject) => {
    http
      .delete(`${server}/contests/`, {
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

const restoreContestApi = (id) => {
  return new Promise((resolve, reject) => {
    http
      .delete(`/contests/restore/${id}`)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err?.response?.data?.message || "Serwerde näsazlyk bar");
      });
  });
};

const createContestApi = (data = {}) => {
  return new Promise((resolve, reject) => {
    http
      .post(`/contests/`, data)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err?.response?.data?.message || "Serwerde näsazlyk bar");
      });
  });
};

const getContestApi = (id) => {
  return new Promise((resolve, reject) => {
    http
      .get(`/contests/${id}`)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const getUsersByContestApi = (id, query = {}) => {
  return new Promise((resolve, reject) => {
    http
      .get(`/contests/${id}/users`, {
        params: query,
      })
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const updateContestApi = (id, data = {}) => {
  return new Promise((resolve, reject) => {
    http
      .patch(`/contests/${id}`, data)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err?.response?.data?.message || "Serwerde näsazlyk bar");
      });
  });
};

const startContestApi = (id) => {
  return new Promise((resolve, reject) => {
    http
      .post(`/contests/${id}/start`)
      .then((res) => {
        // console.log("geldim", res.data);
        resolve(res.data);
      })
      .catch((err) => {
        reject(err?.response?.data?.message || "Serwerde näsazlyk bar");
      });
  });
};

const stopContestApi = (id) => {
  return new Promise((resolve, reject) => {
    http
      .post(`/contests/${id}/stop`)
      .then((res) => {
        resolve(res.data);
        console.log("geldim");
      })
      .catch((err) => {
        console.log(err);

        reject(err?.response?.data?.message || "Serwerde näsazlyk bar");
      });
  });
};

const registerUsersToContestsManualApi = (id, data = {}) => {
  return new Promise((resolve, reject) => {
    http
      .post(`/contests/${id}/manual`, data)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err?.response?.data?.message || "Serwerde näsazlyk bar");
      });
  });
};

const registerToContestApi = (id) => {
  return new Promise((resolve, reject) => {
    http
      .post(`/contests/${id}/register`)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err?.response?.data?.message || "Serwerde näsazlyk bar");
      });
  });
};

const blockUserAtContestApi = (id, userId) => {
  return new Promise((resolve, reject) => {
    http
      .post(`/contests/${id}/users/${userId}/block`)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err?.response?.data?.message || "Serwerde näsazlyk bar");
      });
  });
};

const cancelToContestApi = (id) => {
  return new Promise((resolve, reject) => {
    http
      .post(`/contests/${id}/cancel-registration`)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err?.response?.data?.message || "Serwerde näsazlyk bar");
      });
  });
};

const cancelUsersToContestsManualApi = (id, data = {}) => {
  return new Promise((resolve, reject) => {
    http
      .post(`/contests/${id}/cancel-manual-registration`, data)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err?.response?.data?.message || "Serwerde näsazlyk bar");
      });
  });
};

export {
  getContestsApi,
  getContestApi,
  createContestApi,
  updateContestApi,
  deleteContestApi,
  deleteContestsApi,
  deleteContestPermenantlyApi,
  deleteContestsPermenantlyApi,
  restoreContestApi,
  startContestApi,
  stopContestApi,
  blockUserAtContestApi,
  registerToContestApi,
  registerUsersToContestsManualApi,
  getUsersByContestApi,
  cancelToContestApi,
  cancelUsersToContestsManualApi,
};
