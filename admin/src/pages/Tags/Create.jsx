import { useNavigate } from "react-router";
import TagForm from "./TagForm";
import { useCreateTag } from "./useTags";

export default function Create() {
  const navigate = useNavigate();
  const { mutate: createTag, isPending } = useCreateTag();

  const handleSubmit = (values) => {
    createTag(values, {
      onSuccess: () => {
        navigate("/tags");
      },
    });
  };

  const routes = [
    {
      name: "tags",
      title: "Tegler",
      path: "/tags",
      link: true,
    },
    {
      name: "create-tags",
      title: "Teg döretmek",
      link: false,
    },
  ];

  return (
    <TagForm
      routes={routes}
      name="Teg döretmek"
      type="create"
      handleSubmit={handleSubmit}
      isPending={isPending}
    />
  );
}
