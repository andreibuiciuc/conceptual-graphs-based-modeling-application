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
        <span class="landing-section-pre-symbol"></span>
        <span class="landing-section-symbol">1</span>
        <div class="landing-section-text">
          <h2 class="landing-subtitle">
            <span class="landing-gradient-text">Move from blipping consoles to a friendlier Visual Query System.</span>
          </h2>
        </div>
        <div class="landing-section-container">
          <cassandra-terminal />
          <div class="landing-cards-container">
            <div class="landing-card">
              <div class="landing-card-title">
                <div class="landing-card-icon-wrapper">
                  <v-icon>mdi-magnify</v-icon>
                </div>
                <div class="landing-card-title-text">
                  Connect And Start Exploring
                </div>
              </div>
              <div class="landing-card-text">
                <span>Connect to your Cassandra server, locally or on the cloud, or play around with the one provided by us.</span>
                <span>We use Astra DB for hosting the mock database.</span>
              </div>
            </div>
            <div class="landing-card"></div>
            <div class="landing-card"></div>
          </div>
        </div>
      </div>
    </section>
    <section class="homepage-section">
      <div class="summary-container">
        <conceptual-graph 
          :keyspaceConcept="getDummyCG.keyspaceConcept"
          :tableConcepts="getDummyCG.tableConcepts"
          :columnConcepts="getDummyCG.columnConcepts"
          :dataTypeConcepts="getDummyCG.dataTypeConcepts" />
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
            <v-btn variant="text" class="auth-button" @click.prevent="isModalOpened = true">
              Create a new account <br /> or <br /> sign in 
            </v-btn>
          </v-card-text>
        </v-card>
        <authentication-modal />
      </div>
      </div>
    </section>
  </div>

  <div v-else>
    <section class="console-section">
      <dashboard />
    </section>
  </div>
</template>

<script>
import dummyCG from '@/constants/dummyCG';
import { mapWritableState } from 'pinia';
import useAuthModalStore from '@/stores/authModal';
import useUserStore from '@/stores/user';

import CassandraTerminal from '../components/graphic/CassandraTerminal.vue';
import AuthenticationModal from '../components/authentication/AuthenticationModal.vue';
import Dashboard from '../components/dashboard/Dashboard.vue';
import ConceptualGraph from '../components/utilities/ConceptualGraph.vue';

export default {
  name: "HomeView",
  components: {
    CassandraTerminal,
    AuthenticationModal,
    Dashboard,
    ConceptualGraph
  },
  data: function () {
    return {
      homepageElement: null,
    }
  },
  computed: {
    ...mapWritableState(useUserStore, ['isUserLoggedIn']),
    ...mapWritableState(useAuthModalStore, ['isModalOpened', "currentScrollYPosition"]),
    getDummyCG: function () {
      return dummyCG;
    }
  },
  methods: {
    handleScrollEvent: function () {
      this.currentScrollYPosition = this.homepageElement.scrollTop;
    }
  },
  mounted: function () {
    this.homepageElement = document.getElementById("homepage");
    if (this.homepageElement) {
      this.homepageElement.addEventListener("scroll", this.handleScrollEvent);
    }
  }
}
</script>

<style scoped lang="sass">
@use "@/assets/styles/_variables.sass"
@use "@/assets/styles/_containers.sass"

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
        background-color: #0D41E1
        opacity: 0.4
        animation-name: floating-oval-animation__first

      .landing-animated-oval:nth-of-type(2)
        z-index: -2
        width: 600px
        height: 600px
        top: 0%
        left: 40%
        background-color: #0A85ED
        opacity: 0.4
        animation-name: floating-oval-animation__second

      .landing-animated-oval:nth-of-type(3)
        z-index: -3
        width: 500px
        height: 500px
        top: 50%
        left: 50%
        background-color: #07C8F9
        opacity: 0.3
        animation-name: floating-oval-animation__third

    .landing-section-content
      @include containers.flex-container($flex-direction: column, $justify-content: center, $align-items: center)
      height: calc(100vh - variables.$cga-topbar-height)

      .landing-section-text
        @include containers.flex-container($flex-direction: column, $justify-content: center, $align-items: center)

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
          margin-bottom: 40px

          .landing-title-text
            color: variables.$cassandra-black
            font-size: 2.5rem
            font-weight: 400
            line-height: 3rem

          .landing-gradient-text
            font-size: 2rem
            font-weight: 400
            line-height: 2rem
            background-image: linear-gradient(variables.$cassandra-light-blue, variables.$cassandra-blue)
            -webkit-background-clip: text
            -webkit-text-fill-color: transparent
    
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
        @include containers.flex-container($flex-direction: row, $justify-content: center, $align-items: center)

        .landing-cards-container
          @include containers.flex-container($flex-direction: column, $justify-content: center, $align-items: center)
          margin-left: 40px
          width: 100%

          .landing-card
            @include containers.flex-container($flex-direction: column, $justify-content: center, $align-items: flex-start)
    
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

              .landing-card-title-text
                font-size: 1.25rem

            .landing-card-text
              @include containers.flex-container($flex-direction: column, $justify-content: flex-start)
  .homepage-section__last
    @include containers.flex-container($flex-direction: column, $justify-content: flex-end, $align-items: center)
    padding: 0

.console-section
  @include containers.flex-container($flex-direction: column)
  margin-top: variables.$cga-topbar-height
  height: calc(100vh - variables.$cga-topbar-height)
  padding: 5rem

.landing-section 
  @include containers.flex-container($flex-direction: column, $align-items: center)
  background-color: variables.$cassandra-white
  height: calc(100vh - variables.$cga-topbar-height)

  .landing-section-text 
    @include containers.flex-container($flex-direction: column)

    h1
      font-size: 7rem

.summary-section 
  color: variables.$cassandra-white
  background-color: variables.$cassandra-blue
  min-height: 100vh
  
  .summary-container 
    @include containers.flex-container($flex-direction: column, $justify-content: center, $align-items: center)

    h1
      color: variables.$cassandra-white
  
.authentication-section 
  height: 100%
  background-color: variables.$cassandra-white
  justify-content: flex-end
  padding: 0

  .authentication-container 
    @include containers.flex-container($flex-direction: column, $justify-content: center, $align-items: center)

    .auth-activator .v-card-text
        padding: 0

    .auth-button
      height: auto

.landing-page-final-block
  @include containers.flex-container($flex-direction: column, $justify-content: center, $align-items: center)
  background-color: variables.$cassandra-black
  color: variables.$cassandra-white !important
  border-top-left-radius: 10%
  border-top-right-radius: 25%
  padding: 50px 0
  width: 100%
  height: 75%

.landing-page-final-block h1
  font-size: 64px
  color: variables.$cassandra-white

  span
    color: variables.$cassandra-yellow !important

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