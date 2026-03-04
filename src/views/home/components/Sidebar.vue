<template>
    <header class="relative z-10 flex md:flex-col justify-between items-center p-6 md:w-24 md:h-full border-b md:border-b-0 md:border-r backdrop-blur-sm transition-all duration-500 ease-in-out"
            :class="isDark ? 'border-white/5 bg-[#1a1a1a]/80' : 'border-black/5 bg-[#f5f5f5]/80'">
        <!-- Logo / Title -->
        <div class="flex-shrink-0 cursor-pointer group" @click.stop="emit('fetchQuote')">
            <h1 class="heti--vertical text-3xl font-bold tracking-widest transition-colors duration-500" 
                style="font-family: 'Songti SC', serif;"
                :class="isDark ? 'text-white/90 group-hover:text-white' : 'text-black/80 group-hover:text-black'">
                聞言
            </h1>
        </div>

        <!-- Actions -->
        <div class="flex md:flex-col gap-6 items-center" @click.stop>
            <n-badge :value="likes" :max="999" show-zero :offset="[-5, 5]">
                <button 
                    class="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95"
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
                        class="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95"
                        :class="isDark ? 'text-neutral-400 hover:text-white hover:bg-white/10' : 'text-neutral-500 hover:text-black hover:bg-black/5'"
                        @click="emit('toggleVertical')">
                        <n-icon size="20">
                            <TextDirectionVertical24Regular v-if="!isVertical" />
                            <TextDirectionHorizontalLeft24Regular v-else />
                        </n-icon>
                    </button>
                </template>
                {{ isVertical ? '切换横排' : '切换竖排' }}
            </n-tooltip>

            <n-tooltip trigger="hover" placement="right">
                <template #trigger>
                    <button 
                        class="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95"
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
                        class="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95"
                        :class="[
                            isPlaying ? 'text-blue-400' : (isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-black'),
                            isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'
                        ]"
                        @click="emit('toggleMusic')">
                        <n-icon size="22" :class="{'animate-spin-slow': isPlaying}">
                            <MusicNote120Filled />
                        </n-icon>
                    </button>
                </template>
                {{ isPlaying ? '暂停音乐' : '播放音乐' }}
            </n-tooltip>

             <n-tooltip trigger="hover" placement="right">
                <template #trigger>
                    <button 
                        class="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95"
                        :class="isDark ? 'text-neutral-400 hover:text-white hover:bg-white/10' : 'text-neutral-500 hover:text-black hover:bg-black/5'"
                        @click="emit('copyQuote')">
                        <n-icon size="20">
                            <Copy16Regular /> 
                        </n-icon>
                    </button>
                </template>
                复制
            </n-tooltip>

            <n-popover v-model:show="showCategoryPopover" trigger="click" placement="right-start" :show-arrow="false" style="padding: 0; background: transparent; box-shadow: none;">
                <template #trigger>
                    <button 
                        class="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95"
                        :class="[
                            isDark ? 'text-neutral-400 hover:text-white hover:bg-white/10' : 'text-neutral-500 hover:text-black hover:bg-black/5',
                            currentCategory ? (isDark ? 'text-white bg-white/10' : 'text-black bg-black/5') : ''
                        ]">
                        <n-icon size="20">
                            <AppsListDetail24Regular />
                        </n-icon>
                    </button>
                </template>
                <div class="backdrop-blur-md rounded-lg overflow-hidden border shadow-xl w-40 py-1 max-h-64 overflow-y-auto"
                     :class="isDark ? 'bg-[#1a1a1a]/90 border-white/10' : 'bg-[#f5f5f5]/90 border-black/5'">
                    <div v-for="cat in categories" :key="cat.label"
                         class="px-3 py-2 text-sm cursor-pointer transition-colors flex items-center gap-3"
                         :class="[
                            isDark ? 'hover:bg-white/10 text-neutral-300 hover:text-white' : 'hover:bg-black/5 text-neutral-600 hover:text-black',
                            currentCategory === cat.value ? (isDark ? 'text-white bg-white/5 font-medium' : 'text-black bg-black/5 font-medium') : ''
                         ]"
                         @click="handleCategorySelect(cat.value)">
                        <n-icon size="18" class="opacity-80">
                            <component :is="cat.icon" />
                        </n-icon>
                        <span class="flex-grow">{{ cat.label }}</span>
                        <div v-if="currentCategory === cat.value" class="w-1.5 h-1.5 rounded-full bg-current"></div>
                    </div>
                </div>
            </n-popover>

            <n-tooltip trigger="hover" placement="right">
                <template #trigger>
                    <button 
                        class="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95"
                        :class="isDark ? 'text-neutral-400 hover:text-white hover:bg-white/10' : 'text-neutral-500 hover:text-black hover:bg-black/5'"
                        @click="emit('openShare')">
                        <n-icon size="20">
                            <ShareAndroid24Regular /> 
                        </n-icon>
                    </button>
                </template>
                分享卡片
            </n-tooltip>

            <n-tooltip trigger="hover" placement="right">
                <template #trigger>
                    <button 
                        class="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95"
                        :class="isDark ? 'text-neutral-400 hover:text-white hover:bg-white/10' : 'text-neutral-500 hover:text-black hover:bg-black/5'"
                        @click="emit('toggleBackgroundMode')">
                        <n-icon size="20">
                            <ColorBackground24Regular /> 
                        </n-icon>
                    </button>
                </template>
                切换背景: {{ {noise: '噪点', ink: '水墨', particles: '粒子'}[backgroundMode] }}
            </n-tooltip>

            <div class="w-8 h-px transition-colors duration-500" 
                 :class="isDark ? 'bg-white/10' : 'bg-black/5'"></div>

            <n-tooltip trigger="hover" placement="right">
                <template #trigger>
                    <button 
                        class="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95"
                        :class="isDark ? 'text-neutral-400 hover:text-white hover:bg-white/10' : 'text-neutral-500 hover:text-black hover:bg-black/5'"
                        @click="emit('toggleTheme')">
                        <n-icon size="20">
                            <WeatherSunny24Regular v-if="isDark" />
                            <DarkTheme24Regular v-else />
                        </n-icon>
                    </button>
                </template>
                {{ isDark ? '切换亮色' : '切换暗色' }}
            </n-tooltip>
        </div>
    </header>
</template>

<script setup lang="ts">
import { 
    Heart12Filled, 
    MusicNote120Filled, 
    Copy16Regular, 
    DarkTheme24Regular, 
    WeatherSunny24Regular,
    AppsListDetail24Regular,
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
    ColorBackground24Regular
} from '@vicons/fluent';
import { shallowRef, ref } from 'vue';
import type { BackgroundMode } from '../composables/useHomeLogic';

defineProps<{
  likes: number;
  isLiked: boolean;
  isPlaying: boolean;
  isDark: boolean;
  isVertical: boolean;
  backgroundMode: BackgroundMode;
  currentCategory: string | null;
}>();

const emit = defineEmits<{
  (e: 'fetchQuote'): void;
  (e: 'toggleLike'): void;
  (e: 'toggleMusic'): void;
  (e: 'toggleVertical'): void;
  (e: 'toggleBackgroundMode'): void;
  (e: 'copyQuote'): void;
  (e: 'toggleTheme'): void;
  (e: 'setCategory', category: string | null): void;
  (e: 'openShare'): void;
  (e: 'openFavorites'): void;
}>();

const showCategoryPopover = ref(false);

const handleCategorySelect = (category: string | null) => {
    emit('setCategory', category);
    showCategoryPopover.value = false;
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
.heti--vertical {
    writing-mode: vertical-rl;
    text-orientation: upright;
    letter-spacing: 0.1em;
}

.animate-spin-slow {
    animation: spin 8s linear infinite;
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
</style>
