import React, { useEffect } from "react";
import { useGetSource, useUpdateSource } from "./useSources";
import { useNavigate, useParams } from "react-router";
import SourceForm from "./SourceForm";
import Loading from "../../components/Loading";
import ErrorPage from "../../components/ErrorPage";

const UpdatePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoading, data, isError, error } = useGetSource(id);

  const { isPending, mutate: updateSource } = useUpdateSource();

  useEffect(() => {
    document.title = "Çeşmäniň maglumatlaryny üýtgetmek | Judge";
  }, []);

  const handleSubmit = (values) => {
    updateSource(
      { data: values, id },
      {
        onSuccess: () => {
          if (values.parentId) {
            navigate(`/sources/${values.parentId}`);
          } else {
            navigate(-1);
          }
        },
      },
    );
  };

  const routes = [
    {
      name: "sources",
      title: "Çeşmeler",
      path: "/sources",
      link: true,
    },
    {
      name: "update-source",
      title: "Çeşme üýtgetmek",
      link: false,
    },
  ];
  if (isLoading) return <Loading />;
  if (isError) return <ErrorPage error={error} />;

  return (
    <SourceForm
      routes={routes}
      name="Çeşme üýtgetmek"
      type="update"
      handleSubmit={handleSubmit}
      isPending={isPending}
      defaultValues={data?.data}
    />
  );
};

export default UpdatePage;
