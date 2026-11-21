import React from "react";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Breadcrumb } from "antd";
import { Link, useNavigate } from "react-router";

const Topbar = ({ name, routes = [] }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const breadcrumbItems = routes.map((route) => ({
    key: route.name,
    title: route.link ? (
      <Link
        to={{
          pathname: route.path || "#",
          search: route.params
            ? new URLSearchParams(route.params).toString()
            : "",
        }}
      >
        {route.title}
      </Link>
    ) : (
      route.title
    ),
  }));

  return (
    <div className="bg-white items-center py-3 px-6 rounded-lg shadow-md flex flex-row gap-2">
      {/* Back */}
      <ArrowLeftOutlined
        className="cursor-pointer text-gray-600 transition-colors hover:text-black"
        onClick={handleBack}
      />

      {/* Content */}
      <div className="flex flex-row justify-between items-center gap-2 w-full">
        {/* Breadcrumb */}
        {routes.length > 0 && <Breadcrumb items={breadcrumbItems} />}

        {/* Page title */}
        <h2 className="text-base font-semibold">{name}</h2>
      </div>
    </div>
  );
};

export default Topbar;
