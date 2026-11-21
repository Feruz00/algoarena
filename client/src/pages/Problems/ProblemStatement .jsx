import React from "react";
import { HtmlParser } from "../../ui/HtmlParser";
import { getDataByLanguage } from "../../utils/functions";
import { useTranslation } from "react-i18next";
import { useOutletContext } from "react-router";

const ProblemStatement = () => {
  const { t, i18n } = useTranslation();
  const { data } = useOutletContext();

  return (
    <div className="problem-content max-w-4xl">
      <h3>{t("problem.description")}</h3>
      <HtmlParser
        htmlString={getDataByLanguage(data.data, "description", i18n.language)}
      />
      <h3>{t("problem.input")}</h3>
      <HtmlParser
        htmlString={getDataByLanguage(
          data.data,
          "inputDescription",
          i18n.language,
        )}
      />

      <h3>{t("problem.output")}</h3>
      <HtmlParser
        htmlString={getDataByLanguage(
          data.data,
          "outputDescription",
          i18n.language,
        )}
      />

      <h3>{t("problem.examples")}</h3>
      {data.data.tests.map((row) => (
        <div className="grid gap-4 md:grid-cols-2 mb-2" key={row.id}>
          <div
            className="overflow-hidden rounded-lg border border-slate-200"
            key={row.id}
          >
            <div className="bg-slate-200 px-4 py-2 text-sm font-semibold">
              {t("problem.sampleInput")}
            </div>
            <pre className="m-0 whitespace-pre-wrap p-4 text-sm">
              {row.input}
            </pre>
          </div>
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <div className="bg-slate-200 px-4 py-2 text-sm font-semibold">
              {t("problem.sampleOutput")}
            </div>
            <pre className="m-0 whitespace-pre-wrap p-4 text-sm">
              {row.expectedOutput}
            </pre>
          </div>
        </div>
      ))}

      <HtmlParser
        htmlString={getDataByLanguage(data.data, "note", i18n.language)}
      />
    </div>
  );
};

export default ProblemStatement;
