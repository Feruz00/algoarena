import http from "../../utils/https";

const sendSubmissionmApi = (data = {}) => {
  return new Promise((resolve, reject) => {
    http
      .post(`/submissions/client`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => resolve(res.data))
      .catch((err) => {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Something went wrong";

        reject(message);
      });
  });
};

const getSubmissionsApi = (params = {}) => {
  return new Promise((resolve, reject) => {
    http
      .get(`/submissions/client/`, { params })
      .then((res) => resolve(res.data))
      .catch((err) => {
        reject(err);
      });
  });
};

export { sendSubmissionmApi, getSubmissionsApi };
