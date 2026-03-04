<template>
    <article class="text-center max-w-5xl w-full flex flex-col items-center justify-center min-h-[40vh] cursor-pointer transition-all duration-500" 
             :class="{ 'vertical-rl': isVertical }"
             @click.stop="emit('fetchQuote')">
        
        <!-- Quote Text -->
        <div class="relative px-4 transition-all duration-500"
             :class="isVertical ? 'ml-12 md:ml-16' : 'mb-12 md:mb-16'">
            <transition name="fade-slide" mode="out-in">
                <div :key="quote.id" class="text-3xl md:text-5xl lg:text-6xl leading-relaxed tracking-wide font-serif text-shadow-sm transition-colors duration-500"
                     :class="isDark ? 'hover:text-white/90' : 'hover:text-black/80'">
                    <span class="text-6xl absolute font-serif select-none transition-colors duration-500"
                          :class="[
                              isDark ? 'text-white/40' : 'text-black/20',
                              isVertical ? '-top-4 -right-8' : '-top-8 -left-8'
                          ]">“</span>
                    <span class="heti--ancient inline-block">{{ quote.hitokoto }}</span>
                    <span class="text-6xl absolute font-serif select-none transition-colors duration-500"
                          :class="[
                              isDark ? 'text-white/40' : 'text-black/20',
                              isVertical ? '-bottom-4 -left-8' : '-bottom-8 -right-8'
                          ]">”</span>
                </div>
            </transition>
        </div>
        
        <!-- Metadata -->
        <div class="flex flex-col items-end gap-2 text-lg md:text-xl font-light tracking-wider transition-all duration-500 delay-100" 
             :class="[
                 {'opacity-0 translate-y-4': loading && !isVertical, 'opacity-0 -translate-x-4': loading && isVertical, 'opacity-80 translate-y-0 translate-x-0': !loading},
                 isDark ? 'text-neutral-400' : 'text-neutral-500'
             ]">
            <cite class="not-italic border-b pb-1 transition-colors cursor-pointer"
                  :class="[
                      isDark ? 'border-white/10 hover:border-white/30' : 'border-black/10 hover:border-black/30',
                      isVertical ? 'border-l pl-1 border-b-0 pb-0' : 'border-b pb-1'
                  ]"
                  @click.stop="emit('fetchQuote')">
                {{ quote.from }}
            </cite>
            <span class="text-sm md:text-base opacity-70 mt-1" v-if="quote.from_who">
                — {{ quote.from_who }}
            </span>
        </div>
    </article>
</template>

<script setup lang="ts">
import type { Hitokoto } from '../types';

defineProps<{
  quote: Hitokoto;
  loading: boolean;
  isDark: boolean;
  isVertical: boolean;
}>();

const emit = defineEmits<{
  (e: 'fetchQuote'): void;
}>();
</script>

<style scoped>
/* Typography */
.font-serif {
    font-family: "Songti SC", "Noto Serif SC", "SimSun", serif;
}

.vertical-rl {
    writing-mode: vertical-rl;
}

.text-shadow-sm {
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

/* Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
    transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-slide-enter-from {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
    filter: blur(4px);
}

.fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-10px) scale(0.98);
    filter: blur(4px);
}
</style>
