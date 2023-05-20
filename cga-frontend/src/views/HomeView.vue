<template>
  <div class="homepage" id="homepage" v-if="!isUserLoggedIn">
    
    <LandingSection
      :title-tokens="[ 'conceptual', 'graphs', 'application']"
      subtitle="interface for modeling and querying cassandra databases based on the simplicity of"
      trailing-subtitle-token="conceptual graphs"
    />
    
    <SummarySection
      summary-title="connect and start exploring"
      summary-subtitle="databases in a different way"
      :summary-actions="['connect with astra cloud db', 'visualize and create data structures', 'query your database in real time']"
      summary-label="cassandra"
      summary-label-link="https://cassandra.apache.org"
    />

    <StepsSection />
    
    <HomepageSection id="auth">
      <template #section-content>
        <div class="landing-animation-wrapper">
          <div class="landing-animated-oval"></div>
          <div class="landing-animated-oval"></div>
          <div class="landing-animated-oval"></div>
        </div>
        <AuthenticationCard :is-password-reset-visible="true" />
      </template>
    </HomepageSection>

    <ScrollTop target="parent" :threshold="500" />
  </div>

  <div v-else>
    <div class="console-section">
      <div class="header-container">
        <Button 
          outlined 
          severity="primary" 
          label="connect"
          icon="pi pi-angle-right"
          :class="!forceGraph && cassandraServerCredentials.isCassandraServerConnected && currentKeyspace  ? 'animated-button' : null" 
          @click="isSidebarOpened = true" 
        />
        <Transition name="pop-in" mode="out-in">
          <Tag v-if="forceGraph && cassandraServerCredentials.isCassandraServerConnected && currentKeyspace"
            icon="pi pi-check"
            severity="success"
            value="force graph is the recommended representation of higher volume keyspaces"
          />
          <Tag 
            v-else-if="cassandraServerCredentials.isCassandraServerConnected && currentKeyspace"
            icon="pi pi-exclamation-triangle"
            severity="warning"
            value="it is recommended to use the force graph representation for higher volume keyspaces"
          />
        </Transition>
      </div>
      <ConnectionDashboard />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Ref, ref } from '@vue/reactivity';
import { storeToRefs } from 'pinia';

import AuthenticationCard from '../components/authentication/AuthenticationCard.vue';
import ConnectionDashboard from '../components/dashboard/ConnectionDashboard.vue';
import HomepageSection from '@/components/graphic/sections/HomepageSection.vue';
import LandingSection from '@/components/graphic/sections/LandingSection.vue';
import SummarySection from '@/components/graphic/sections/SummarySection.vue';


import { useUtilsStore } from '../stores/utils';
import { useUserStore } from '../stores/user';
import { useConnectionStore } from '../stores/connection';
import StepsSection from '@/components/graphic/sections/StepsSection.vue';


// Store state mappings
const userStore = useUserStore();
const utilsStore = useUtilsStore();

const { isUserLoggedIn } = storeToRefs(userStore);
const { currentScrollYPosition, isSidebarOpened, forceGraph } = storeToRefs(utilsStore);

// Store mappings
const connectionStore = useConnectionStore();
const { currentKeyspace, cassandraServerCredentials } = storeToRefs(connectionStore);

const homepageElement: Ref<HTMLElement | null> = ref(null);
const summaryCardElement: Ref<HTMLElement | null> = ref(null);
const summaryCardElementYPosition: Ref<number> = ref(0);

const handleScrollEvent = (): void => {
  if (homepageElement.value) {
    currentScrollYPosition.value = homepageElement.value.scrollTop;
    if (currentScrollYPosition.value >= summaryCardElementYPosition.value - 2 * window.innerHeight / 4) {
      summaryCardElement.value?.classList.add('summary-card-fade-in');
    }
  } else {
    currentScrollYPosition.value = 0;
  }
}

onMounted(() => {
  homepageElement.value = document.getElementById('homepage');
  if (homepageElement.value) {
    homepageElement.value.addEventListener('scroll', handleScrollEvent);
    summaryCardElement.value = document.getElementById('summary-card');
    if (summaryCardElement.value) {
      summaryCardElementYPosition.value = homepageElement.value.scrollTop + summaryCardElement.value.getBoundingClientRect().top;
    }
  }
});

</script>

<style lang="sass">
@use "@/assets/styles/_variables.sass"
@use "@/assets/styles/_containers.sass"
@use "@/assets/styles/_transitions.sass"

.homepage
  overflow-y: auto
  scroll-behavior: smooth
  margin: 0
  height: 100vh

  .homepage-section#auth
    height: calc(100vh - (3rem + 68px))

  .landing-section-content
    @include containers.flex-container($flex-direction: column, $justify-content: center, $align-items: center)
    height: calc(100vh - variables.$cga-topbar-height)

    .landing-section-pre-symbol
      height: 100px
      width: 1px
      background: linear-gradient(variables.$cassandra-white, variables.$cassandra-light-blue)

    .landing-section-symbol
      @include containers.flex-container($flex-direction: column, $justify-content: center, $align-items: center)
      background: linear-gradient(90deg, variables.$cassandra-light-blue, variables.$cassandra-blue)
      color: variables.$cassandra-white
      border-radius: 100%
      margin-bottom: 20px
      font-size: 1.5rem
      font-weight: 400
      height: 50px
      width: 50px
  
    .landing-section-container
      @include containers.flex-container($flex-direction: column, $justify-content: center, $align-items: center)

      .landing-cards-container
        margin: 0 256px
        display: grid
        grid-template-columns: repeat(2, 1fr)
        gap: 3.2rem
        grid-template-areas: "first second" "first third"

        .landing-card
          grid-area: first / first / first / first
          height: 40rem
          transition: all 0.5s ease-in-out 0s
          
          &:nth-of-type(1)
            background: linear-gradient(135deg, variables.$cassandra-light-blue, variables.$cassandra-gradient-blue, variables.$cassandra-gradient-blue-darken, variables.$cassandra-gradient-blue-darkest)
            background-size: 200% 200%
            max-height: 568px
            background: url(https://cdn.auth0.com/website/new-homepage/resources/bg-1.svg) right bottom no-repeat, linear-gradient(135deg, variables.$cassandra-light-blue, variables.$cassandra-gradient-blue, variables.$cassandra-gradient-blue-darken, variables.$cassandra-gradient-blue-darkest)

            .landing-card-text
              color: variables.$cassandra-white !important

          &:nth-of-type(2)
            grid-area: second / second / second / second
            height: 16.3rem
            
            .landing-card-title-text
              font-size: 2rem
              color: variables.$cassandra-gradient-blue

            .landing-card-text
              color: variables.$cassandra-black

          &:nth-of-type(3)
            grid-area: third / third / third / third
            height: 16.3rem

            .landing-card-title-text
              font-size: 2rem
              color: variables.$cassandra-gradient-blue

            .landing-card-text
              color: variables.$cassandra-black

          &:hover
            transform: scale(1.015)
  
          .landing-card-title
            @include containers.flex-container($flex-direction: row, $justify-content: flex-start, $align-items: center)
            margin-bottom: 10px

            .landing-card-icon-wrapper
              @include containers.flex-container($flex-direction: row, $justify-content: center, $align-items: center)
              background-color: variables.$cassandra-light-gray
              border: 1px solid variables.$cassandra-gray
              border-radius: 20%
              margin-right: 10px
              padding: 5px

              .v-icon
                font-size: 24px

          .landing-card-text
            @include containers.flex-container($flex-direction: column, $justify-content: flex-start)
            color: variables.$cassandra-white

    .landing-section-splitter-container
      @include containers.flex-container($flex-direction: column, $justify-content: center, $align-items: center)
      height: 100%
      width: 100%

      .p-splitter
        width: 50%
        border: none

        .p-splitter-panel
          @include containers.flex-container($justify-content: center, $align-items: center)
          overflow: auto
        
          &:nth-of-type(2)
            flex-basis: 0% !important
            
.console-section
  @include containers.flex-container($flex-direction: column)
  height: calc(100vh - 68px)

</style>
