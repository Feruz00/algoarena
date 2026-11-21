import { Tag } from "antd";
import { useTranslation } from "react-i18next";

const colors = {
  // Verdicts
  AC: "success",
  WA: "error",
  PE: "warning",
  CE: "error",
  RE: "error",
  TLE: "warning",
  MLE: "warning",

  // Submission statuses
  queue: "processing",
  queued: "processing",
  compiling: "processing",
  running: "processing",
  finished: "default",

  // Other existing statuses
  accepted: "success",
  wrong: "error",
  pending: "processing",
  upcoming: "processing",
  scheduled: "processing",
  easy: "success",
  medium: "warning",
  hard: "error",
};

export default function StatusTag({ status, message }) {
  const { t } = useTranslation();

  const normalized = String(status ?? "").toLowerCase();
  const color = colors[status] ?? colors[normalized] ?? "default";
  const label =
    message ??
    t(`verdict.${status}`, {
      defaultValue: t(`problem.${normalized}`, {
        defaultValue: status ?? "-",
      }),
    });

  return <Tag color={color}>{label}</Tag>;
}
