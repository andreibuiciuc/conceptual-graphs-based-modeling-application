<template>
    <div class="landing-terminal">
        <div class="command-line">
        <pre>cqlsh >> DESCRIBE keyspaces;</pre>
        <pre>cqlsh >> TODO: response</pre>
        <pre>cqlsh >> USE daily_weather_measurements;</pre>
        <pre>cqlsh >> SELECT m_date , city , station_code, min_temp , max_temp</pre>
        <pre>      >> FROM daily_weather_measurements</pre>
        <pre>      >> WHERE m_date ='2020-01-12'</pre>
        <pre>      >> ORDER BY city ASC<span class="blip">|</span></pre> 
        </div>
    </div>
</template>

<script>
export default {
    name: "CassandraTerminal"
}
</script>

<style scoped lang="sass">
@use "@/assets/styles/_variables.sass"
@use "@/assets/styles/_containers.sass"

.landing-terminal 
  background-color: variables.$cassandra-black
  width: 600px
  height: 300px
  border-radius: 10px
  padding: 1rem

  .command-line 
    color: variables.$cassandra-white

    pre, span 
      font-face: monospace

@keyframes blipping 
  from 
    color: variables.$cassandra-white
  to 
    color: variables.$cassandra-black
  
.blip 
  animation-name: blipping
  animation-duration: 1s
  animation-iteration-count: infinite
  
</style>