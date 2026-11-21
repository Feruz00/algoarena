import { useEffect } from "react";
import { Button, Result } from "antd";
import { useNavigate } from "react-router";

const NotFound = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "404 | Page Not Found";
  }, []);

  const goHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 opacity-0 animate-fadeIn">
      <div className="text-center p-6 bg-white rounded-lg shadow-lg w-96">
        <Result
          status="404"
          title="Oops! Page Not Found"
          subTitle="Sorry, the page you are looking for does not exist."
          extra={
            <Button
              type="primary"
              className="bg-blue-600 hover:bg-blue-700 border-blue-600"
              onClick={goHome}
            >
              Go Back Home
            </Button>
          }
        />
      </div>
    </div>
  );
};

export default NotFound;
