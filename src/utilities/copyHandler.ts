export const handleCopy = (text: string, func: () => void) => {
  let textarea = document.createElement("textarea");
  textarea.style.position = "fixed";
  textarea.style.left = "0";
  textarea.style.top = "0";

  textarea.style.height = "2em";
  textarea.style.width = "2em";
  textarea.style.padding = "0";
  textarea.style.border = "none";
  textarea.style.outline = "none";
  textarea.style.boxShadow = "none";
  textarea.style.background = "transparent";
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    let copied = document.execCommand("copy");
    if (copied) {
      func();
    }
  } catch {}
  document.body.removeChild(textarea);
};
