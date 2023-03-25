<template>
    <div class="landing-terminal-wrapper">
      <div class="landing-terminal-header">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
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

.landing-terminal-header
  @include containers.flex-container($align-items: center)
  background-color: variables.$cassandra-black
  height: 32px
  border-top-left-radius: 10px
  border-top-right-radius: 10px
  border-bottom: 2px solid variables.$cassandra-white
  padding: 0 16px

  .dot
    width: 10px
    height: 10px
    border-radius: 50%
    margin-right: .25rem
  
    &:nth-of-type(1)
      background-color: variables.$cassandra-red
      
    &:nth-of-type(2)
      background-color: variables.$cassandra-light-blue
    
    &:nth-of-type(3)
      background-color: variables.$cassandra-blue


.landing-terminal 
  background-color: variables.$cassandra-black
  width: 600px
  height: 325px
  border-bottom-left-radius: 10px
  border-bottom-right-radius: 10px
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