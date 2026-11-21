import { Button, Card } from "antd";
import { WarningOutlined } from "@ant-design/icons";
import { Link } from "react-router";

const ErrorPage = ({ error }) => {
  const refreshPage = () => {
    window.location.reload();
  };

  console.log(error);

  const statusCode = error?.response?.status || error?.status || 500;

  const title = (() => {
    switch (statusCode) {
      case 400:
        return "Bad Request";

      case 401:
        return "Unauthorized Access";

      case 403:
        return "Access Denied";

      case 404:
        return "Page Not Found";

      case 409:
        return "Conflict";

      case 422:
        return "Validation Error";

      case 500:
        return "Internal Server Error";

      case 502:
        return "Bad Gateway";

      case 503:
        return "Service Unavailable";

      default:
        return "Something went wrong";
    }
  })();

  const message =
    error?.response?.data?.message ||
    error?.message ||
    "Please try again later.";

  // console.log(statusCode, title, message);

  return (
    <div className="w-full h-full flex justify-center items-center py-10">
      <Card
        className="w-full max-w-3xl  border border-gray-800 shadow-2xl rounded-2xl"
        styles={{
          body: {
            padding: 0,
          },
        }}
      >
        <div className=" rounded-2xl w-full overflow-hidden">
          <div className="flex flex-col md:flex-row items-center md:items-stretch">
            {/* Status code */}
            <div className="flex items-center justify-center w-full md:w-1/3 p-8">
              <div className="text-center">
                <WarningOutlined className="text-5xl text-red-500 mb-4" />

                <h1 className="text-6xl font-extrabold text-red-500 tracking-wider">
                  {statusCode}
                </h1>
              </div>
            </div>

            {/* Error information */}
            <div className="flex-1 p-8 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-semibold mb-3">
                {title}
              </h2>

              <p className=" mb-6 text-sm md:text-base wrap-break-words">
                {message}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 sm:justify-start justify-center">
                <Button type="primary" size="large" onClick={refreshPage}>
                  Refresh Page
                </Button>

                <Link
                  to="/"
                  className="px-6 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 transition text-center"
                >
                  Go Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ErrorPage;
