import React, { useEffect } from "react";
import { useCreateGroup } from "./useGroups";
import { useNavigate } from "react-router";
import GroupForm from "./GroupForm";

const CreateGroup = () => {
  const { isPending, mutate: createGroup } = useCreateGroup();

  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Topar döretmek | Judge";
  }, []);
  const handleSubmit = (values) => {
    createGroup(values, {
      onSuccess: () => {
        navigate(-1);
      },
    });
  };

  const routes = [
    {
      name: "groups",
      title: "Toparlar",
      path: "/groups",
      link: true,
    },
    {
      name: "create-group",
      title: "Topar döretmek",
      link: false,
    },
  ];
  return (
    <GroupForm
      routes={routes}
      name="Topar döretmek"
      type="create"
      handleSubmit={handleSubmit}
      isPending={isPending}
    />
  );
};

export default CreateGroup;
