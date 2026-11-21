import React, { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { App } from "antd";

import { useGetContest, useUpdateContests } from "./useContests";
import Loading from "../../components/Loading";
import ErrorPage from "../../components/ErrorPage";
import ContestForm from "./ContestForm";
import toast from "react-hot-toast";

const UpdateContest = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { isLoading, data, isError, error } = useGetContest(id);

  const { isPending, mutate: updateContest } = useUpdateContests();

  useEffect(() => {
    document.title = "Bäsleşigiň maglumatlaryny üýtgetmek | Judge";
  }, []);

  const handleSubmit = (values) => {
    if (!data?.data?.status === "finished") {
      toast.error("Bu bäsleşigiň maglumatlaryny üýtgedip bolmaýar!");
      return;
    }

    updateContest(
      { id, data: values },
      {
        onSuccess: () => {
          navigate(-1);
        },
      },
    );
  };

  const routes = [
    {
      name: "contests",
      title: "Bäsleşikler",
      path: "/contests",
      link: true,
    },
    {
      name: "update-contest",
      title: "Bäsleşigiň maglumatlaryny üýtgetmek",
      link: false,
    },
  ];

  if (isLoading) return <Loading />;

  if (isError) return <ErrorPage error={error} />;

  return (
    <ContestForm
      routes={routes}
      name="Maglumatlaryny üýtgetmek"
      type="update"
      handleSubmit={handleSubmit}
      isPending={isPending}
      defaultValues={data?.data}
    />
  );
};

export default UpdateContest;
