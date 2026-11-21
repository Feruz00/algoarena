import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { useCreateSource } from "./useSources";
import SourceForm from "./SourceForm";

const CreatePage = () => {
  const { isPending, mutate: createSource } = useCreateSource();

  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Çeşme döretmek | Judge";
  }, []);

  const handleSubmit = (values) => {
    createSource(values, {
      onSuccess: () => {
        if (values.parentId) {
          navigate(`/sources/${values.parentId}`);
        } else {
          navigate(-1);
        }
      },
    });
  };

  const routes = [
    {
      name: "sources",
      title: "Çeşmeler",
      path: "/sources",
      link: true,
    },
    {
      name: "create-source",
      title: "Çeşme döretmek",
      link: false,
    },
  ];

  return (
    <SourceForm
      routes={routes}
      name="Çeşme döretmek"
      type="create"
      handleSubmit={handleSubmit}
      isPending={isPending}
    />
  );
};

export default CreatePage;
