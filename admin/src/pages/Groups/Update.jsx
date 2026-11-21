import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useGetGroup, useUpdateGroup } from "./useGroups";
import GroupForm from "./GroupForm";
import Loading from "../../components/Loading";
import ErrorPage from "../../components/ErrorPage";

const UpdateGroup = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { isLoading, data, isError, error } = useGetGroup(id);
  const { isPending, mutate: updateGroup } = useUpdateGroup();

  useEffect(() => {
    document.title = "Toparyň maglumatlaryny üýtgetmek | Judge";
  }, []);
  const handleSubmit = (values) => {
    updateGroup(
      { data: values, id },
      {
        onSuccess: () => {
          navigate(-1);
        },
      },
    );
  };

  const routes = [
    {
      name: "groups",
      title: "Toparlar",
      path: "/groups",
      link: true,
    },
    {
      name: "update-group",
      title: "Toparyň maglumatlaryny üýtgetmek",
      link: false,
    },
  ];
  if (isLoading) return <Loading />;
  if (isError) return <ErrorPage error={error} />;
  return (
    <GroupForm
      routes={routes}
      name="Maglumatlaryny üýtgetmek"
      type="update"
      handleSubmit={handleSubmit}
      isPending={isPending}
      defaultValues={data?.data}
    />
  );
};

export default UpdateGroup;
