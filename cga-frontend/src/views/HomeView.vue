<template>
  <div class="homeview-body">
    <!-- TODO: Landing section -->
    <section class="landing-section">
      <div class="landing-section-content">
        <h1>Conceptual Graphs based-modeling Application</h1>
        <h2>Interface for modeling Cassandra data structure and querying
          data, based on Conceptual Graphs</h2>
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
export default {
  name: "HomeView",
}
</script>

<style scoped>
.homeview-body {
  margin: 0;
  height: calc(100% - 56px);
}

section {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 10vw;
}

/* Style related to the landing section */
.landing-section {
  min-height: 50vh;
  background-color: var(--cassandra-white);
}

.homeview-body > .landing-section > .landing-section-content h1 {
  font-size: xx-large;
  margin-top: 16px;
}

/* Styles related to the summary section */
.summary-section {
  min-height: 100vh;
  color: var(--cassandra-white);
  background-color: var(--cassandra-blue);
}

.homeview-body > .summary-section > h1 {
  font-size: x-large;
}

.summary-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.summary-container * {
  padding: 10px;
}

/* Styles related to the authentication section */
.authentication-section {
  min-height: 100vh;
  background-color: var(--cassandra-white);
}

.authentication-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.delimiter-positive, .delimiter-negative {
  aspect-ratio: 900/300;
  width: 100%;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}

.delimiter-positive {
  background-image: url('../assets/svg/layered-waves.svg');
}

.delimiter-negative {
  background-image: url('../assets/svg/layered-waves-negative.svg');
}
</style>