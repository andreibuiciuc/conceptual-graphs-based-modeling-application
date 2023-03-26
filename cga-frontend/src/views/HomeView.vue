<template>
  <div class="homepage" v-if="!isUserLoggedIn">
    <section class="landing-section">
      <div class="landing-section-container">
        <div class="landing-section-content">
          <div class="landing-section-text">
            <h1>CGA</h1>
            <h2>
              The interface for modeling Cassandra data structures and querying
              data, based on Conceptual Graphs.
            </h2>
            <h2>
              Start exploring Cassandra databases and move from blipping
              consoles to a friendlier Visual Query System.
            </h2>
          </div>
        </div>
        <CassandraTerminal
          :is-terminal-opened="true"
          :is-terminal-readonly="true"
          :commands="getDummyCommands"
        />
      </div>
    </section>
    <div class="delimiter-positive"></div>
    <!-- TODO: Summary section -->
    <section class="summary-section">
      <div class="summary-container">
        <h1>Conceptual Graphs are a great visualization tool</h1>
        <ConceptualGraph
          :inverted="true"
          :keyspaceConcept="getDummyCG.keyspaceConcept"
          :tableConcepts="getDummyCG.tableConcepts"
          :columnConcepts="getDummyCG.columnConcepts"
          :dataTypeConcepts="getDummyCG.dataTypeConcepts"
        />
      </div>
    </section>
    <div class="delimiter-negative"></div>
    <!-- TODO: Authentication section -->
    <section class="authentication-section" id="auth">
      <div class="authentication-container">
        <h1>Want to start exploring databases?</h1>
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
    </section>
  </div>
  <div v-else>
    <section class="console-section">
      <ConnectionDashboard />
    </section>
  </div>
</template>

<script lang="js">
import dummyCG from '@/constants/dummyCG';
import cassandraTerminalConstants from '../components/graphic/terminal/cassandraTerminalConstants';
import { mapWritableState } from 'pinia';
import useAuthModalStore from '@/stores/authModal';
import useUserStore from '@/stores/user';

import CassandraTerminal from '../components/graphic/terminal/CassandraTerminal.vue';
import AuthenticationModal from '../components/authentication/AuthenticationModal.vue';
import ConnectionDashboard from '../components/dashboard/ConnectionDashboard.vue';
import ConceptualGraph from '../components/graphic/graph/ConceptualGraph.vue';

export default {
  name: "HomeView",
  components: {
    CassandraTerminal,
    AuthenticationModal,
    ConnectionDashboard,
    ConceptualGraph
  },
  computed: {
    ...mapWritableState(useUserStore, ['isUserLoggedIn']),
    ...mapWritableState(useAuthModalStore, ['isModalOpened']),
    getDummyCG: function () {
      return dummyCG;
    },
    getDummyCommands: function () {
      return cassandraTerminalConstants.dummyCQL;
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

.console-section
  @include containers.flex-container($flex-direction: column)
  margin-top: variables.$cga-topbar-height
  height: calc(100vh - variables.$cga-topbar-height)
  padding: 5vh 5vw

.landing-section
  @include containers.flex-container($align-items: center)
  background-color: variables.$cassandra-white
  height: calc(80vh - variables.$cga-topbar-height)

  .landing-section-container
    @include containers.flex-container

    .landing-section-text
      @include containers.flex-container($flex-direction: column)


.summary-section
  color: variables.$cassandra-white
  background-color: variables.$cassandra-blue
  min-height: 100vh

  .summary-container
    @include containers.flex-container($flex-direction: column, $justify-content: center, $align-items: center)

    h1
      color: variables.$cassandra-white

.authentication-section
  min-height: 100vh
  background-color: variables.$cassandra-white

  .authentication-container
    @include containers.flex-container($flex-direction: column, $justify-content: center, $align-items: center)

    .auth-activator .v-card-text
        padding: 0

    .auth-button
      height: auto

%delimiter
  aspect-ratio: 900/300
  width: 100%
  background-repeat: no-repeat
  background-position: center
  background-size: cover

.delimiter-positive
  @extend %delimiter
  background-image: url('../assets/svg/layered-waves.svg')

.delimiter-negative
  @extend %delimiter
  background-image: url('../assets/svg/layered-waves-negative.svg')
</style>
