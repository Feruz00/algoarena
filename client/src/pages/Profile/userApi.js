import http from "../../utils/https";

const changePasswordApi = (data = {}) => {
  return new Promise((resolve, reject) => {
    http
      .patch("/users/client", data)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Something went wrong";

        reject(message);
      });
  });
};

const updateMyDataApi = (data = {}) => {
  return new Promise((resolve, reject) => {
    http
      .put("/users/client", data)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Something went wrong";

        reject(message);
      });
  });
};

const getUsernameApi = (username) => {
  return new Promise((resolve, reject) => {
    http
      .get(`/users/client/${username}`)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export { changePasswordApi, updateMyDataApi, getUsernameApi };
