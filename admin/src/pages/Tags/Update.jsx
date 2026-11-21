import { Alert, Button, Spin } from "antd";
import { useNavigate, useParams } from "react-router";

import TagForm from "./TagForm";
import { useGetTag, useUpdateTag } from "./useTags";

export default function Update() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: response, isPending, isError, error, refetch } = useGetTag(id);

  const { mutate: updateTag, isPending: isUpdating } = useUpdateTag();

  // getTagApi returns res.data, and the backend response is { data: tag }.
  const tag = response?.data;

  const handleSubmit = (values) => {
    updateTag(
      { id, data: values },
      {
        onSuccess: () => {
          navigate("/tags");
        },
      },
    );
  };

  if (isPending) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Spin size="large" tip="Tagyň maglumatlary ýüklenýär..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 sm:p-6">
        <Alert
          type="error"
          showIcon
          message="Tagyň maglumatlaryny ýükläp bolmady"
          description={
            typeof error === "string"
              ? error
              : error?.message || "Serwerde näsazlyk bar"
          }
          action={<Button onClick={() => refetch()}>Gaýtadan synanyş</Button>}
        />
      </div>
    );
  }

  if (!tag) {
    return (
      <div className="p-4 sm:p-6">
        <Alert
          type="warning"
          showIcon
          message="Tag tapylmady"
          description="Bu ID bilen degişli tag tapylmady."
          action={
            <Button onClick={() => navigate("/tags")}>
              Taglaryň sanawyna dolan
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <TagForm
      routes={[{ title: "Taglar", path: "/tags" }, { title: "Tagy üýtgetmek" }]}
      name="Taglar"
      type="update"
      initialValues={{
        titleTm: tag.titleTm || "",
        titleEn: tag.titleEn || "",
        titleRu: tag.titleRu || "",
      }}
      handleSubmit={handleSubmit}
      isPending={isUpdating}
    />
  );
}
