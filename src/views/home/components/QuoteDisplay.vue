<template>
    <article class="quote-stage text-center max-w-6xl w-full flex flex-col items-center justify-center min-h-[48vh] cursor-pointer transition-all duration-500"
             :class="[
                 { 'vertical-rl': isVertical, 'quote-stage--playing': isPlaying, 'quote-stage--loading': loading, 'quote-stage--holding': isHolding, 'quote-stage--saved': justSaved, 'quote-stage--wallpaper': wallpaperMode },
                 isDark ? 'quote-stage--dark' : 'quote-stage--light'
             ]"
             @click.stop="emit('fetchQuote')">
        <div class="quote-stage__halo" aria-hidden="true"></div>
        <div class="quote-stage__seal" aria-hidden="true">藏</div>
        <div v-if="!wallpaperMode" class="quote-stage__folio" :class="isDark ? 'quote-stage__folio--dark' : 'quote-stage__folio--light'">
            <span>{{ typeLabel }}</span>
            <strong>{{ statusLabel }}</strong>
            <span>{{ serialLabel }}</span>
        </div>

        <!-- Quote Text -->
        <div class="quote-stage__text-wrap relative px-4 transition-all duration-500"
             :class="isVertical ? 'ml-12 md:ml-16' : 'mb-10 md:mb-14'">
            <transition name="fade-slide" mode="out-in">
                <div :key="quote.id" class="quote-stage__text text-3xl md:text-5xl lg:text-6xl leading-relaxed tracking-wide font-serif transition-colors duration-500"
                     :class="isDark ? 'hover:text-white/90' : 'hover:text-black/80'">
                    <span class="quote-mark text-6xl absolute font-serif select-none transition-colors duration-500"
                          :class="[
                              isDark ? 'text-white/35' : 'text-black/20',
                              isVertical ? '-top-4 -right-8' : '-top-8 -left-8'
                          ]">“</span>
                    <span class="quote-stage__line heti--ancient inline-block" :aria-label="quote.hitokoto">
                        <span
                            v-for="(part, index) in quoteParts"
                            :key="`${quote.id}-${index}-${part}`"
                            class="quote-stage__glyph"
                            :style="{ animationDelay: `${Math.min(index, 48) * 34}ms` }"
                            aria-hidden="true"
                        >{{ part }}</span>
                    </span>
                    <span class="quote-mark text-6xl absolute font-serif select-none transition-colors duration-500"
                          :class="[
                              isDark ? 'text-white/35' : 'text-black/20',
                              isVertical ? '-bottom-4 -left-8' : '-bottom-8 -right-8'
                          ]">”</span>
                </div>
            </transition>
        </div>
        
        <!-- Metadata -->
        <div class="quote-stage__meta flex flex-col items-end gap-3 text-lg md:text-xl font-light transition-all duration-500 delay-100" 
             :class="[
                 {'opacity-0 translate-y-4': loading && !isVertical, 'opacity-0 -translate-x-4': loading && isVertical, 'opacity-80 translate-y-0 translate-x-0': !loading},
                 isDark ? 'text-neutral-400' : 'text-neutral-500'
             ]">
            <div v-if="!wallpaperMode" class="quote-stage__signal" aria-hidden="true" :class="{ 'quote-stage__signal--playing': isPlaying }">
                <span v-for="bar in 9" :key="bar" :style="{ animationDelay: `${bar * 90}ms` }"></span>
            </div>
            <div class="quote-stage__source" :class="isDark ? 'quote-stage__source--dark' : 'quote-stage__source--light'">
                <cite class="not-italic transition-colors cursor-pointer" @click.stop="emit('fetchQuote')">
                    {{ quote.from || '未知出处' }}
                </cite>
                <span v-if="quote.from_who">{{ quote.from_who }}</span>
            </div>
        </div>
    </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Hitokoto } from '../types';

const props = defineProps<{
  quote: Hitokoto;
  loading: boolean;
  isDark: boolean;
  isVertical: boolean;
  isPlaying: boolean;
  isHolding: boolean;
  justSaved: boolean;
  wallpaperMode?: boolean;
}>();

const quoteParts = computed(() => props.quote.hitokoto.split(''));
const typeNames: Record<string, string> = {
    a: '动画',
    b: '漫画',
    c: '游戏',
    d: '文学',
    e: '原创',
    f: '网络',
    g: '其他',
    h: '影视',
    i: '诗词',
    j: '网易云',
    k: '哲学',
    l: '抖机灵'
};
const typeLabel = computed(() => typeNames[props.quote.type] || '句笺');
const serialLabel = computed(() => props.quote.id ? `#${String(props.quote.id).padStart(4, '0')}` : '未编号');
const statusLabel = computed(() => {
    if (props.loading) return '取句中';
    if (props.isHolding) return '凝听';
    return props.isPlaying ? '有声' : '静读';
});

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

.quote-stage {
    position: relative;
    isolation: isolate;
    transform: translateZ(0);
    padding-top: 2.2rem;
}

.quote-stage--wallpaper {
    min-height: min(72vh, 48rem);
    cursor: default;
    animation: quote-wallpaper-drift 16s ease-in-out infinite;
}

.quote-stage--holding {
    transform: translateZ(0) scale(1.018);
}

.quote-stage__halo {
    position: absolute;
    width: min(70vw, 46rem);
    aspect-ratio: 1 / 0.56;
    border-radius: 999px;
    opacity: 0.54;
    filter: blur(28px);
    background: radial-gradient(circle, rgba(218, 191, 129, 0.22), transparent 68%);
    transform: translateY(4%);
    transition: opacity 500ms ease, transform 500ms ease;
    z-index: -1;
}

.quote-stage__seal {
    position: absolute;
    right: max(12%, 2rem);
    top: 18%;
    display: grid;
    width: 3rem;
    aspect-ratio: 1;
    place-items: center;
    border: 1px solid rgba(194, 71, 56, 0.7);
    color: rgba(194, 71, 56, 0.78);
    font-family: "Songti SC", serif;
    font-size: 1.55rem;
    line-height: 1;
    opacity: 0;
    transform: rotate(-10deg) scale(1.4);
    transition: none;
}

.quote-stage__folio {
    position: absolute;
    top: 0;
    left: 50%;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-height: 2.25rem;
    border: 1px solid;
    border-radius: 999px;
    padding: 0 0.9rem;
    font-family: Arial, "Microsoft YaHei", sans-serif;
    font-size: 0.72rem;
    letter-spacing: 0.12em;
    transform: translateX(-50%);
    backdrop-filter: blur(18px);
}

.quote-stage__folio--dark {
    border-color: rgba(255, 255, 255, 0.1);
    background: rgba(10, 10, 10, 0.18);
    color: rgba(238, 229, 211, 0.62);
}

.quote-stage__folio--light {
    border-color: rgba(0, 0, 0, 0.1);
    background: rgba(255, 255, 255, 0.28);
    color: rgba(38, 32, 24, 0.62);
}

.quote-stage__folio strong {
    color: #d8b46c;
    font-weight: 700;
}

.quote-stage--wallpaper .quote-stage__seal {
    display: none;
}

.quote-stage--saved .quote-stage__seal {
    animation: seal-drop 880ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.quote-stage--light .quote-stage__halo {
    background: radial-gradient(circle, rgba(121, 82, 46, 0.13), transparent 70%);
}

.quote-stage--playing .quote-stage__halo {
    opacity: 0.88;
    animation: halo-breathe 4s ease-in-out infinite;
}

.quote-stage__text-wrap {
    max-width: min(82vw, 66rem);
}

.quote-stage--wallpaper .quote-stage__text-wrap {
    max-width: min(76vw, 72rem);
    margin-bottom: clamp(2rem, 5vh, 4.5rem);
}

.quote-stage__text {
    text-shadow: 0 18px 50px rgba(0,0,0,0.38);
    letter-spacing: 0.02em;
    transition: letter-spacing 420ms ease, filter 420ms ease, transform 420ms ease;
}

.quote-stage--wallpaper .quote-stage__text {
    color: rgba(248, 240, 220, 0.92);
    text-shadow:
        0 1px 0 rgba(255, 255, 255, 0.08),
        0 24px 70px rgba(0, 0, 0, 0.52),
        0 0 42px rgba(220, 187, 121, 0.12);
}

.quote-stage--holding .quote-stage__text {
    letter-spacing: 0.045em;
    filter: saturate(1.08);
    transform: translateY(-0.08em);
}

.quote-stage__line {
    text-wrap: balance;
}

.quote-stage--wallpaper .quote-stage__line {
    max-width: 13em;
}

.quote-stage__glyph {
    display: inline-block;
    min-width: 0.08em;
    opacity: 0;
    transform: translateY(0.42em);
    filter: blur(8px);
    animation: glyph-arrive 620ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.vertical-rl .quote-stage__glyph {
    transform: translateX(0.34em);
}

.quote-stage--light .quote-stage__text {
    text-shadow: 0 15px 42px rgba(76, 53, 28, 0.18);
}

.quote-mark {
    line-height: 1;
    font-family: Georgia, "Songti SC", serif;
    filter: blur(0.2px);
}

.quote-stage--wallpaper .quote-mark {
    opacity: 0.32;
}

.quote-stage__meta {
    letter-spacing: 0.07em;
}

.quote-stage__source {
    display: grid;
    justify-items: end;
    gap: 0.35rem;
    border-top: 1px solid;
    padding-top: 0.85rem;
}

.quote-stage__source--dark {
    border-color: rgba(255, 255, 255, 0.1);
}

.quote-stage__source--light {
    border-color: rgba(0, 0, 0, 0.1);
}

.quote-stage__source cite {
    font-size: clamp(1rem, 1.7vw, 1.35rem);
}

.quote-stage__source span {
    font-size: 0.82rem;
    letter-spacing: 0.14em;
    opacity: 0.66;
}

.quote-stage--wallpaper .quote-stage__meta {
    align-items: center;
    gap: 0.7rem;
    color: rgba(232, 220, 195, 0.66);
    font-size: clamp(1rem, 1.6vw, 1.45rem);
    letter-spacing: 0.16em;
}

.quote-stage--wallpaper .quote-stage__meta cite {
    border-color: rgba(232, 204, 145, 0.18);
    padding-bottom: 0.45rem;
}

.quote-stage--wallpaper .quote-stage__meta span {
    margin-top: 0;
    font-size: 0.88rem;
    letter-spacing: 0.18em;
    opacity: 0.62;
}

.quote-stage__signal {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.28rem;
    height: 1.4rem;
    opacity: 0.62;
}

.quote-stage__signal span {
    display: block;
    width: 2px;
    height: 0.45rem;
    border-radius: 999px;
    background: currentColor;
    transform-origin: center bottom;
}

.quote-stage__signal--playing span {
    animation: signal-rise 950ms ease-in-out infinite;
}

.quote-stage--holding .quote-stage__signal span {
    animation: signal-hold 680ms ease-in-out infinite;
    opacity: 0.95;
}

.vertical-rl .quote-stage__signal {
    flex-direction: column;
    width: 1.4rem;
    height: auto;
}

.vertical-rl .quote-stage__signal span {
    width: 0.45rem;
    height: 2px;
}

/* Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
    transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-slide-enter-from {
    opacity: 0;
    transform: translateY(16px) scale(0.985);
    filter: blur(8px);
}

.fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-14px) scale(0.985);
    filter: blur(8px);
}

@keyframes signal-rise {
    0%, 100% { transform: scaleY(0.45); opacity: 0.45; }
    45% { transform: scaleY(1.9); opacity: 1; }
}

@keyframes signal-hold {
    0%, 100% { transform: scaleY(0.75); }
    50% { transform: scaleY(2.35); }
}

@keyframes halo-breathe {
    0%, 100% { transform: translateY(4%) scale(0.96); }
    50% { transform: translateY(1%) scale(1.05); }
}

@keyframes quote-wallpaper-drift {
    0%, 100% {
        transform: translate3d(0, 0.2rem, 0) scale(1);
    }
    50% {
        transform: translate3d(0, -0.25rem, 0) scale(1.006);
    }
}

@keyframes glyph-arrive {
    to {
        opacity: 1;
        transform: translate(0, 0);
        filter: blur(0);
    }
}

@keyframes seal-drop {
    0% {
        opacity: 0;
        transform: rotate(-16deg) scale(1.8);
        filter: blur(5px);
    }
    28% {
        opacity: 0.9;
        transform: rotate(-8deg) scale(0.92);
        filter: blur(0);
    }
    78% {
        opacity: 0.82;
        transform: rotate(-8deg) scale(1);
    }
    100% {
        opacity: 0;
        transform: rotate(-8deg) scale(1);
    }
}

@media (max-width: 767px) {
    .quote-stage {
        min-height: 54vh;
        padding-top: 2.6rem;
    }

    .quote-stage__text-wrap {
        max-width: min(86vw, 34rem);
    }

    .quote-stage__text {
        line-height: 1.78;
    }

    .quote-stage--wallpaper .quote-stage__text-wrap {
        max-width: min(84vw, 32rem);
    }

    .quote-stage__folio {
        max-width: min(86vw, 24rem);
        gap: 0.5rem;
        white-space: nowrap;
    }

    .quote-stage__source {
        justify-items: center;
        text-align: center;
    }
}

@media (prefers-reduced-motion: reduce) {
    .quote-stage--playing .quote-stage__halo,
    .quote-stage__signal--playing span,
    .quote-stage--holding .quote-stage__signal span,
    .quote-stage--saved .quote-stage__seal,
    .quote-stage__glyph,
    .quote-stage--wallpaper {
        animation: none;
        opacity: 1;
        transform: none;
        filter: none;
    }
}
</style>
