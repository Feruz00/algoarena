import React, { useEffect, useRef } from "react";
import { Editor, Toolbar } from "@wangeditor/editor-for-react";
import { Boot, i18nChangeLanguage } from "@wangeditor/editor";
import formulaModuleImport from "@wangeditor/plugin-formula";

const formulaModule = formulaModuleImport.default ?? formulaModuleImport;

// console.log("Formula module to register:", formulaModule);

Boot.registerModule(formulaModule);
import "@wangeditor/editor/dist/css/style.css";
import "katex/dist/katex.min.css";

import classNames from "classnames";
import { createFile } from "../pages/Files/filesApi";
import { getImageUrl } from "../utils/functions";

const RichEditor = ({
  value = "",
  onChange,
  disabled = false,
  className,
  type = "default",
}) => {
  const editorRef = useRef(null);

  const mode = "default";

  const toolbarConfig = {
    excludeKeys: [
      "headerSelect",
      "fontFamily",
      "insertVideo",
      "uploadVideo",
      "group-video",
      "emotion",
      "fullScreen",
      "todo",
      "divider",
    ],

    // Add the formula button at the beginning of the toolbar.
    insertKeys: {
      index: 999,
      keys: ["insertFormula"],
    },
  };

  const editorConfig = {
    placeholder: "Type here...",
    lang: "en",
    autoFocus: false,

    // Keep Word formatting.
    pasteFilterStyle: false,

    // Allow pasted images.
    pasteIgnoreImg: false,

    // Allow editing an existing formula.
    hoverbarKeys: {
      formula: {
        menuKeys: ["editFormula"],
      },
      text: {
        menuKeys: [
          "headerSelect",
          "bold",
          "italic",
          "underline",
          "through",
          "color",
          "bgColor",
          "fontSize",
          "bulletedList",
          "numberedList",
          "insertLink",
          "insertFormula",
        ],
      },
    },

    MENU_CONF: {
      table: {
        defaultStyle: `
          table {
            width: 100%;
            border-collapse: collapse;
          }

          th,
          td {
            max-width: 150px;
            word-break: break-word;
            white-space: normal;
            padding: 8px;
            border: 1px solid #ccc;
          }
        `,
      },

      uploadImage: {
        maxFileSize: 100 * 1024 * 1024,

        async customUpload(file, insertFn) {
          const formData = new FormData();
          formData.append("file", file);

          try {
            const res = await createFile(formData);
            const url = getImageUrl(res.path);

            insertFn(url, "uploaded image", "");
          } catch (error) {
            console.error("Upload failed:", error);
          }
        },
      },
    },
  };

  useEffect(() => {
    i18nChangeLanguage("en");

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, []);

  const handleCreated = (editor) => {
    editorRef.current = editor;

    setTimeout(() => {
      const editable = editor
        .getEditableContainer()
        ?.querySelector('[contenteditable="true"]');

      if (editable) {
        editable.setAttribute("tabindex", "0");
        editable.setAttribute("aria-label", "Rich text editor");
      }
    }, 0);
  };

  const handleChange = (editor) => {
    const html = editor.getHtml();
    onChange?.(html);
  };

  const handleDestroyed = (editor) => {
    if (editorRef.current === editor) {
      editorRef.current = null;
    }
  };

  const customAlert = (info, type) => {
    console.log(type, info);
  };

  const customPaste = (editor, event, callback) => {
    const html = event.clipboardData?.getData("text/html");

    if (!html) {
      callback(true);
      return;
    }

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    tempDiv.querySelectorAll("p, div").forEach((el) => {
      const text = el.textContent.replace(/\u00A0/g, "").trim();

      if (!text && el.children.length === 0) {
        el.remove();
      }
    });

    const cleanedHtml = tempDiv.innerHTML
      .replace(/<p>(&nbsp;|\s)*<\/p>/gi, "")
      .replace(/<br>\s*<br>/gi, "<br>")
      .replace(/\r?\n|\r/g, " ");

    editor.dangerouslyInsertHtml(cleanedHtml);

    event.preventDefault();
    callback(false);
  };

  return (
    <div className={classNames("relative w-full", className)}>
      <div className="overflow-hidden rounded border border-gray-300">
        {/* <Toolbar
          editor={editorRef.current}
          defaultConfig={toolbarConfig}
          mode={mode}
        /> */}
        {type === "default" && (
          <Toolbar
            editor={editorRef.current}
            defaultConfig={toolbarConfig}
            mode={mode}
          />
        )}
        <Editor
          defaultConfig={editorConfig}
          value={value || ""}
          mode={mode}
          onCreated={handleCreated}
          onChange={handleChange}
          onDestroyed={handleDestroyed}
          customAlert={customAlert}
          customPaste={customPaste}
          style={{
            height: "300px",
            overflowY: "hidden",
            wordBreak: "break-word",
          }}
        />
      </div>

      {disabled && (
        <div
          className="absolute inset-0 z-10 bg-gray-300 opacity-25"
          style={{ cursor: "not-allowed" }}
        />
      )}
    </div>
  );
};

export default RichEditor;
