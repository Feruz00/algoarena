import React, { useEffect } from "react";
import UserForm from "./UserForm";
import { useCreateUser } from "./useUsers";
import { useGetRoles } from "../Roles/useRoles";
import { useNavigate } from "react-router";
import Loading from "../../components/Loading";
import ErrorPage from "../../components/ErrorPage";
import { useGetGroups } from "../Groups/useGroups";

const CreatePage = () => {
  const { isPending, mutate: createUser } = useCreateUser();
  const { isLoading, isError, error, data, isSuccess } = useGetRoles();
  const {
    isLoading: isLoadingGroups,
    isError: isErrorGroups,
    error: errorGroup,
    data: groups,
  } = useGetGroups();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Ulanyjy döretmek | Judge";
  }, []);

  const handleSubmit = (values) => {
    const { groups, ...others } = values;
    if (groups) {
      const ids = groups?.map((row) => row.id);
      values.groups = ids;
    } else {
      values.groups = [];
    }

    // console.log(values);
    createUser(values, {
      onSuccess: () => {
        navigate(-1);
      },
    });
  };

  const routes = [
    {
      name: "users",
      title: "Ulanyjylar",
      path: "/users",
      link: true,
    },
    {
      name: "create-user",
      title: "Ulanyjy döretmek",
      link: false,
    },
  ];

  if (isLoading || isLoadingGroups) {
    return <Loading />;
  }

  if (isError || isErrorGroups) {
    return <ErrorPage error={error || errorGroup} />;
  }

  return (
    <UserForm
      routes={routes}
      name="Ulanyjy döretmek"
      type="create"
      handleSubmit={handleSubmit}
      isPending={isPending}
      groups={groups}
      roles={data}
    />
  );
};

export default CreatePage;
