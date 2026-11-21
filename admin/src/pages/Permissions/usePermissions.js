import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getPermissionsApi } from "./permissions";

const useGetPermissions = () => {
  return useQuery({
    queryKey: ["permissions"],
    queryFn: () => getPermissionsApi(),
  });
};

export { useGetPermissions };
