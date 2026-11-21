import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Card,
  Input,
  Select,
  Space,
  Tag,
  Typography,
  Upload,
  message,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  SendOutlined,
  StarOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { problems, starterCode } from "../../data/mockData";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useSendSubmission } from "../../pages/Submissions/useSubmissions";
import { useLocation, useNavigate, useParams } from "react-router";
import { useGetProblem } from "../../pages/Problems/useProblems";
import Loading from "../Loading";

const { Text, Title } = Typography;

const languages = [
  { value: "cpp", label: "C++" },

  { value: "cpp14", label: "C++14" },
  { value: "cpp17", label: "C++17" },
  { value: "cpp20", label: "C++20" },
  { value: "cpp23", label: "C++23" },

  { value: "python3", label: "Python 3" },
  { value: "pascal", label: "Free Pascal" },
  { value: "go", label: "Golang" },
  { value: "java11", label: "Java 11" },
  { value: "java17", label: "Java 17  " },
  { value: "java21", label: "Java 21" },
];

const fileExt = ["go", "cpp", "pas", "py", "js", "java"];

export default function ProblemAside({}) {
  const { t } = useTranslation();
  // const queryClient = useQueryClient();
  // const problem = queryClient.getQueryData(["problem", problemId]);
  const { id, problemId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isContestRoute = location.pathname.startsWith("/contests/");
  const isSourceRoute = location.pathname.startsWith("/sources/");

  const queryKey = useMemo(
    () => ({
      sourceId: isSourceRoute ? id : undefined,
      contestId: isContestRoute ? id : undefined,
    }),
    [],
  );
  // console.log(queryKey);
  const {
    isLoading,
    data: problem,
    error,
    isError,
    isSuccess,
  } = useGetProblem(problemId, queryKey);
  const { mutate, isPending } = useSendSubmission();
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState(starterCode.cpp);
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState(null);

  const [fileList, setFileList] = useState([]); // control the upload list

  const beforeUpload = (file) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    const isFile = fileExt.includes(ext);

    if (!isFile) {
      toast.error("You can only upload programming file!");
      return Upload.LIST_IGNORE;
    }
    return isFile;
  };

  const customUpload = async (options) => {
    const { file, onSuccess, onError } = options;

    setFile(file);
    setFileList([file]);
    // console.log(file);
    try {
      onSuccess(file);
    } catch (error) {
      console.error("Upload failed:", error);
      onError(error);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setFileList([]);
  };

  const changeLanguage = (value) => {
    setLanguage(value);
    // setCode(starterCode[value]);
  };

  const submit = () => {
    const formData = new FormData();
    formData.append("file", file);

    formData.append("language", language);
    formData.append("problemId", problemId);

    if (isContestRoute && id) {
      formData.append("contestId", id);
    }

    if (isSourceRoute && id) {
      formData.append("sourceId", id);
    }
    mutate(formData, {
      onSuccess: () => {
        if (isContestRoute) {
          navigate(`/contests/${id}/problems/${problemId}/submissions`);
        } else if (isSourceRoute) {
          navigate(`/sources/${id}/problems/${problemId}/submissions`);
        } else {
          navigate(`/problems/${problemId}/submissions`);
        }
      },
    });
  };

  if (isLoading) return <Loading />;
  if (isError) return null;
  if (isSuccess)
    return (
      <div className="space-y-4">
        <Card className="rounded-xl!" title={t("problem.information")}>
          <div className="space-y-4">
            <div className="flex justify-between gap-3">
              <Text type="secondary">ID</Text>
              <Text strong>{problem?.data?.id}</Text>
            </div>
            {/* <div className="flex justify-between gap-3">
            <Text type="secondary">
              <StarOutlined /> {t("problem.points")}
            </Text>
            <Text strong>{problem.points}</Text>
          </div> */}
            <div className="flex justify-between gap-3">
              <Text type="secondary">
                <ClockCircleOutlined /> {t("problem.timeLimit")}
              </Text>
              <Text strong>{problem?.data?.timeLimitMs} ms</Text>
            </div>
            <div className="flex justify-between gap-3">
              <Text type="secondary">
                <DatabaseOutlined /> {t("problem.memoryLimit")}
              </Text>
              <Text strong>{problem?.data?.memoryLimitMb} mb</Text>
            </div>
          </div>
        </Card>
        {problem?.data?.canSubmission && (
          <Card className="rounded-xl! mt-3!">
            <Title level={5} className="mb-4!">
              {t("problem.submit")}
            </Title>
            <Text type="secondary">{t("problem.language")}</Text>
            <Select
              className="mt-2! w-full!"
              value={language}
              onChange={changeLanguage}
              options={languages}
            />

            <div className="w-full mt-2 flex items-start  gap-2">
              <p>{t("problem.selectFile")}</p>
              <Upload
                beforeUpload={beforeUpload}
                customRequest={customUpload}
                fileList={fileList} // controlled list
                onRemove={handleRemove} // clear when user removes
                maxCount={1} // only allow 1 file
                accept={fileExt.map((e) => `.${e}`).join(",")}
              >
                <Button icon={<UploadOutlined />} />
              </Upload>
            </div>

            <Space className="mt-3! flex! w-full!" size={8}>
              <Button
                type="primary"
                loading={submitting}
                icon={<SendOutlined />}
                className="flex-1!"
                onClick={submit}
                disabled={!language || !file || isPending}
              >
                {t("problem.submitButton")}
              </Button>
            </Space>
          </Card>
        )}
        {/* <Card className="!rounded-xl" title={t("problem.related")}>
        <div className="space-y-3">
          {problems
            .filter((p) => p.id !== problem.id)
            .slice(0, 3)
            .map((p) => (
              <a
                key={p.id}
                href={`/problems/${p.id}`}
                className="flex justify-between gap-2 border-b border-slate-100 pb-3 text-sm last:border-0 last:pb-0"
              >
                <span>
                  <Text type="secondary">{p.id}.</Text> {p.title}
                </span>
                <Text type="secondary">{p.points} pts</Text>
              </a>
            ))}
        </div>
      </Card> */}
      </div>
    );
}
