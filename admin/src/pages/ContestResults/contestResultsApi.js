import http from "../../utils/https";

const getContestResultsApi = (contestId) => {
  // console.log(contestId);
  return new Promise((resolve, reject) => {
    http
      .get(`/contest-results/${contestId}/results`)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const exportContestResultsApi = (contestId) => {
  return new Promise((resolve, reject) => {
    http
      .get(`/contest-results/${contestId}/export`, {
        responseType: "blob",
      })
      .then((res) => {
        // Download the file
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "contest-results.xlsx");
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

export { getContestResultsApi, exportContestResultsApi };
