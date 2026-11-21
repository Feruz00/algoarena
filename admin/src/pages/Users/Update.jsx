import React, { useEffect } from "react";
import UserForm from "./UserForm";
import { useGetUser, useUpdateUser } from "./useUsers";
import { useGetRoles } from "../Roles/useRoles";
import { useNavigate, useParams } from "react-router";
import Loading from "../../components/Loading";
import ErrorPage from "../../components/ErrorPage";
import { useGetGroups } from "../Groups/useGroups";

const Update = () => {
  const { id } = useParams();
  const { isPending, mutate: updateUser } = useUpdateUser();
  const {
    isLoading: isLoadingUser,
    data: user,
    isError: isErrorUser,
    error: errorUser,
  } = useGetUser(id);
  const { isLoading, isError, error, data, isSuccess } = useGetRoles();
  const {
    isLoading: isLoadingGroups,
    isError: isErrorGroups,
    error: errorGroup,
    data: groups,
  } = useGetGroups();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Ulanyjynyň maglumatlaryny üýtgetmek | Judge";
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
    updateUser(
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
      name: "users",
      title: "Ulanyjylar",
      path: "/users",
      link: true,
    },
    {
      name: "update-user",
      title: "Maglumatlary üýtgetmek",
      link: false,
    },
  ];

  if (isLoading || isLoadingGroups || isErrorUser) {
    return <Loading />;
  }

  if (isError || isErrorGroups || isErrorUser) {
    return <ErrorPage error={error || errorGroup || errorUser} />;
  }

  return (
    <UserForm
      routes={routes}
      name="Ulanyjy döretmek"
      type="update"
      defaultValues={user}
      handleSubmit={handleSubmit}
      isPending={isPending}
      groups={groups}
      roles={data}
    />
  );
};

export default Update;
useUpdateUser;
