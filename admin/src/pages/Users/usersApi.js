import http from "../../utils/https";

const createUserApi = (data = {}) => {
  return new Promise((resolve, reject) => {
    http
      .post(`/users/`, data)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err?.response?.data?.message || "Serwerde näsazlyk bar");
      });
  });
};

const getUsersApi = (params = {}) => {
  return new Promise((resolve, reject) => {
    http
      .get(`/users/`, {
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

const getUserApi = (id) => {
  return new Promise((resolve, reject) => {
    http
      .get(`/users/${id}`)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const updateUserApi = (id, data = {}) => {
  return new Promise((resolve, reject) => {
    http
      .patch(`/users/${id}`, data)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err?.response?.data?.message || "Serwerde näsazlyk bar");
      });
  });
};

const deleteUserApi = (id) => {
  return new Promise((resolve, reject) => {
    http
      .delete(`/users/${id}`)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err?.response?.data?.message || "Serwerde näsazlyk bar");
      });
  });
};
const deleteUsersApi = (data) => {
  return new Promise((resolve, reject) => {
    http
      .delete(`/users/`, {
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

const deleteUserPermenantlyApi = (id) => {
  return new Promise((resolve, reject) => {
    http
      .delete(`/users/permenantly/${id}`)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err?.response?.data?.message || "Serwerde näsazlyk bar");
      });
  });
};

const deleteUsersPermenantlyApi = (data) => {
  return new Promise((resolve, reject) => {
    http
      .delete(`${server}/users/`, {
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

const restoreUserApi = (id) => {
  return new Promise((resolve, reject) => {
    http
      .delete(`/users/restore/${id}`)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err?.response?.data?.message || "Serwerde näsazlyk bar");
      });
  });
};

const exportUsersApi = () => {
  return new Promise((resolve, reject) => {
    http
      .get(`/users/export`, {
        responseType: "blob",
      })
      .then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "users.xlsx");
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        resolve(res.data);
      })
      .catch((err) => {
        reject(err?.response?.data?.message || "Serwerde näsazlyk bar");
      });
  });
};

const importUsersApi = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return new Promise((resolve, reject) => {
    http
      .post(`/users/import`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err?.response?.data?.message || "Serwerde näsazlyk bar");
      });
  });
};
const updatePasswordsByExcelApi = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return new Promise((resolve, reject) => {
    http
      .post(`/users/update-passwords`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err?.response?.data?.message || "Serwerde näsazlyk bar");
      });
  });
};
export {
  exportUsersApi,
  importUsersApi,
  updatePasswordsByExcelApi,
  createUserApi,
  restoreUserApi,
  updateUserApi,
  getUserApi,
  getUsersApi,
  deleteUserApi,
  deleteUsersApi,
  deleteUserPermenantlyApi,
  deleteUsersPermenantlyApi,
};
