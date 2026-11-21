import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { useCreateProblem } from "./hooks/useProblems";
import ProblemForm from "./ProblemForm";

const CreatePage = () => {
  const navigate = useNavigate();
  const { isPending, mutate: createProblem } = useCreateProblem();

  useEffect(() => {
    document.title = "Mesele döretmek | Judge";
  }, []);

  const handleSubmit = (values) => {
    createProblem(values, {
      onSuccess: () => {
        navigate("/problems");
      },
    });
  };

  const routes = [
    {
      name: "problems",
      title: "Meseleler",
      path: "/problems",
      link: true,
    },
    {
      name: "create-problem",
      title: "Mesele döretmek",
      link: false,
    },
  ];

  return (
    <ProblemForm
      routes={routes}
      name="Mesele döretmek"
      type="create"
      handleSubmit={handleSubmit}
      isPending={isPending}
    />
  );
};

export default CreatePage;
