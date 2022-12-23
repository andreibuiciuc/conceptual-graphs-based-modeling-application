<template>
  <div class="homeview-body">
    <section class="landing-section">
      <div class="landing-section-container">
        <div class="landing-section-content">
          <div class="landing-section-text">
            <h1 style="font-size: 60px;">CGA</h1>
            <h2 style="font-size: 20px">The interface for modeling Cassandra data structures and querying data, 
              based on Conceptual Graphs. Start exploring databases and move from blipping consoles to a friendlier
              Visual Query System.</h2>
          </div>
        </div>
        <div class="landing-terminal-wrapper">
          <div class="landing-terminal">
            <div class="command-line">
              <pre>cqlsh >> DESCRIBE keyspaces;</pre>
              <pre>cqlsh >> TODO: response</pre>
              <pre>cqlsh >> USE daily_weather_measurements;</pre>
              <pre>cqlsh >> SELECT m_date , city , station_code, min_temp , max_temp</pre>
              <pre>      >> FROM daily_weather_measurements</pre>
              <pre>      >> WHERE m_date ='2020-01-12'</pre>
              <pre>      >> ORDER BY city ASC<span style="font-family: monospace" class="blip">|</span></pre> 
            </div>
          </div>
        </div>
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
  data: () => {
    return {
      sections: [
        {
          key: "landingSection",
          title: "Home",
          dotColor: "#bbe6fb",
          icon: 'home'
        },
        {
          key: "summarySection",
          title: "Summary",
          dotColor: "#1287b1"
        },
        {
          key: "authSection",
          title: "Authentication",
          dotColor: "#373535"
        }
      ]
    };
  }
}
</script>

<style scoped>
.homeview-body {
  margin: 0;
  margin-top: 88px;
}

section {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 10vw; 
}

/* Style related to the landing section */
.landing-section {
  flex-direction: row;
  justify-content: flex-start;
  background-color: var(--cassandra-white);
  height: calc(80vh - 88px);
}

.landing-section-container {
  display: flex;
  align-items: flex-start;
}

.landing-section-content .landing-section-text {
  display: flex;
  flex-direction: column;
}

.landing-section-content .landing-section-text h1 {
  color: var(--cassandra-blue);
  font-weight: bolder;
}

.landing-terminal {
  width: 600px;
  height: 300px;
  background-color: var(--cassandra-black);
  border-radius: 10px;
  padding: 1rem;
}

.command-line {
  color: var(--cassandra-white);
}

img {
  position: absolute;
  top: 50%;
  left: 50%;
}

@keyframes blipping {
  from {
    color: var(--cassandra-white);
  }
  to {
    color: var(--cassandra-black);
  }
}

.blip {
  animation-name: blipping;
  animation-duration: 1s;
  animation-iteration-count: infinite;
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