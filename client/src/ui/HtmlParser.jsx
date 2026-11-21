import React from "react";
import DOMPurify from "dompurify";
import "@wangeditor/editor/dist/css/style.css";
import "katex/dist/katex.min.css";

const HtmlParser = ({ htmlString = "", className = "" }) => {
  if (!htmlString) {
    return null;
  }

  const sanitizedHtml = DOMPurify.sanitize(htmlString);

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{
        __html: sanitizedHtml,
      }}
    />
  );
};

export { HtmlParser };
