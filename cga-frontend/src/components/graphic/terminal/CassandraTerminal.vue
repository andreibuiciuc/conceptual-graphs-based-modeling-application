<template>
  <div v-if="showTerminal" class="landing-terminal-wrapper">
    <div class="landing-terminal-header">
      <div
        class="dot"
        :class="{ 'dot-close': !isTerminalReadonly }"
        @click.prevent="closeTerminal"
      ></div>
      <div class="dot"></div>
      <div class="dot"></div>
    </div>
    <div class="landing-terminal">
      <div class="command-line">
        <template
          v-for="(command, index) in commands"
          :key="command.lineNumber"
        >
          <pre>{{ command.lineContent }}<span v-if="index === commands.length - 1" class="blip">|</span></pre>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "CassandraTerminal",
  props: {
    isTerminalOpened: Boolean,
    isTerminalReadonly: Boolean,
    commands: Array,
  },
  methods: {
    closeTerminal: function () {
      if (!this.isTerminalReadonly) {
        this.$emit("close");
      }
    },
  },
  computed: {
    showTerminal: function () {
      return this.isTerminalOpened;
    },
  },
};
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

  .dot-close:hover
    cursor: pointer

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
