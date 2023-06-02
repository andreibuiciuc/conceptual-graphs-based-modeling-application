import { defineStore } from "pinia";
import { Ref, ref, nextTick} from "vue";

export const useUtilsStore = defineStore('utils', () => {

  const currentScrollYPosition: Ref<number> = ref(0);
  const isSidebarOpened: Ref<boolean> = ref(false);
  const forceGraph: Ref<boolean> = ref(false);
  const isLoginInModal: Ref<boolean> = ref(false);

  const homepageElement: Ref<HTMLElement | null> = ref(null);
  const summaryCardElement: Ref<HTMLElement | null> = ref(null);
  const summaryCardElementYPosition: Ref<number> = ref(0);

  function handleScrollEventOnHomeview (): void {
    if (homepageElement.value) {
      currentScrollYPosition.value = homepageElement.value.scrollTop;
      if (currentScrollYPosition.value >= summaryCardElementYPosition.value - 2 * window.innerHeight / 4) {
        summaryCardElement.value?.classList.add('summary-card-fade-in');
      }
    } else {
      currentScrollYPosition.value = 0;
    }
  }

  function initializeSummaryCardEvent (): void {
    homepageElement.value = document.getElementById('homepage');
    if (homepageElement.value) {
      homepageElement.value.addEventListener('scroll', handleScrollEventOnHomeview);
      summaryCardElement.value = document.getElementById('summary-card');
      if (summaryCardElement.value) {
        summaryCardElementYPosition.value = homepageElement.value.scrollTop + summaryCardElement.value.getBoundingClientRect().top;
      }
    }
  }

  return {
    currentScrollYPosition,
    isSidebarOpened,
    forceGraph,
    isLoginInModal,
    homepageElement,
    summaryCardElement,
    summaryCardElementYPosition,
    initializeSummaryCardEvent,
  };
  
});