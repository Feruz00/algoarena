import http from "../../utils/https";

const getPermissionsApi = (params = {}) => {
  return new Promise((resolve, reject) => {
    http
      .get(`/permissions/`, {
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

export { getPermissionsApi };
