import { defineStore } from "pinia";
import { Ref, ref} from "vue";

export const useUtilsStore = defineStore('utils', () => {
  const currentScrollYPosition: Ref<number> = ref(0);
  const isSidebarOpened: Ref<boolean> = ref(false);
  const forceGraph: Ref<boolean> = ref(false);

  return {
    currentScrollYPosition,
    isSidebarOpened,
    forceGraph
  };
  
});