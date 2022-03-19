export const saveToClipboard = (txt: string, successMsg: string = 'Text has been copied.') => {
  navigator.clipboard.writeText(txt).then(() => alert(successMsg));
};
