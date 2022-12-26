<template>
  <div class="homepage">
    <section class="landing-section">
      <div class="landing-section-container">
        <div class="landing-section-content">
          <div class="landing-section-text">
            <h1 style="font-size: 60px;">CGA</h1>
            <h2 style="font-size: 20px">The interface for modeling Cassandra data structures and querying data, 
              based on Conceptual Graphs. Start exploring Cassandra databases and move from blipping consoles to a friendlier
              Visual Query System.</h2>
          </div>
        </div>
        <CassandraTerminal />
      </div>
    </section>
    <div class="delimiter-positive"></div>
    <!-- TODO: Summary section -->
    <section class="summary-section">
      <div class="summary-container">
        <h1>Start exploring databases</h1>
        <v-btn variant="outlined">
          Start
        </v-btn>
      </div>
    </section>
    <div class="delimiter-negative"></div>
    <!-- TODO: Authentication section -->
    <section class="authentication-section">
      <div class="authentication-container">
        <h1>Start exploring databases</h1>
        <v-btn variant="outlined">
          Start
        </v-btn>
      </div>
    </section>
  </div>
</template>

<script>
import CassandraTerminal from '@/components/graphic/CassandraTerminal.vue';

export default {
  name: "HomeView",
  components: {
    CassandraTerminal
  }
}
</script>

<style scoped lang="sass">
@use "@/assets/styles/_variables.sass"
@use "@/assets/styles/_containers.sass"

.homepage
    margin: 0
    margin-top: variables.$cga-topbar-height

.landing-section 
  @include containers.flex-container($align-items: center)
  background-color: variables.$cassandra-white
  height: calc(80vh - variables.$cga-topbar-height)

  .landing-section-container 
    @include containers.flex-container

    .landing-section-text 
      @include containers.flex-container($flex-direction: column)

      h1 
        color: variables.$cassandra-blue
        font-weight: bolder

.summary-section 
  color: variables.$cassandra-white
  background-color: variables.$cassandra-blue
  min-height: 100vh
  
  .summary-container 
    @include containers.flex-container($flex-direction: column, $justify-content: center, $align-items: center)
  
.authentication-section 
  min-height: 100vh
  background-color: variables.$cassandra-white

  .authentication-container 
    @include containers.flex-container($flex-direction: column, $justify-content: center, $align-items: center)


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