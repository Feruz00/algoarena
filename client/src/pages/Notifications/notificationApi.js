import http from "../../utils/https";

const getNotificationsApi = (params = {}) => {
  return new Promise((resolve, reject) => {
    http
      .get("/notifications", { params })
      .then((res) => resolve(res.data))
      .catch((err) => {
        reject(err);
      });
  });
};

const updateApi = () => {
  return new Promise((resolve, reject) => {
    http
      .put("/notifications")
      .then((res) => resolve(res.data))
      .catch((err) => {
        reject(err);
      });
  });
};

export { getNotificationsApi, updateApi };
