import http from "../../utils/https";

const getRegistrationsCount = (params = {}) => {
  return new Promise((resolve, reject) => {
    http
      .get("/my/registration-count", { params })
      .then((res) => resolve(res.data))
      .catch((err) => {
        reject(err);
      });
  });
};

const getHomePageApi = (params = {}) => {
  return new Promise((resolve, reject) => {
    http
      .get("/my/home", { params })
      .then((res) => resolve(res.data))
      .catch((err) => {
        reject(err);
      });
  });
};

export { getRegistrationsCount, getHomePageApi };
