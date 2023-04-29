<template>
  <div class="homepage" id="homepage" v-if="!isUserLoggedIn">
    <section class="homepage-section">
      <div class="landing-animation-wrapper">
        <div class="landing-animated-oval"></div>
        <div class="landing-animated-oval"></div>
        <div class="landing-animated-oval"></div>
      </div>
      <div class="landing-section-content">
        <div class="landing-section-text">
          <h1 class="landing-title">
            <span class="landing-title-text">Conceptual</span>
            <span class="landing-title-text">Graphs</span>
            <span class="landing-title-text">Application</span>
          </h1>
          <h2 class="landing-subtitle">
            <span class="landing-title-text">The interface for modeling and querying Cassandra databases</span>
            <span class="landing-title-text">based on the simplicity of Conceptual Graphs</span>
          </h2>
        </div>
      </div>
    </section>
    <section class="homepage-section">
      <div class="landing-section-content">
        <div class="landing-section-container">
          <div class="landing-cards-container">
            <cga-card title="Connect And Start Exploring">
              <span>Connect to your Cassandra server, locally or on the cloud, or play around with the one provided by us.</span>
            </cga-card>
            <cga-card title="Create Cassandra Data Structures">
              <span>Visualise and create Cassandra data structures by building conceptual graphs.</span>
            </cga-card>
            <cga-card title="Query Cassandra Tables">
              <span>Query your database tables and get results in real time, without touching your Cassandra bash terminal.</span>
            </cga-card>
          </div>
        </div>
      </div>
    </section>
    <section class="homepage-section">
      <div class="landing-section-splitter-container">
        <Splitter>
          <SplitterPanel :size="100">
            <CassandraTerminal 
              :is-terminal-opened="true"
              :is-terminal-readonly="true"
              :commands="cassandraTerminalConstants.dummyCQL" 
            />
          </SplitterPanel>
          <SplitterPanel :size="-10">
            <ConceptualGraph :graph-metadata="dummyGraphMetadata" graph-key="dummyGraph"
             />
          </SplitterPanel>
        </Splitter>
      </div>
    </section>
    <section class="homepage-section homepage-section__last" id="auth">
      <AuthenticationCard />
    </section>
    <ScrollTop target="parent" :threshold="500" />
  </div>

  <div v-else>
    <div class="console-section">
      <div class="header-container">
        <Button 
          outlined 
          severity="primary" 
          label="connect" 
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
import cassandraTerminalConstants from '../components/graphic/terminal/cassandraTerminalConstants';
import { dummyGraphMetadata } from '../constants/dummyCG'
import { useUtilsStore } from '../stores/utils';
import { useUserStore } from '../stores/user';
import { storeToRefs } from 'pinia';
import { Ref, ref } from '@vue/reactivity';

import CgaCard from '../components/graphic/cards/CgaCard.vue';
import AuthenticationCard from '../components/authentication/AuthenticationCard.vue';
import ConnectionDashboard from '../components/dashboard/ConnectionDashboard.vue';
import { onMounted } from 'vue';
import CassandraTerminal from '../components/graphic/terminal/CassandraTerminal.vue';
import ConceptualGraph from '../components/graphic/graph/ConceptualGraph.vue';
import { useConnectionStore } from '../stores/connection';

// Store state mappings
const userStore = useUserStore();
const utilsStore = useUtilsStore();

const { isUserLoggedIn } = storeToRefs(userStore);
const { currentScrollYPosition, isSidebarOpened, forceGraph } = storeToRefs(utilsStore);

// Store mappings
const connectionStore = useConnectionStore();
const { currentKeyspace, cassandraServerCredentials } = storeToRefs(connectionStore);

const homepageElement: Ref<HTMLElement | null> = ref(null);
const bannerElement: Ref<HTMLElement | null> = ref(null);
const bannerElementYPosition: Ref<number> = ref(0);

const handleScrollEvent = (): void => {
  if (homepageElement.value) {
    currentScrollYPosition.value = homepageElement.value.scrollTop;
    if (currentScrollYPosition.value >= bannerElementYPosition.value - 3 * window.innerHeight / 4) {
      bannerElement.value?.classList.add('banner-card--fade-in');
    }
  } else {
    currentScrollYPosition.value = 0;
  }
}

onMounted(() => {
  homepageElement.value = document.getElementById('homepage');
  if (homepageElement.value) {
    homepageElement.value.addEventListener('scroll', handleScrollEvent);
    bannerElement.value = document.getElementById('banner');
    if (bannerElement.value) {
      bannerElementYPosition.value = homepageElement.value.scrollTop + bannerElement.value.getBoundingClientRect().top;
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
  
  .homepage-section
    max-width: 100%
    padding: 0 24px
    height: 100vh

    .landing-animation-wrapper
      position: absolute
      overflow: hidden
      top: 0
      left: 0
      right: 0
      bottom: 0
      filter: blur(100px)

      .landing-animated-oval
        border-radius: 100%
        position: absolute
        animation-duration: 12s
        animation-iteration-count: infinite

      .landing-animated-oval:nth-of-type(1)
        z-index: -1
        width: 800px
        height: 800px
        top: 40%
        left: 60%
        background-color: variables.$cassandra-gradient-blue
        opacity: 0.4
        animation-name: floating-oval-animation__first

      .landing-animated-oval:nth-of-type(2)
        z-index: -2
        width: 600px
        height: 600px
        top: 0%
        left: 40%
        background-color: variables.$cassandra-gradient-blue-darken
        opacity: 0.6
        animation-name: floating-oval-animation__second

      .landing-animated-oval:nth-of-type(3)
        z-index: -3
        width: 500px
        height: 500px
        top: 50%
        left: 50%
        background-color: variables.$cassandra-gradient-blue-darkest
        opacity: 0.5
        animation-name: floating-oval-animation__third

    .landing-section-content
      @include containers.flex-container($flex-direction: column, $justify-content: center, $align-items: center)
      height: calc(100vh - variables.$cga-topbar-height)

      .landing-section-text
        @include containers.flex-container($flex-direction: column, $justify-content: center, $align-items: center)
        margin-bottom: 80px

        .landing-title
          @include containers.flex-container($flex-direction: row, $justify-content: center, $align-items: center)
          margin-bottom: 20px

          .landing-title-text
            color: variables.$cassandra-black
            font-size: 5rem
            font-weight: 300
            padding: 0.5rem
        
        .landing-subtitle
          @include containers.flex-container($flex-direction: column, $justify-content: center, $align-items: center)

          .landing-title-text
            color: variables.$cassandra-black
            font-size: 2.5rem
            font-weight: 200
            line-height: 3rem

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

  .header-container
    justify-content: flex-start

    & > *:not(:last-child)
      margin-right: 2rem

@keyframes floating-oval-animation__first
  0%
    transform: translateX(-50%) translateY(-50%) rotate(25deg) translateX(35%)
  25%
    transform: translateX(-50%) translateY(-50%) rotate(60deg) skew(-15deg, -15deg) translateX(30%)
  50%
    transform: translateX(-50%) translateY(-50%) rotate(120deg) translateX(20%)
  75%
    transform: translateX(-50%) translateY(-50%) rotate(240deg) skew(15deg, 15deg) translateX(25%)
  100%
    transform: translateX(-50%) translateY(-50%) rotate(320deg) translateX(35%)

@keyframes floating-oval-animation__second
  0%
    transform: translateX(-50%) translateY(50%) rotate(35deg) translateY(-30%)
  25%
    transform: translateX(-50%) translateY(50%) rotate(80deg) skew(-15deg, 15deg) translateY(-5%)
  50%
    transform: translateX(-50%) translateY(50%) rotate(150deg) translateY(10%)
  75%
    transform: translateX(-50%) translateY(50%) rotate(210deg) skew(15deg, 15deg) translateY(20%)
  100%
    transform: translateX(-50%) translateY(50%) rotate(400deg) translateY(30%)

@keyframes floating-oval-animation__third
  0%
    transform: translateY(-50%) translateX(-50%) translateX(-15%) translateY(10%)
  25%
    transform: translateY(-50%) translateX(-50%) translateX(20%) translateY(-30%)
  50%
    transform: translateX(-50%) translateY(50%) translateX(-5deg) translateY(10%)
  75%
    transform: translateY(-50%) translateX(-50%) translateX(-25%) translateY(-15%)
  100%
    transform: translateY(-50%) translateX(-50%) translateX(-15%) translateY(10%)
    
</style>
