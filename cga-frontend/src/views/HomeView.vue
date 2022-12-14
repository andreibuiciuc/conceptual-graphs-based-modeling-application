<template>
  <div class="homepage">
    <section class="landing-section">
      <div class="landing-section-container">
        <div class="landing-section-content">
          <div class="landing-section-text">
            <h1>CGA</h1>
            <h2>
              The interface for modeling Cassandra data structures and querying data, 
              based on Conceptual Graphs.
            </h2>
            <h2>
              Start exploring Cassandra databases and move from blipping consoles to a friendlier
              Visual Query System.
            </h2>
          </div>
        </div>
        <cassandra-terminal />
      </div>
    </section>
    <div class="delimiter-positive"></div>
    <!-- TODO: Summary section -->
    <section class="summary-section">
      <div class="summary-container">
        <h1>Conceptual Graphs are a great visualization tool</h1>
      </div>
    </section>
    <div class="delimiter-negative"></div>
    <!-- TODO: Authentication section -->
    <section class="authentication-section" id="auth">
      <div class="authentication-container">
        <h1>Want to start exploring databases?</h1>
        <v-card variant="outlined" class="auth-activator">
          <v-card-text>
            <v-btn variant="text" class="auth-button" @click.prevent="isModalOpened = true">
              Create a new account <br /> or <br /> sign in 
            </v-btn>
          </v-card-text>
        </v-card>
        <authentication-modal />
      </div>
    </section>
  </div>
</template>

<script>
import { mapWritableState } from 'pinia';
import useAuthModalStore from '@/stores/authModal';

import CassandraTerminal from '@/components/graphic/CassandraTerminal.vue';
import AuthenticationModal from '@/components/authentication/AuthenticationModal.vue';

export default {
  name: "HomeView",
  components: {
    CassandraTerminal,
    AuthenticationModal
  },
  computed: {
    ...mapWritableState(useAuthModalStore, ['isModalOpened']),
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