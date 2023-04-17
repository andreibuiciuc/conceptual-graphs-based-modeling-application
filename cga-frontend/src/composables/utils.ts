import { ToastSeverity } from "../types/types";
import { useToast } from "primevue/usetoast";

export function useUtils() {

  // Composables responsible for utility functions
  
  const TOAST_LIFETIME = 3000;
  const toast = useToast();

  const copyToClipboard = (text: string): void => {
    navigator.clipboard.writeText(text);
  };


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
