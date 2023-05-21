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
                            v-for="(titleToken, index) in titleTokens"
                            :key="titleToken"
                            class="landing-title-text"
                            :class="{ 'landing-title-text-active': index === currentTitleTokenIndex }"
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
import { Ref, ref } from 'vue';
import HomepageSection from './HomepageSection.vue';

interface Props {
    titleTokens: string[]
    subtitle: string
    trailingSubtitleToken?: string
}

const props = defineProps<Props>();

const currentTitleTokenIndex: Ref<number> = ref(0);

const updatedTitleTokenIndex = (): void => {
    setInterval(() => {
        currentTitleTokenIndex.value = (currentTitleTokenIndex.value + 1) % props.titleTokens.length;
    }, 3000);
};

updatedTitleTokenIndex();

</script>

<style scoped lang="sass">
@use "@/assets/styles/_variables.sass"
@use "@/assets/styles/_containers.sass"
@use "@/assets/styles/_transitions.sass"

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

            .landing-title-text-active
                color: variables.$cassandra-yellow
        
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