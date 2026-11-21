const server = import.meta.env.VITE_API_URL;

const getStreamUrl = (id) => {
  const baseUrl =
    import.meta.env.MODE === "production" ? "" : import.meta.env.VITE_FILE_URL;
  return id ? `${baseUrl}/api/stream/${id}` : "";
};

const getImageUrl = (path) => {
  const baseUrl =
    import.meta.env.MODE === "production" ? "" : import.meta.env.VITE_FILE_URL;

  return path ? `${baseUrl}/${path.replace(/\\/g, "/")}` : "";
};

const handleFormTab = (e) => {
  if (e.key === "Tab") {
    const form = e.currentTarget; // Use the form that triggered the event
    if (!form) {
      console.warn("Form element not found");
      return;
    }

    // Collect focusable elements within the form
    const focusable = Array.from(
      form.querySelectorAll(
        'input, select, textarea, button, [contenteditable="true"], [tabindex]:not([tabindex="-1"])',
      ),
    ).filter(
      (el) =>
        !el.disabled &&
        el.offsetParent !== null &&
        !el.closest(".ant-checkbox-disabled") &&
        !el.closest(".w-e-toolbar") && // Exclude WangEditor toolbar
        !el.classList.contains("ck-editor-wrapper"), // Exclude ck-editor-wrapper divs
    );

    const active = document.activeElement;
    const index = focusable.indexOf(active);
    if (index === -1) {
      console.warn("Active element not found in focusable list:", active);
      return; // Allow default browser behavior
    }

    const nextIndex = e.shiftKey ? index - 1 : index + 1;
    const nextElement = focusable[nextIndex];

    if (!nextElement) {
      console.warn("No next element found at index:", nextIndex);
      return; // Allow default browser behavior
    }

    e.preventDefault(); // Prevent default only if we have a valid next element

    // Handle CkEditor contenteditable
    if (nextElement.getAttribute("contenteditable") === "true") {
      nextElement.focus();
      return;
    }

    // Handle checkbox inputs
    if (nextElement.classList.contains("ant-checkbox-input")) {
      nextElement.focus();
      return;
    }

    // Normal focus for other elements
    nextElement.focus();
  }
};
export { getImageUrl, handleFormTab };
