<template>
    <header class="studio-console relative z-10 flex md:flex-col justify-between items-center p-4 md:px-4 md:py-5 md:w-20 lg:w-24 md:h-full border-b md:border-b-0 md:border-r backdrop-blur-sm transition-all duration-500 ease-in-out"
            :class="isDark ? 'border-white/10 bg-[#121211]/70' : 'border-black/10 bg-[#efe8d6]/70'">
        <!-- Logo / Title -->
        <div class="flex-shrink-0 cursor-pointer group" role="button" tabindex="0" aria-label="换一句" @click.stop="emit('fetchQuote')" @keydown.enter.stop="emit('fetchQuote')" @keydown.space.prevent.stop="emit('fetchQuote')">
            <h1 class="heti--vertical text-3xl font-bold tracking-widest transition-colors duration-500" 
                style="font-family: 'Songti SC', serif;"
                :class="isDark ? 'text-white/90 group-hover:text-white' : 'text-black/80 group-hover:text-black'">
                聞言
            </h1>
        </div>

        <!-- Actions -->
        <div class="studio-console__actions flex md:flex-col gap-2 md:gap-3 items-center overflow-x-auto md:overflow-x-visible md:overflow-y-auto" @click.stop>
            <n-badge :value="likes" :max="999" show-zero :offset="[-5, 5]">
                <button 
                    class="console-button w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95"
                    :aria-label="isLiked ? '取消收藏' : '收藏当前句子'"
                    :class="[
                        isLiked ? 'text-red-500' : (isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-black'),
                        isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'
                    ]"
                    @click="emit('toggleLike')">
                    <n-icon size="22">
                        <Heart12Filled />
                    </n-icon>
                </button>
            </n-badge>

            <n-tooltip trigger="hover" placement="right">
                <template #trigger>
                    <button 
                    class="console-button w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                    :disabled="!hasHistory"
                    aria-label="上一句"
                        :class="isDark ? 'text-neutral-400 hover:text-white hover:bg-white/10' : 'text-neutral-500 hover:text-black hover:bg-black/5'"
                        @click="emit('restorePrevious')">
                        <n-icon size="20">
                            <ArrowUndo24Regular />
                        </n-icon>
                    </button>
                </template>
                上一句
            </n-tooltip>

            <n-tooltip trigger="hover" placement="right">
                <template #trigger>
                    <button 
                        class="console-button w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95"
                        aria-label="打开收藏"
                        :class="isDark ? 'text-neutral-400 hover:text-white hover:bg-white/10' : 'text-neutral-500 hover:text-black hover:bg-black/5'"
                        @click="emit('openFavorites')">
                        <n-icon size="20">
                            <Collections24Regular /> 
                        </n-icon>
                    </button>
                </template>
                我的收藏
            </n-tooltip>

            <n-tooltip trigger="hover" placement="right">
                <template #trigger>
                    <button 
                        class="console-button w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95"
                        :aria-label="isPlaying ? '暂停背景音乐' : '播放背景音乐'"
                        :class="[
                            isPlaying ? 'text-[#d8b46c]' : (isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-black'),
                            isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'
                        ]"
                        @click="emit('toggleMusic')">
                        <n-icon size="22" :class="{'animate-spin-slow': isPlaying}">
                            <MusicNote120Filled />
                        </n-icon>
                    </button>
                </template>
                {{ isPlaying ? '静场' : '入场' }}
            </n-tooltip>

            <n-tooltip trigger="hover" placement="right">
                <template #trigger>
                    <button 
                        class="console-button w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95"
                        aria-label="打开音场面板"
                        :class="customMusicTrack ? 'text-[#d8b46c]' : (isDark ? 'text-neutral-400 hover:text-white hover:bg-white/10' : 'text-neutral-500 hover:text-black hover:bg-black/5')"
                        @click="emit('openMusicPanel')">
                        <n-icon size="20">
                            <Search24Regular />
                        </n-icon>
                    </button>
                </template>
                音场面板
            </n-tooltip>

            <n-tooltip trigger="hover" placement="right">
                <template #trigger>
                    <button 
                        class="console-button w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95"
                        :aria-label="`切换现场：${backgroundModeNames[backgroundMode].label}`"
                        :class="isDark ? 'text-neutral-400 hover:text-white hover:bg-white/10' : 'text-neutral-500 hover:text-black hover:bg-black/5'"
                        @click="emit('toggleBackgroundMode')">
                        <n-icon size="20">
                            <ColorBackground24Regular /> 
                        </n-icon>
                    </button>
                </template>
                切换现场: {{ backgroundModeNames[backgroundMode].label }}
            </n-tooltip>

            <n-popover v-model:show="showToolsPopover" trigger="click" :placement="toolPopoverPlacement" :show-arrow="false" style="padding: 0; background: transparent; box-shadow: none;">
                <template #trigger>
                    <button
                        class="console-button w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95"
                        aria-label="更多工具"
                        :class="[
                            isDark ? 'text-neutral-400 hover:text-white hover:bg-white/10' : 'text-neutral-500 hover:text-black hover:bg-black/5',
                            showToolsPopover ? (isDark ? 'text-white bg-white/10' : 'text-black bg-black/5') : ''
                        ]">
                        <n-icon size="22">
                            <MoreHorizontal24Regular />
                        </n-icon>
                    </button>
                </template>
                <div class="console-tools backdrop-blur-md border shadow-xl"
                     :class="isDark ? 'bg-[#161615]/95 border-white/10 text-neutral-100' : 'bg-[#f7f1e3]/95 border-black/10 text-neutral-900'">
                    <section class="console-tools__section">
                        <div class="console-tools__label">阅读</div>
                        <div class="console-tools__grid">
                            <button class="console-tools__item"
                                    :class="[toolItemClass, isVertical ? toolActiveClass : '']"
                                    :aria-label="isVertical ? '切换横排' : '切换竖排'"
                                    @click="handleVerticalToggle">
                                <n-icon size="18">
                                    <TextDirectionVertical24Regular v-if="!isVertical" />
                                    <TextDirectionHorizontalLeft24Regular v-else />
                                </n-icon>
                                <span>{{ isVertical ? '横排' : '竖排' }}</span>
                            </button>
                            <button class="console-tools__item"
                                    :class="toolItemClass"
                                    aria-label="复制当前句子"
                                    @click="handleCopyQuote">
                                <n-icon size="18">
                                    <Copy16Regular />
                                </n-icon>
                                <span>复制</span>
                            </button>
                            <button class="console-tools__item"
                                    :class="toolItemClass"
                                    aria-label="打开分享卡片"
                                    @click="handleOpenShare">
                                <n-icon size="18">
                                    <ShareAndroid24Regular />
                                </n-icon>
                                <span>分享</span>
                            </button>
                        </div>
                    </section>

                    <section class="console-tools__section">
                        <div class="console-tools__label">分类</div>
                        <div class="console-tools__category-list">
                            <button v-for="cat in categories"
                                    :key="cat.label"
                                    class="console-tools__category"
                                    :class="[
                                        toolItemClass,
                                        currentCategory === cat.value ? toolActiveClass : ''
                                    ]"
                                    @click="handleCategorySelect(cat.value)">
                                <n-icon size="17" class="opacity-80">
                                    <component :is="cat.icon" />
                                </n-icon>
                                <span>{{ cat.label }}</span>
                            </button>
                        </div>
                    </section>

                    <section class="console-tools__section">
                        <div class="console-tools__label">现场</div>
                        <div class="console-tools__scene-grid">
                            <button v-for="mode in backgroundModes"
                                    :key="mode"
                                    class="console-tools__item console-tools__scene"
                                    :class="[
                                        toolItemClass,
                                        backgroundMode === mode ? toolActiveClass : ''
                                    ]"
                                    @click="handleBackgroundSelect(mode)">
                                <span class="console-tools__scene-dot"
                                      :style="{ background: backgroundModeNames[mode].accent }"></span>
                                <span>{{ backgroundModeNames[mode].label }}</span>
                            </button>
                        </div>
                    </section>

                    <section class="console-tools__section">
                        <div class="console-tools__label">桌面</div>
                        <div class="console-tools__grid">
                            <button class="console-tools__item"
                                    :class="toolItemClass"
                                    aria-label="打开桌面壁纸设置"
                                    @click="handleOpenWallpaper">
                                <n-icon size="18">
                                    <Wallpaper24Regular />
                                </n-icon>
                                <span>壁纸</span>
                            </button>
                            <button class="console-tools__item"
                                    :class="toolItemClass"
                                    :aria-label="isDark ? '切换亮色' : '切换暗色'"
                                    @click="handleThemeToggle">
                                <n-icon size="18">
                                    <WeatherSunny24Regular v-if="isDark" />
                                    <DarkTheme24Regular v-else />
                                </n-icon>
                                <span>{{ isDark ? '亮色' : '暗色' }}</span>
                            </button>
                        </div>
                    </section>
                </div>
            </n-popover>

        </div>
    </header>
</template>

<script setup lang="ts">
import { 
    Heart12Filled, 
    MusicNote120Filled, 
    Copy16Regular, 
    Wallpaper24Regular,
    DarkTheme24Regular, 
    WeatherSunny24Regular,
    ShareAndroid24Regular,
    Collections24Regular,
    Sparkle24Regular,
    MoviesAndTv24Regular,
    BookOpen24Regular,
    Games24Regular,
    Book24Regular,
    Open24Regular,
    Globe24Regular,
    MoreHorizontal24Regular,
    Video24Regular,
    TextQuote24Regular,
    Headphones24Regular,
    Lightbulb24Regular,
    EmojiLaugh24Regular,
    TextDirectionVertical24Regular,
    TextDirectionHorizontalLeft24Regular,
    ColorBackground24Regular,
    ArrowUndo24Regular,
    Search24Regular
} from '@vicons/fluent';
import { computed, onBeforeUnmount, onMounted, shallowRef, ref } from 'vue';
import type { BackgroundMode, MusicTrack } from '../composables/useHomeLogic';
import { scenePresetMap, scenePresets } from '../constants/scenes';

const props = defineProps<{
  likes: number;
  isLiked: boolean;
  hasHistory: boolean;
  isPlaying: boolean;
  customMusicTrack: MusicTrack | null;
  isDark: boolean;
  isVertical: boolean;
  backgroundMode: BackgroundMode;
  currentCategory: string | null;
}>();

const emit = defineEmits<{
  (e: 'fetchQuote'): void;
  (e: 'toggleLike'): void;
  (e: 'restorePrevious'): void;
  (e: 'toggleMusic'): void;
  (e: 'openMusicPanel'): void;
  (e: 'toggleVertical'): void;
  (e: 'toggleBackgroundMode'): void;
  (e: 'setBackgroundMode', mode: BackgroundMode): void;
  (e: 'copyQuote'): void;
  (e: 'toggleTheme'): void;
  (e: 'setCategory', category: string | null): void;
  (e: 'openShare'): void;
  (e: 'openWallpaper'): void;
  (e: 'openFavorites'): void;
}>();

const showToolsPopover = ref(false);
const toolPopoverPlacement = ref('right-start');
const backgroundModes = scenePresets.map(scene => scene.mode);
const backgroundModeNames = scenePresetMap;

let removePlacementListener: (() => void) | null = null;

onMounted(() => {
    const query = window.matchMedia('(max-width: 767px)');
    const updatePlacement = () => {
        toolPopoverPlacement.value = query.matches ? 'bottom-end' : 'right-start';
    };

    updatePlacement();

    if (query.addEventListener) {
        query.addEventListener('change', updatePlacement);
        removePlacementListener = () => query.removeEventListener('change', updatePlacement);
        return;
    }

    query.addListener(updatePlacement);
    removePlacementListener = () => query.removeListener(updatePlacement);
});

onBeforeUnmount(() => {
    removePlacementListener?.();
});

const toolItemClass = computed(() => props.isDark
    ? 'text-neutral-200 hover:bg-white/10'
    : 'text-neutral-700 hover:bg-black/5');

const toolActiveClass = computed(() => props.isDark
    ? 'bg-white/10 text-white ring-1 ring-white/10'
    : 'bg-black/5 text-black ring-1 ring-black/10');

const closeTools = () => {
    showToolsPopover.value = false;
};

const handleCategorySelect = (category: string | null) => {
    emit('setCategory', category);
    closeTools();
};

const handleVerticalToggle = () => {
    emit('toggleVertical');
    closeTools();
};

const handleCopyQuote = () => {
    emit('copyQuote');
    closeTools();
};

const handleOpenShare = () => {
    emit('openShare');
    closeTools();
};

const handleBackgroundSelect = (mode: BackgroundMode) => {
    emit('setBackgroundMode', mode);
    closeTools();
};

const handleOpenWallpaper = () => {
    emit('openWallpaper');
    closeTools();
};

const handleThemeToggle = () => {
    emit('toggleTheme');
    closeTools();
};

const categories = [
    { label: '随机推荐', value: null, icon: shallowRef(Sparkle24Regular) },
    { label: '动画', value: 'a', icon: shallowRef(MoviesAndTv24Regular) },
    { label: '漫画', value: 'b', icon: shallowRef(BookOpen24Regular) },
    { label: '游戏', value: 'c', icon: shallowRef(Games24Regular) },
    { label: '文学', value: 'd', icon: shallowRef(Book24Regular) },
    { label: '原创', value: 'e', icon: shallowRef(Open24Regular) },
    { label: '来自网络', value: 'f', icon: shallowRef(Globe24Regular) },
    { label: '其他', value: 'g', icon: shallowRef(MoreHorizontal24Regular) },
    { label: '影视', value: 'h', icon: shallowRef(Video24Regular) },
    { label: '诗词', value: 'i', icon: shallowRef(TextQuote24Regular) },
    { label: '网易云', value: 'j', icon: shallowRef(Headphones24Regular) },
    { label: '哲学', value: 'k', icon: shallowRef(Lightbulb24Regular) },
    { label: '抖机灵', value: 'l', icon: shallowRef(EmojiLaugh24Regular) },
];
</script>

<style scoped>
.studio-console {
    box-shadow: inset -1px 0 rgba(255, 255, 255, 0.04), 0 0 50px rgba(0, 0, 0, 0.12);
    min-width: 0;
}

.studio-console__actions {
    max-width: 100%;
    scrollbar-width: none;
    -ms-overflow-style: none;
}

.studio-console__actions::-webkit-scrollbar {
    display: none;
}

@media (min-width: 768px) {
    .studio-console__actions {
        max-height: calc(100vh - 8.5rem);
        padding: 0.35rem 0.2rem;
        mask-image: linear-gradient(to bottom, transparent, black 1rem, black calc(100% - 1rem), transparent);
    }
}

.console-button {
    position: relative;
}

.console-button::after {
    content: "";
    position: absolute;
    inset: -0.35rem;
    border-radius: 999px;
    border: 1px solid currentColor;
    opacity: 0;
    transform: scale(0.72);
    transition: opacity 260ms ease, transform 260ms ease;
}

.console-button:hover::after,
.console-button:focus-visible::after {
    opacity: 0.18;
    transform: scale(1);
}

.console-button:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 4px;
}

.heti--vertical {
    writing-mode: vertical-rl;
    text-orientation: upright;
    letter-spacing: 0.1em;
}

.console-tools {
    width: min(22rem, calc(100vw - 2rem));
    max-height: min(34rem, calc(100vh - 2rem));
    overflow-y: auto;
    border-radius: 0.75rem;
    padding: 0.85rem;
    box-shadow: 0 24px 70px rgba(0, 0, 0, 0.28);
    scrollbar-width: thin;
}

.console-tools__section + .console-tools__section {
    margin-top: 0.85rem;
    padding-top: 0.85rem;
    border-top: 1px solid currentColor;
    border-color: color-mix(in srgb, currentColor 10%, transparent);
}

.console-tools__label {
    margin-bottom: 0.45rem;
    font-size: 0.72rem;
    line-height: 1;
    letter-spacing: 0;
    opacity: 0.56;
}

.console-tools__grid,
.console-tools__scene-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.45rem;
}

.console-tools__scene-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
}

.console-tools__category-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.4rem;
}

.console-tools__item,
.console-tools__category {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 2.35rem;
    gap: 0.4rem;
    border-radius: 0.5rem;
    padding: 0 0.55rem;
    font-size: 0.82rem;
    line-height: 1;
    transition: background-color 180ms ease, color 180ms ease, box-shadow 180ms ease, transform 180ms ease;
}

.console-tools__category {
    justify-content: flex-start;
}

.console-tools__item:active,
.console-tools__category:active {
    transform: scale(0.98);
}

.console-tools__item:focus-visible,
.console-tools__category:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
}

.console-tools__scene-dot {
    width: 0.55rem;
    height: 0.55rem;
    flex: 0 0 auto;
    border-radius: 999px;
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.08);
}

@media (max-width: 767px) {
    .console-tools {
        width: min(21rem, calc(100vw - 1rem));
        max-height: min(30rem, calc(100vh - 5rem));
    }
}

.animate-spin-slow {
    animation: spin 8s linear infinite;
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
</style>
