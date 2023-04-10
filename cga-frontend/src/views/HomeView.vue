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
        <cassandra-terminal :is-terminal-opened="true" :is-terminal-readonly="true" :commands="dummyCQLCommands" />
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
              <span></span>
            </cga-card>
          </div>
        </div>
      </div>
    </section>
    <section class="homepage-section">
      <cga-banner-card title="Conceptual Graphs" id="banner">
        <span class="banner-card-text">"With their direct mapping to language, conceptual graphs can serve as an</span>
        <span class="banner-card-text">intermediate language for translating computer-oriented formalisms to and from natural languages."</span>  
      </cga-banner-card>
      <div class="landing-image-wrapper">
        <!-- <img id="macbook" src="/macbook-air-medium.png" /> -->
        <model-viewer src="/macbook_air_m2/scene.gltf" alt="macbook"></model-viewer>
      </div>
    </section>
    <!-- TODO: Authentication section -->
    <section class="homepage-section homepage-section__last" id="auth">
      <div class="landing-page-final-block">
        <div class="authentication-container">
        <h1>Start exploring databases by <br />
          <span>building Conceptual Graphs</span>
        </h1>
        <v-card variant="outlined" class="auth-activator">
          <v-card-text>
            <v-btn
              variant="text"
              class="auth-button"
              @click.prevent="isModalOpened = true"
            >
              Create a new account <br />
              or <br />
              sign in
            </v-btn>
          </v-card-text>
        </v-card>
        <AuthenticationModal />
      </div>
      </div>
    </section>
  </div>

  <div v-else>
    <section class="console-section">
      <ConnectionDashboard />
    </section>
  </div>
</template>

<script setup lang="ts">
import dummyCG from '../constants/dummyCG';
import cassandraTerminalConstants from '../components/graphic/terminal/cassandraTerminalConstants';

import useAuthModalStore from '../stores/authModal';
import useUserStore from '../stores/user';
import { storeToRefs } from 'pinia';
import { computed } from '@vue/reactivity';

import CassandraTerminal from '../components/graphic/terminal/CassandraTerminal.vue';
import CgaCard from '../components/graphic/cards/CgaCard.vue';
import CgaBannerCard from '../components/graphic/cards/CgaBannerCard.vue';
import CgaDelimiter from '../components/graphic/delimiters/CgaDelimiter.vue';
import AuthenticationModal from '../components/authentication/AuthenticationModal.vue';
import ConnectionDashboard from '../components/dashboard/ConnectionDashboard.vue';
import ConceptualGraph from '../components/graphic/graph/ConceptualGraph.vue';

// Store state mappings
const userStore = useUserStore();
const authModalStore = useAuthModalStore();

const { isUserLoggedIn } = storeToRefs(userStore);
const { isModalOpened } = storeToRefs(authModalStore);

// Computed properties
const dummyConceptualGraph = computed(() => {
  return dummyCG;
});

const dummyCQLCommands = computed(() => {
  return cassandraTerminalConstants.dummyCQL
});

</script>

<style lang="sass">
@use "@/assets/styles/_variables.sass"
@use "@/assets/styles/_containers.sass"

model-viewer
  width: 800px
  height: 800px

.homepage
  overflow-y: auto
  scroll-behavior: smooth
  margin: 0
  margin-top: variables.$cga-topbar-height
  height: calc(100vh - variables.$cga-topbar-height)
  
  .homepage-section
    max-width: 100%
    padding: 0 24px
    height: calc(100vh - variables.$cga-topbar-height)

    .landing-image-wrapper
      @include containers.flex-container($flex-direction: column, $justify-content: center, $align-items: center)

      .display-image-fade-in
        visibility: visible
        animation: display-image-fade-in 0.5s cubic-bezier(0.390, 0.575, 0.565, 1.000) both

      @keyframes display-image-fade-in
          0% 
              opacity: 0
              transform: translateY(40px)
          100%
              opacity: 1
              transform: translateY(0)

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
            font-weight: 800
            padding: 0.5rem
        
        .landing-subtitle
          @include containers.flex-container($flex-direction: column, $justify-content: center, $align-items: center)

          .landing-title-text
            color: variables.$cassandra-black
            font-size: 2.5rem
            font-weight: 400
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

  .homepage-section:nth-of-type(2), .homepage-section:nth-of-type(3)
    height: 120vh

  .homepage-section__last
    @include containers.flex-container($flex-direction: column, $justify-content: flex-end, $align-items: center)
    padding: 0

.console-section
  @include containers.flex-container($flex-direction: column)
  margin-top: variables.$cga-topbar-height
  height: calc(100vh - variables.$cga-topbar-height)
  padding: 5rem

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
