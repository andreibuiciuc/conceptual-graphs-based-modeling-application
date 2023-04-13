import { ToastSeverity } from "../types/types";
import { useToast } from "primevue/usetoast";

export function useUtils() {

  // Functions related to the clipboard
  const copyToClipboard = (text: string): void => {
    navigator.clipboard.writeText(text);
  };

  // Functions related to the notification toast
  const TOAST_LIFETIME = 3000;
  const toast = useToast();
  const openNotificationToast = (summary: string, severity: ToastSeverity, detail?: string): void => {
    toast.add({
      severity,
      summary,
      detail,
      life: TOAST_LIFETIME,
    });
  };

  return {
    copyToClipboard,
    openNotificationToast
  };
}
