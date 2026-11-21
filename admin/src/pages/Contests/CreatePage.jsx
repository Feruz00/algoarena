import React, { useEffect } from "react";
import { useCreateContest } from "./useContests";
import { useNavigate } from "react-router";
import ContestForm from "./ContestForm";

const CreatePage = () => {
  const { isPending, mutate: createContest } = useCreateContest();

  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Bäsleşik döretmek | Judge";
  }, []);

  const handleSubmit = (values) => {
    createContest(values, {
      onSuccess: () => {
        navigate(-1);
      },
    });
  };

  const routes = [
    {
      name: "contests",
      title: "Bäsleşikler",
      path: "/contests",
      link: true,
    },
    {
      name: "create-contest",
      title: "Bäsleşik döretmek",
      link: false,
    },
  ];

  return (
    <ContestForm
      routes={routes}
      name="Bäsleşik döretmek"
      type="create"
      handleSubmit={handleSubmit}
      isPending={isPending}
    />
  );
};

export default CreatePage;
