import React, { useEffect, useMemo, useState } from "react";
import { useGetPermissions } from "../Permissions/usePermissions";
import Loading from "../../components/Loading";
import ErrorPage from "../../components/ErrorPage";
import Topbar from "../../components/TopBar";
import { Button, Checkbox, Form, Input } from "antd";
import classNames from "classnames";
import { useNavigate, useParams } from "react-router";
import { useUpdateRole, useGetRole } from "./useRoles";

const { Item } = Form;

const UpdateRole = () => {
  const { id } = useParams();
  const {
    isLoading: isLoadingRole,
    isError: isErrorRole,
    error: errorRole,
    data: role,
    isSuccess: isSuccessRole,
  } = useGetRole(id);
  const { isLoading, isError, error, data, isSuccess } = useGetPermissions();
  const { mutate: updateRole, isPending } = useUpdateRole();

  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  const subNames = [
    { name: "Ygtyýarlyklar", key: 1 },
    { name: "Ulanyjylar", key: 2 },
    { name: "Bäsleşikler", key: 3 },
    { name: "Meseleler", key: 4 },
    { name: "Çeşmeler", key: 5 },
    { name: "Toparlar", key: 6 },
    { name: "Test toparlary", key: 7 },
    { name: "Testler", key: 8 },

    { name: "Tegler", key: 9 },

    { name: "Baýleki sazlamalar", key: 10 },
  ];
  useEffect(() => {
    document.title = "Ýgtyýarlygyň maglumatlaryny sazlamak | Judge";
    form.setFieldsValue({
      label: "",
      maxCount: 15,
      time: 7,
      permissions: [],
    });
  }, []);

  useEffect(() => {
    if (isSuccessRole) {
      const dt = role.data;
      const permissionIds =
        dt.permissions?.map((permission) => permission.id) || [];

      form.setFieldsValue({
        label: dt.label || "",
        maxCount: dt.maxCount || 15,
        time: dt.time || 7,
        permissions: permissionIds,
      });
      setSelectedPermissions(permissionIds);
    }
  }, [isSuccessRole]);

  const newArr = useMemo(() => {
    if (!isSuccess) return [];

    const arr = [];

    arr.push({
      name: "Admin tarapa rugsat",
      type: "main",
      key: 1,
    });

    subNames.forEach((sub) => {
      arr.push({
        name: sub.name,
        type: "sub",
        key: sub.key,
      });

      data?.data?.forEach((permission) => {
        if (
          Number(permission.main) === 1 &&
          Number(permission.sub) === sub.key
        ) {
          arr.push({
            name: permission.label,
            type: "child",
            key: permission.id,
          });
        }
      });
    });

    // MAIN 2
    arr.push({
      name: "Ulanyjy tarapa rugsat",
      type: "main",
      key: 2,
    });

    data?.data?.forEach((permission) => {
      if (Number(permission.main) === 2) {
        arr.push({
          name: permission.label,
          type: "child",
          key: permission.id,
        });
      }
    });

    const lens = [18, 18, 16, 13];

    const groups = [[], [], [], []];

    let index = 0;

    lens.forEach((length, groupIndex) => {
      for (let i = 0; i < length; i++) {
        if (arr[index]) {
          groups[groupIndex].push(arr[index]);
        }

        index++;
      }
    });

    return groups;
  }, [data, isSuccess]);

  const keys = useMemo(() => {
    const sub = {};

    subNames.forEach((item) => {
      sub[item.key] = [];

      data?.data?.forEach((permission) => {
        if (
          Number(permission.main) === 1 &&
          Number(permission.sub) === item.key
        ) {
          sub[item.key].push(permission.id);
        }
      });
    });

    const main = {
      1: [],
      2: [],
    };

    data?.data?.forEach((permission) => {
      const mainKey = Number(permission.main);

      if (main[mainKey]) {
        main[mainKey].push(permission.id);
      }
    });

    return {
      sub,
      main,
    };
  }, [data]);

  const handleCheckboxChange = (checked, row) => {
    let ids = [];

    /*
     * Main
     */
    if (row.type === "main") {
      ids = keys.main[row.key] || [];
    }

    /*
     * Sub
     */
    if (row.type === "sub") {
      ids = keys.sub[row.key] || [];
    }

    /*
     * Child
     */
    if (row.type === "child") {
      ids = [row.key];
    }

    setSelectedPermissions((current) => {
      if (checked) {
        // Add
        return [...new Set([...current, ...ids])];
      }

      // Remove
      return current.filter((id) => !ids.includes(id));
    });
  };

  useEffect(() => {
    form.setFieldsValue({
      permissions: selectedPermissions,
    });
  }, [selectedPermissions, form]);

  const handleSubmit = (values) => {
    updateRole(
      { data: values, id },
      {
        onSuccess: () => {
          navigate(-1);
        },
      },
    );
  };

  const Group = () => {
    return newArr.map((group, index) => (
      <div className="flex flex-col gap-2" key={index}>
        {group.map((row) => {
          let ids = [];

          if (row.type === "main") {
            ids = keys.main[row.key] || [];
          }

          if (row.type === "sub") {
            ids = keys.sub[row.key] || [];
          }

          if (row.type === "child") {
            ids = [row.key];
          }

          const checked =
            ids.length > 0 &&
            ids.every((id) => selectedPermissions.includes(id));

          const indeterminate =
            ids.length > 0 &&
            ids.some((id) => selectedPermissions.includes(id)) &&
            !checked;

          return (
            <div
              key={`${row.type}-${row.key}`}
              className={classNames(
                row.type === "main" && "font-semibold",

                row.type === "sub" && "ml-2 font-semibold",

                row.type === "child" && "ml-4",
              )}
            >
              <Checkbox
                checked={checked}
                indeterminate={row.type !== "child" ? indeterminate : false}
                onChange={(e) => handleCheckboxChange(e.target.checked, row)}
              >
                {row.name}
              </Checkbox>
            </div>
          );
        })}
      </div>
    ));
  };

  if (isLoading || isLoadingRole) {
    return <Loading />;
  }

  if (isError || isErrorRole) {
    return <ErrorPage error={error || errorRole} />;
  }

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto">
      <Topbar
        name="Ygtyýarlygyň maglumatlaryny üýtgetmek"
        routes={[
          {
            name: "roles",
            title: "Ygtyýarlyklar",
            path: "/roles",
            link: true,
          },
          {
            name: "update-role",
            title: "Ygtyýarlygyň maglumatlaryny üýtgetmek",
            link: false,
          },
        ]}
      />

      <div className="bg-white py-4 px-6 rounded-lg shadow-md mt-3 ">
        <Form
          form={form}
          autoComplete="off"
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Item
            label="Atlandyryşy"
            name="label"
            rules={[
              { required: true, message: "Atlandyryşy giriziň!" },
              { min: 3, message: "Atlandyryş 3 harpdan az bolmaly däl!" },
            ]}
          >
            <Input />
          </Item>
          <Item label="Rugsatlar">
            <div className="grid grid-cols-4">
              <Group />
            </div>
          </Item>

          <Item name="permissions" hidden>
            <input />
          </Item>
          <Item
            label="Synanyşma wagty"
            className="w-1/3"
            name="time"
            rules={[{ required: true, message: "Synanyşma wagty giriziň!" }]}
          >
            <Input type="number" min={1} suffix="san" />
          </Item>
          <Item
            label="Synanyşma dowamlylygy"
            className="w-1/3"
            name="maxCount"
            rules={[
              { required: true, message: "Synanyşma dowamlygy giriziň!" },
            ]}
          >
            <Input type="number" min={1} suffix="minut" />
          </Item>

          <Item wrapperCol={{ span: 24, offset: 0 }}>
            <div className="flex flex-row gap-4">
              <Button
                type="primary"
                htmlType="submit"
                className="focus:ring-2 focus:ring-blue-500"
                loading={isLoading || isPending}
                disabled={isLoading || isPending}
              >
                Submit
              </Button>
              <Button
                className="ml-3"
                type="default"
                htmlType="button"
                onClick={() => navigate(-1)}
                loading={isLoading || isPending}
                disabled={isLoading || isPending}
              >
                Cancel
              </Button>
            </div>
          </Item>
        </Form>
      </div>
    </div>
  );
};

export default UpdateRole;
