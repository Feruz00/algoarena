import http from "../../utils/https";

const getSourcesApi = (params = {}) => {
  return new Promise((resolve, reject) => {
    http
      .get(`/sources/client/`, {
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
      .get(`/sources/client/${id}`)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export { getSourceApi, getSourcesApi };
