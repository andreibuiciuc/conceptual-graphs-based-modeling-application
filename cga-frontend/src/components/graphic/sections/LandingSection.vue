<template>
    <HomepageSection>
        <template #section-content>
            <div class="landing-animation-wrapper">
                <div class="landing-animated-oval"></div>
                <div class="landing-animated-oval"></div>
                <div class="landing-animated-oval"></div>
            </div>
            <div class="landing-section-content">
                <div class="landing-section-text">
                    <h1 class="landing-title">
                        <span
                            v-for="titleToken in titleTokens"
                            :key="titleToken"
                            class="landing-title-text"
                        >
                            {{ titleToken }}
                        </span>
                    </h1>
                    <h2 class="landing-subtitle">
                        <span class="landing-title-text">
                            {{ subtitle }}
                        </span>
                        <span class="landing-title-text">
                            {{ trailingSubtitleToken }}
                        </span>
                    </h2>
                </div>
            </div>
        </template>
    </HomepageSection>
</template>

<script setup lang="ts">
import HomepageSection from './HomepageSection.vue';

interface Props {
    titleTokens: string[]
    subtitle: string
    trailingSubtitleToken?: string
}

const _ = defineProps<Props>();

</script>

<style scoped lang="sass">
@use "@/assets/styles/_variables.sass"
@use "@/assets/styles/_containers.sass"

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
        @include containers.flex-container($flex-direction: column, $justify-content: center, $align-items: flex-start)
        margin-bottom: 4rem

        .landing-title
            @include containers.flex-container($flex-direction: row, $justify-content: center, $align-items: center)
            margin-bottom: 2rem

            .landing-title-text
                color: variables.$cassandra-black
                font-size: 5rem
                font-weight: 300
                padding: 0.5rem
        
        .landing-subtitle
            @include containers.flex-container($flex-direction: column, $justify-content: center, $align-items: flex-start)

            .landing-title-text
                color: variables.$cassandra-black
                font-size: 2.5rem
                font-weight: 200
                line-height: 3rem
                padding: 0.5rem

            .landing-title-text:last-of-type
                color: variables.$cassandra-yellow
                font-weight: 300

</style>