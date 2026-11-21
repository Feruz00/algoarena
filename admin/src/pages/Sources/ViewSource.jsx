import {
  Alert,
  Button,
  Divider,
  Drawer,
  Empty,
  Spin,
  Tag,
  Typography,
} from "antd";
import {
  CloseOutlined,
  EditOutlined,
  GlobalOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { useGetSource } from "./useSources";
import { HtmlParser } from "../../ui/HtmlParser";

const { Title, Text } = Typography;

const ViewSource = ({ id, handleClose }) => {
  const [visible, setVisible] = useState(false);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      setVisible(true);
    } else {
      setVisible(false);

      queryClient.removeQueries({
        queryKey: ["source"],
      });
    }
  }, [id, queryClient]);

  const { isLoading, isError, data, error } = useGetSource(id);

  const handleCloseDrawer = () => {
    setVisible(false);
    handleClose?.();
  };

  const source = data?.data;

  return (
    <Drawer
      title={
        <div className="flex items-center justify-between pr-2">
          <div className="flex items-center gap-2">
            <GlobalOutlined />
            <span>Çeşme barada maglumat</span>
          </div>

          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              handleClose?.();
              navigate(`/sources/${id}/edit`);
            }}
          >
            Üýtget
          </Button>
        </div>
      }
      placement="right"
      width={650}
      open={visible}
      onClose={handleCloseDrawer}
      closeIcon={<CloseOutlined />}
      destroyOnClose
    >
      {isLoading && (
        <div className="flex min-h-75 items-center justify-center">
          <Spin size="large" />
        </div>
      )}

      {isError && (
        <Alert
          type="error"
          showIcon
          message="Maglumat ýüklenmedi"
          description={error?.message || "Näbelli ýalňyşlyk boldy."}
        />
      )}

      {!isLoading && !isError && !source && (
        <Empty description="Maglumat tapylmady" />
      )}

      {!isLoading && !isError && source && (
        <div className="flex flex-col">
          {/* TITLE */}

          <div className="mb-5">
            <Text type="secondary" className="text-xs">
              ID: {source.id}
            </Text>

            <Title level={4} className="mb-2!">
              {source.titleTm}
            </Title>

            <div className="flex flex-wrap gap-2">
              {source.titleEn && <Tag>EN: {source.titleEn}</Tag>}

              {source.titleRu && <Tag>RU: {source.titleRu}</Tag>}
            </div>
          </div>

          <Divider />

          {/* ENGLISH */}

          <TheorySection
            language="English"
            label="EN"
            content={source.theoryEn}
          />

          {/* TURKMEN */}

          <TheorySection
            language="Türkmen"
            label="TM"
            content={source.theoryTm}
          />

          {/* RUSSIAN */}

          <TheorySection
            language="Русский"
            label="RU"
            content={source.theoryRu}
          />
        </div>
      )}
    </Drawer>
  );
};

const TheorySection = ({ language, label, content }) => {
  const [expanded, setExpanded] = useState(false);

  if (!content) {
    return null;
  }

  return (
    <div className="mb-6">
      {/* HEADER */}

      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag>{label}</Tag>

          <Text strong>{language}</Text>
        </div>

        <Button
          type="text"
          size="small"
          icon={<MoreOutlined />}
          onClick={() => setExpanded((prev) => !prev)}
        />
      </div>

      {/* CONTENT */}

      <div
        className={[
          "rounded-lg bg-gray-50 px-4 py-3 text-sm",
          "leading-6",
          "overflow-hidden",
          "transition-all duration-200",
          expanded ? "" : "max-h-24",
        ].join(" ")}
      >
        <HtmlParser
          htmlString={content}
          className="
            break-words
            [&_p]:mb-2
            [&_p:last-child]:mb-0
            [&_ul]:mb-2
            [&_ol]:mb-2
            [&_ul]:pl-5
            [&_ol]:pl-5
            [&_li]:mb-1
            [&_strong]:font-semibold
            [&_table]:w-full
            [&_table]:border-collapse
            [&_th]:border
            [&_th]:border-gray-300
            [&_th]:p-2
            [&_td]:border
            [&_td]:border-gray-300
            [&_td]:p-2
            [&_img]:max-w-full
            [&_img]:h-auto
          "
        />
      </div>

      {/* HIDE BUTTON */}

      {expanded && (
        <div className="mt-1 text-right">
          <Button type="link" size="small" onClick={() => setExpanded(false)}>
            Gizle
          </Button>
        </div>
      )}
    </div>
  );
};

export default ViewSource;
