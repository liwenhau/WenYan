<template>
    <div class="live-console absolute bottom-5 md:bottom-8 left-1/2 -translate-x-1/2 grid text-xs font-sans transition-all duration-300"
         :class="isDark ? 'text-neutral-400' : 'text-neutral-600'">
        <div class="live-console__primary">
            <span class="live-console__dot" :class="{ 'live-console__dot--on': isPlaying || isHolding, 'live-console__dot--hold': isHolding }"></span>
            <strong>{{ statusLabel }}</strong>
            <span>{{ modeLabel }}</span>
        </div>
        <div class="live-console__secondary">
            <span>{{ detailLine }}</span>
            <span class="live-console__divider"></span>
            <span>{{ categoryLabel }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { BackgroundMode } from '../composables/useHomeLogic';
import { scenePresetMap } from '../constants/scenes';

const props = defineProps<{
  isDark: boolean;
  isPlaying: boolean;
  isHolding: boolean;
  currentMusicTitle: string;
  backgroundMode: BackgroundMode;
  currentCategory: string | null;
}>();

const categoryNames: Record<string, string> = {
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

const modeLabel = computed(() => scenePresetMap[props.backgroundMode].label);
const sceneLine = computed(() => scenePresetMap[props.backgroundMode].line);
const detailLine = computed(() => props.isPlaying ? `网易云 · ${props.currentMusicTitle}` : sceneLine.value);
const categoryLabel = computed(() => props.currentCategory ? categoryNames[props.currentCategory] || '分类' : '随机');
const statusLabel = computed(() => {
    if (props.isHolding) return '凝听中';
    return props.isPlaying ? '有声阅读' : '静候一言';
});
</script>

<style scoped>
.live-console {
    min-height: 2rem;
    grid-template-columns: auto auto;
    align-items: center;
    gap: 0.25rem 1rem;
    padding: 0.5rem 0.85rem;
    border: 1px solid rgba(216, 180, 108, 0.16);
    border-radius: 0.55rem;
    background: rgba(10, 10, 10, 0.16);
    backdrop-filter: blur(14px);
    letter-spacing: 0.08em;
    opacity: 0.72;
}

.live-console:hover {
    opacity: 1;
}

.live-console__primary,
.live-console__secondary {
    display: flex;
    align-items: center;
    min-width: 0;
}

.live-console__primary {
    gap: 0.55rem;
}

.live-console__primary strong {
    color: #d8b46c;
    font-weight: 700;
    white-space: nowrap;
}

.live-console__secondary {
    gap: 0.65rem;
    opacity: 0.72;
    white-space: nowrap;
}

.live-console__dot {
    width: 0.48rem;
    height: 0.48rem;
    border-radius: 999px;
    background: currentColor;
    opacity: 0.42;
}

.live-console__dot--on {
    opacity: 1;
    background: #d8b46c;
    box-shadow: 0 0 16px rgba(216, 180, 108, 0.8);
    animation: live-dot 1.6s ease-in-out infinite;
}

.live-console__dot--hold {
    background: #9fc3b3;
    box-shadow: 0 0 18px rgba(159, 195, 179, 0.9);
}

.live-console__divider {
    width: 1px;
    height: 0.85rem;
    background: currentColor;
    opacity: 0.24;
}

@keyframes live-dot {
    0%, 100% { transform: scale(0.82); }
    50% { transform: scale(1.16); }
}

@media (max-width: 767px) {
    .live-console {
        bottom: 1rem;
        max-width: calc(100vw - 2rem);
        grid-template-columns: 1fr;
        justify-items: center;
        text-align: center;
    }

    .live-console__secondary {
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
    }
}

@media (prefers-reduced-motion: reduce) {
    .live-console__dot--on {
        animation: none;
    }
}
</style>
