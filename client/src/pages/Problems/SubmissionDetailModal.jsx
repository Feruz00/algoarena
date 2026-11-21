import { Modal, Tag, Descriptions, Alert, Typography, Divider } from "antd";
import { useTranslation } from "react-i18next";

const { Text } = Typography;

const LANGUAGE_NAMES = {
  cpp14: "C++14",
  cpp17: "C++17",
  cpp20: "C++20",
  cpp23: "C++23",
  python3: "Python 3",
  pascal: "Free Pascal",
  go: "Go",
  java11: "Java 11",
  java17: "Java 17",
  java21: "Java 21",
};

function parseJudgingLog(log) {
  if (!log) return null;

  // Example: "1_1" means group 1, test 1.
  const match = String(log)
    .trim()
    .match(/^(\d+)_(\d+)$/);

  if (match) {
    return `Group ${match[1]}, Test ${match[2]}`;
  }

  return String(log);
}

export default function SubmissionDetailModal({ open, submission, onClose }) {
  const { t } = useTranslation();

  if (!submission) return null;

  const verdict = submission.verdict;
  const status = String(submission.status ?? "").toLowerCase();

  const log =
    submission.log ??
    submission.judgeLog ??
    submission.compileOutput ??
    submission.errorMessage ??
    submission.stderr ??
    "";

  const parsedLog = parseJudgingLog(log);

  const isCompileError = verdict === "CE" || status === "compiling";
  const isWrongAnswer = verdict === "WA";

  return (
    <Modal
      title={`Submission #${submission.id}`}
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      destroyOnHidden
    >
      <Descriptions bordered size="small" column={{ xs: 1, sm: 2, md: 3 }}>
        <Descriptions.Item label={t("common.verdict")}>
          <Tag color={verdict === "AC" ? "success" : "error"}>
            {verdict ?? status ?? "-"}
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item label={t("common.language")}>
          {LANGUAGE_NAMES[submission.lang] ?? submission.lang ?? "-"}
        </Descriptions.Item>

        <Descriptions.Item label="Time">
          {submission.timeMs != null ? `${submission.timeMs} ms` : "-"}
        </Descriptions.Item>

        <Descriptions.Item label="Memory">
          {submission.memoryKb != null
            ? `${(submission.memoryKb / 1024).toFixed(2)} Kb`
            : "-"}
        </Descriptions.Item>

        {(submission.testcase != null || submission.testgroup != null) && (
          <Descriptions.Item label="Failed test">
            Group {submission.testgroup ?? "-"}, Test{" "}
            {submission.testcase ?? "-"}
          </Descriptions.Item>
        )}
      </Descriptions>

      <Divider orientation="left">Source code</Divider>

      <pre className="max-h-[420px] overflow-auto rounded-lg bg-slate-950 p-4 text-sm leading-6 text-slate-100">
        <code>
          {submission.code ??
            submission.sourceCode ??
            "Source code is not available."}
        </code>
      </pre>

      <Divider orientation="left">Judging log</Divider>

      {isCompileError ? (
        <Alert
          type="error"
          showIcon
          message="Compilation Error"
          description={
            parsedLog || "No compiler output was provided by the judge."
          }
        />
      ) : isWrongAnswer ? (
        <Alert
          type="warning"
          showIcon
          message="Wrong Answer"
          description={
            parsedLog
              ? `Failed at ${parsedLog}`
              : "The submission received Wrong Answer."
          }
        />
      ) : parsedLog ? (
        <Alert
          type={verdict === "AC" ? "success" : "info"}
          showIcon
          message="Judge output"
          description={
            <pre className="m-0 whitespace-pre-wrap break-words">
              {parsedLog}
            </pre>
          }
        />
      ) : (
        <Text type="secondary">No judging log available.</Text>
      )}
    </Modal>
  );
}
