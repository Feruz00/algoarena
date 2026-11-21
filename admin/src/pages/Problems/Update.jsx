import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useGetProblem, useUpdateProblem } from "./hooks/useProblems";
import ProblemForm from "./ProblemForm";
import Loading from "../../components/Loading";
import ErrorPage from "../../components/ErrorPage";

const UpdatePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { isLoading, data, isError, error } = useGetProblem(id);

  const { isPending, mutate: updateProblem } = useUpdateProblem();

  useEffect(() => {
    document.title = "Meseläniň maglumatlaryny üýtgetmek | Judge";
  }, []);

  const handleSubmit = (values) => {
    updateProblem(
      { id, data: values },
      {
        onSuccess: () => {
          navigate("/problems");
        },
      },
    );
  };

  const routes = [
    {
      name: "problems",
      title: "Meseleler",
      path: "/problems",
      link: true,
    },
    {
      name: "update-problem",
      title: "Meseläni üýtgetmek",
      link: false,
    },
  ];

  if (isLoading) return <Loading />;
  if (isError) return <ErrorPage error={error} />;

  return (
    <ProblemForm
      routes={routes}
      name="Meseläni üýtgetmek"
      type="update"
      handleSubmit={handleSubmit}
      isPending={isPending}
      defaultValues={data?.data}
    />
  );
};

export default UpdatePage;
