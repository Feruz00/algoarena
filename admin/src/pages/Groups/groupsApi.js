import http from "../../utils/https";

const createGroupApi = (data = {}) => {
  return new Promise((resolve, reject) => {
    http
      .post(`/groups/`, data)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err?.response?.data?.message || "Serwerde näsazlyk bar");
      });
  });
};

const getGroupsApi = (params = {}) => {
  return new Promise((resolve, reject) => {
    http
      .get(`/groups/`, {
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

const getGroupApi = (id) => {
  return new Promise((resolve, reject) => {
    http
      .get(`/groups/${id}`)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const updateGroupApi = (id, data = {}) => {
  return new Promise((resolve, reject) => {
    http
      .patch(`/groups/${id}`, data)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err?.response?.data?.message || "Serwerde näsazlyk bar");
      });
  });
};

const deleteGroupApi = (id) => {
  return new Promise((resolve, reject) => {
    http
      .delete(`/groups/${id}`)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err?.response?.data?.message || "Serwerde näsazlyk bar");
      });
  });
};
const deleteGroupsApi = (data) => {
  return new Promise((resolve, reject) => {
    http
      .delete(`/groups/`, {
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

const deleteGroupPermenantlyApi = (id) => {
  return new Promise((resolve, reject) => {
    http
      .delete(`/groups/permenantly/${id}`)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err?.response?.data?.message || "Serwerde näsazlyk bar");
      });
  });
};

const deleteGroupsPermenantlyApi = (data) => {
  return new Promise((resolve, reject) => {
    http
      .delete(`${server}/groups/`, {
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

const restoreGroupApi = (id) => {
  return new Promise((resolve, reject) => {
    http
      .delete(`/groups/restore/${id}`)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err?.response?.data?.message || "Serwerde näsazlyk bar");
      });
  });
};

const exportGroupsApi = () => {
  return new Promise((resolve, reject) => {
    http
      .get(`/groups/export`, {
        responseType: "blob",
      })
      .then((res) => {
        // Download the file
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "groups.xlsx");
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

const importGroupsApi = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return new Promise((resolve, reject) => {
    http
      .post(`/groups/import`, formData, {
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
  createGroupApi,
  restoreGroupApi,
  updateGroupApi,
  getGroupApi,
  getGroupsApi,
  deleteGroupApi,
  deleteGroupsApi,
  deleteGroupPermenantlyApi,
  deleteGroupsPermenantlyApi,
  exportGroupsApi,
  importGroupsApi,
};
