import axios from "axios";
const server = import.meta.env.VITE_API_URL;

const createFile = (data, onProgress) => {
  // console.log(server)
  return new Promise((resolve, reject) => {
    axios({
      method: "POST",
      url: `${server}/upload`,
      onUploadProgress: (progressEvent) => {
        // let { loaded, total } = progressEvent
        // console.log((loaded / total) * 100)
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total,
        );
        // console.log(percent)
        if (onProgress) {
          onProgress(percent);
        }
      },
      withCredentials: true,
      // headers: {
      //   'Content-Type': 'multipart/form-data',
      // },
      data,
    })
      .then((res) => {
        const { data } = res;
        resolve(data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const deleteFile = (id) => {
  return new Promise((resolve, reject) => {
    axios
      .delete(`${server}/api/upload/${id}`, { withCredentials: true })
      .then((res) => {
        const { data } = res;
        resolve(data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const permanentlyFile = (id) => {
  return new Promise((resolve, reject) => {
    axios
      .delete(`${server}/api/upload/permanently/${id}`, {
        withCredentials: true,
      })
      .then((res) => {
        const { data } = res;
        resolve(data);
      })
      .catch((err) => {
        // console.log(err)
        reject(err);
      });
  });
};

const restoreFile = (id) => {
  return new Promise((resolve, reject) => {
    axios
      .put(`${server}/api/upload/restore/${id}`, {}, { withCredentials: true })
      .then((res) => {
        const { data } = res;
        resolve(data);
      })
      .catch((err) => {
        // console.log(err);
        reject(err);
      });
  });
};

export { createFile, deleteFile, permanentlyFile, restoreFile };
