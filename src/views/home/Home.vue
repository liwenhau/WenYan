<template>
    <div class="relative w-full h-screen overflow-hidden font-serif select-none flex flex-col md:flex-row transition-colors duration-500"
         :class="[
             isDark ? 'bg-[#1a1a1a] text-[#e0e0e0]' : 'bg-[#f5f5f5] text-[#333]',
             isWallpaperMode ? 'stage-shell--wallpaper' : ''
         ]"
         :style="stageStyle"
         @mousemove="handlePointerMove"
         @mouseleave="resetPointer"
         @pointerdown="handleStagePointerDown"
         @touchstart.passive="handleTouchStart"
         @touchend="handleTouchEnd"
         @pointerup="handleStagePointerUp"
         @pointercancel="cancelHold"
         @pointerleave="handleStagePointerLeave"
         @click="handleBackgroundClick">
        
        <!-- Noise Texture Overlay -->
        <Background
            :mode="backgroundMode"
            :isDark="isDark"
            :isPlaying="isPlaying || isWallpaperMode"
            :loading="loading"
            :isHolding="isHolding"
            :pointerX="pointer.x"
            :pointerY="pointer.y"
            :lowPower="isLowPowerWallpaper"
            :wallpaperMode="isWallpaperMode"
        />
        <div v-if="isWallpaperMode" class="wallpaper-veil pointer-events-none absolute inset-0 z-[2]" aria-hidden="true">
            <div class="wallpaper-veil__scroll"></div>
            <div class="wallpaper-veil__grain"></div>
            <div class="wallpaper-veil__seal">聞</div>
        </div>
        <div class="ink-taps absolute inset-0 pointer-events-none z-[1]" aria-hidden="true">
            <span
                v-for="tap in inkTaps"
                :key="tap.id"
                class="ink-tap"
                :style="{ left: `${tap.x}%`, top: `${tap.y}%` }"
            ></span>
        </div>
        <transition name="hint-fade">
            <div v-if="showFirstHint && !isWallpaperMode" class="first-hint pointer-events-none absolute left-1/2 top-6 z-20 -translate-x-1/2 rounded-full px-4 py-2 text-xs font-sans tracking-[0.14em]"
                 :class="isDark ? 'bg-black/28 text-white/70 border border-white/10' : 'bg-white/42 text-black/60 border border-black/10'">
                按住凝听，松开换句 · 左右滑切现场
            </div>
        </transition>

        <!-- Sidebar / Header -->
        <Sidebar 
            v-if="!isWallpaperMode"
            :likes="likes"
            :isLiked="isLiked"
            :hasHistory="quoteHistory.length > 0"
            :isPlaying="isPlaying"
            :customMusicTrack="customMusicTrack"
            :isDark="isDark"
            :isVertical="isVertical"
            :backgroundMode="backgroundMode"
            :currentCategory="currentCategory"
            @fetchQuote="fetchQuote"
            @toggleLike="handleToggleLike"
            @restorePrevious="restorePreviousQuote"
            @toggleMusic="toggleMusic"
            @openMusicPanel="openMusicPanel"
            @toggleVertical="toggleVertical"
            @toggleBackgroundMode="toggleBackgroundMode"
            @copyQuote="copyQuote"
            @toggleTheme="toggleTheme"
            @setBackgroundMode="setBackgroundMode"
            @setCategory="setCategory"
            @openShare="openShare"
            @openWallpaper="openWallpaper"
            @openFavorites="openFavorites"
        />

        <!-- Main Content Area -->
        <main class="relative z-10 flex-grow flex flex-col justify-center items-center p-8 md:p-12 transition-opacity duration-700 ease-out" 
              :class="[
                  {'opacity-60 blur-sm': loading && !isWallpaperMode, 'opacity-100 blur-0': !loading || isWallpaperMode},
                  isWallpaperMode ? 'wallpaper-main' : ''
              ]">
            
            <!-- Decorative Elements -->
            <div v-if="!isWallpaperMode" class="stage-crosshair stage-crosshair--top" :class="isDark ? 'text-white/25' : 'text-black/20'"></div>
            <div v-if="!isWallpaperMode" class="stage-crosshair stage-crosshair--bottom" :class="isDark ? 'text-white/20' : 'text-black/15'"></div>

            <QuoteDisplay 
                :quote="quote" 
                :loading="loading" 
                :isDark="isDark"
                :isVertical="isVertical"
                :isPlaying="isPlaying"
                :isHolding="isHolding"
                :justSaved="justSaved"
                :wallpaperMode="isWallpaperMode"
                @fetchQuote="fetchQuote" 
            />

            <!-- Footer Instructions -->
            <FooterInstructions
                v-if="!isWallpaperMode && !showMusicPanel"
                :isDark="isDark"
                :isPlaying="isPlaying"
                :isHolding="isHolding"
                :currentMusicTitle="currentMusicTitle"
                :backgroundMode="backgroundMode"
                :currentCategory="currentCategory"
            />
        </main>

        <!-- Share Modal -->
        <ShareCard 
            v-if="showShare" 
            :show="showShare" 
            :quote="quote" 
            :isDark="isDark" 
            :backgroundMode="backgroundMode"
            @close="closeShare" 
        />

        <!-- Wallpaper Studio -->
        <WallpaperStudio
            v-if="showWallpaper"
            :quote="quote"
            :isDark="isDark"
            :backgroundMode="backgroundMode"
            @close="closeWallpaper"
        />

        <!-- Music Panel -->
        <MusicPanel
            v-if="showMusicPanel"
            :show="showMusicPanel"
            :isDark="isDark"
            :isPlaying="isPlaying"
            :currentMusicTitle="currentMusicTitle"
            :musicSearchLoading="musicSearchLoading"
            :musicSearchResults="musicSearchResults"
            :customMusicTrack="customMusicTrack"
            :qrLoginStatus="qrLoginStatus"
            :qrLoginImage="qrLoginImage"
            :neteaseApiAvailable="neteaseApiAvailable"
            :backgroundMode="backgroundMode"
            @close="closeMusicPanel"
            @toggleMusic="toggleMusic"
            @searchMusic="searchMusic"
            @selectMusicTrack="selectMusicTrack"
            @resetSceneMusic="resetSceneMusic"
            @startQrLogin="startQrLogin"
        />

        <!-- Favorites Drawer -->
        <FavoritesDrawer
            :show="showFavorites"
            :isDark="isDark"
            :favorites="favorites"
            @close="closeFavorites"
            @remove="removeFavorite"
            @select="handleFavoriteSelect"
        />
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, type CSSProperties } from 'vue';
import Background from './components/Background.vue';
import Sidebar from './components/Sidebar.vue';
import QuoteDisplay from './components/QuoteDisplay.vue';
import FooterInstructions from './components/FooterInstructions.vue';
import ShareCard from './components/ShareCard.vue';
import WallpaperStudio from './components/WallpaperStudio.vue';
import FavoritesDrawer from './components/FavoritesDrawer.vue';
import MusicPanel from './components/MusicPanel.vue';
import { useHomeLogic } from './composables/useHomeLogic';
import type { Hitokoto } from './types';
import type { BackgroundMode } from './composables/useHomeLogic';
import { scenePresets } from './constants/scenes';

const { 
    quote, 
    loading, 
    isLiked, 
    likes, 
    isPlaying, 
    currentMusicTitle,
    musicSearchLoading,
    musicSearchResults,
    customMusicTrack,
    qrLoginStatus,
    qrLoginImage,
    neteaseApiAvailable,
    isDark,
    isVertical,
    backgroundMode,
    currentCategory,
    favorites,
    quoteHistory,
    fetchQuote, 
    copyQuote, 
    toggleLike, 
    toggleMusic,
    searchMusic,
    selectMusicTrack,
    resetSceneMusic,
    startQrLogin,
    toggleTheme,
    toggleVertical,
    toggleBackgroundMode,
    setBackgroundMode,
    setCategory,
    removeFavorite,
    restorePreviousQuote,
    restoreQuote
} = useHomeLogic();

const showShare = ref(false);
const showWallpaper = ref(false);
const showFavorites = ref(false);
const showMusicPanel = ref(false);
const showFirstHint = ref(false);
const isWallpaperMode = ref(false);
const isLowPowerWallpaper = ref(false);
const pointer = reactive({ x: 50, y: 50 });
const isHolding = ref(false);
const holdStarted = ref(false);
const justSaved = ref(false);
const inkTaps = ref<Array<{ id: number; x: number; y: number }>>([]);
let holdTimer: number | null = null;
let tapId = 0;
let savedTimer: number | null = null;
let touchStart: { x: number; y: number; time: number } | null = null;

const stageStyle = computed<CSSProperties>(() => ({
    '--stage-pointer-x': `${pointer.x}%`,
    '--stage-pointer-y': `${pointer.y}%`
} as CSSProperties));

const openShare = () => {
    showShare.value = true;
};

const closeShare = () => {
    showShare.value = false;
};

const openWallpaper = () => {
    showWallpaper.value = true;
};

const closeWallpaper = () => {
    showWallpaper.value = false;
};

const openMusicPanel = () => {
    showMusicPanel.value = true;
};

const closeMusicPanel = () => {
    showMusicPanel.value = false;
};

const openFavorites = () => {
    showFavorites.value = true;
};

const closeFavorites = () => {
    showFavorites.value = false;
};

const stepScene = (direction: 1 | -1) => {
    const modes = scenePresets.map(scene => scene.mode);
    const currentIndex = modes.indexOf(backgroundMode.value);
    const nextIndex = (currentIndex + direction + modes.length) % modes.length;
    setBackgroundMode(modes[nextIndex] as BackgroundMode);
};

const handleToggleLike = () => {
    const willSave = !isLiked.value;
    toggleLike();
    if (!willSave) return;
    justSaved.value = true;
    if (savedTimer !== null) window.clearTimeout(savedTimer);
    savedTimer = window.setTimeout(() => {
        justSaved.value = false;
    }, 900);
};

const handleFavoriteSelect = (quote: Hitokoto) => {
    restoreQuote(quote);
    closeFavorites();
};

const handlePointerMove = (e: MouseEvent) => {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    pointer.x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
    pointer.y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));
};

const resetPointer = () => {
    pointer.x = 50;
    pointer.y = 50;
};

const isInteractiveTarget = (target: EventTarget | null) => {
    return target instanceof Element && Boolean(target.closest('button, [role="button"], input, textarea, select, a, .n-popover, .n-drawer'));
};

const isOverlayOpen = () => showShare.value || showWallpaper.value || showFavorites.value || showMusicPanel.value;

const addInkTap = (x: number, y: number) => {
    const id = ++tapId;
    inkTaps.value.push({ id, x, y });
    window.setTimeout(() => {
        inkTaps.value = inkTaps.value.filter(tap => tap.id !== id);
    }, 820);
};

const beginHold = () => {
    if (isOverlayOpen() || loading.value) return;
    if (holdTimer !== null) window.clearTimeout(holdTimer);
    holdStarted.value = true;
    holdTimer = window.setTimeout(() => {
        isHolding.value = true;
    }, 180);
};

const cancelHold = () => {
    if (holdTimer !== null) {
        window.clearTimeout(holdTimer);
        holdTimer = null;
    }
    holdStarted.value = false;
    isHolding.value = false;
};

const releaseHold = () => {
    const shouldShuffle = holdStarted.value && isHolding.value && !isOverlayOpen();
    cancelHold();
    if (shouldShuffle) {
        fetchQuote();
    }
};

const handleStagePointerDown = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return;
    if (isInteractiveTarget(e.target) || isOverlayOpen()) return;
    handlePointerMove(e);
    beginHold();
};

const handleStagePointerUp = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return;
    if (isInteractiveTarget(e.target) || isOverlayOpen()) {
        cancelHold();
        return;
    }
    handlePointerMove(e);
    addInkTap(pointer.x, pointer.y);
    releaseHold();
};

const handleStagePointerLeave = () => {
    resetPointer();
    if (isHolding.value) releaseHold();
};

const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length !== 1 || isInteractiveTarget(e.target) || isOverlayOpen()) return;
    const touch = e.touches[0];
    touchStart = { x: touch.clientX, y: touch.clientY, time: Date.now() };
};

const handleTouchEnd = (e: TouchEvent) => {
    if (!touchStart || isOverlayOpen()) {
        touchStart = null;
        return;
    }
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStart.x;
    const dy = touch.clientY - touchStart.y;
    const elapsed = Date.now() - touchStart.time;
    touchStart = null;

    if (elapsed > 650) return;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const threshold = 56;
    if (Math.max(absX, absY) < threshold) return;

    if (absX > absY * 1.25) {
        stepScene(dx < 0 ? 1 : -1);
        return;
    }

    if (absY > absX * 1.25) {
        if (dy < 0) openFavorites();
        else openShare();
    }
};

const handleKeydown = (e: KeyboardEvent) => {
    if (e.code !== 'Space' || e.repeat) return;
    const active = document.activeElement;
    if (active instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(active.tagName)) return;
    e.preventDefault();
    beginHold();
};

const handleKeyup = (e: KeyboardEvent) => {
    if (e.code !== 'Space') return;
    e.preventDefault();
    releaseHold();
};

const handleBackgroundClick = (e: MouseEvent) => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) return;
    // Prevent clicking background when modal is open
    if (showShare.value || showWallpaper.value || showFavorites.value || showMusicPanel.value) return;
    if (isInteractiveTarget(e.target)) return;
    if (isHolding.value || holdStarted.value) return;
    fetchQuote();
};

onMounted(() => {
    const params = new URLSearchParams(window.location.search);
    isWallpaperMode.value = params.get('wallpaper') === '1';
    isLowPowerWallpaper.value = isWallpaperMode.value && params.get('lowPower') === '1';
    const scene = params.get('scene') as BackgroundMode | null;
    if (scene && scenePresets.some(preset => preset.mode === scene)) {
        setBackgroundMode(scene, { silent: isWallpaperMode.value });
    }
    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('keyup', handleKeyup);
    if (isWallpaperMode.value) {
        if (params.get('autoMusic') !== '0' && !isPlaying.value) {
            toggleMusic();
        }
        return;
    }
    if (localStorage.getItem('wenyan-intro-seen') !== '1') {
        showFirstHint.value = true;
        localStorage.setItem('wenyan-intro-seen', '1');
        window.setTimeout(() => {
            showFirstHint.value = false;
        }, 3600);
    }
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
    window.removeEventListener('keyup', handleKeyup);
    if (holdTimer !== null) window.clearTimeout(holdTimer);
    if (savedTimer !== null) window.clearTimeout(savedTimer);
});
</script>

<style scoped>
/* Typography */
.font-serif {
    font-family: "Songti SC", "Noto Serif SC", "SimSun", serif;
}

.stage-shell--wallpaper {
    cursor: default;
}

.wallpaper-main {
    padding: clamp(2rem, 5vw, 5rem);
}

.wallpaper-veil {
    mix-blend-mode: screen;
}

.wallpaper-veil__scroll {
    position: absolute;
    left: 50%;
    top: 50%;
    width: min(78vw, 86rem);
    height: min(58vh, 34rem);
    border-top: 1px solid rgba(232, 204, 145, 0.2);
    border-bottom: 1px solid rgba(232, 204, 145, 0.16);
    transform: translate(-50%, -50%);
    opacity: 0.7;
    background:
        linear-gradient(90deg, transparent, rgba(232, 204, 145, 0.07) 18%, rgba(255, 255, 255, 0.035) 50%, rgba(232, 204, 145, 0.07) 82%, transparent),
        radial-gradient(ellipse at 50% 50%, rgba(255, 238, 184, 0.1), transparent 68%);
    filter: blur(0.1px);
    animation: wallpaper-scroll-breathe 18s ease-in-out infinite;
}

.wallpaper-veil__grain {
    position: absolute;
    inset: 0;
    opacity: 0.11;
    background-image:
        linear-gradient(115deg, transparent 0 42%, rgba(255,255,255,0.14) 43%, transparent 44% 100%),
        linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px);
    background-size: 18rem 100%, 9rem 9rem;
    animation: wallpaper-grain-drift 28s linear infinite;
}

.wallpaper-veil__seal {
    position: absolute;
    right: clamp(2.5rem, 8vw, 8rem);
    bottom: clamp(2.5rem, 8vh, 6rem);
    display: grid;
    width: clamp(3rem, 5vw, 4.6rem);
    aspect-ratio: 1;
    place-items: center;
    border: 1px solid rgba(184, 61, 48, 0.58);
    color: rgba(184, 61, 48, 0.68);
    font-family: "Songti SC", "Noto Serif SC", serif;
    font-size: clamp(1.55rem, 2.4vw, 2.35rem);
    line-height: 1;
    opacity: 0.58;
    transform: rotate(-7deg);
}

.ink-tap {
    position: absolute;
    width: 1rem;
    aspect-ratio: 1;
    border-radius: 999px;
    border: 1px solid rgba(216, 180, 108, 0.55);
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.2);
    animation: ink-tap 820ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
    box-shadow: 0 0 38px rgba(216, 180, 108, 0.2);
}

.first-hint {
    backdrop-filter: blur(16px);
    box-shadow: 0 18px 50px rgba(0, 0, 0, 0.12);
}

.hint-fade-enter-active,
.hint-fade-leave-active {
    transition: opacity 500ms ease, transform 500ms ease;
}

.hint-fade-enter-from,
.hint-fade-leave-to {
    opacity: 0;
    transform: translate(-50%, -0.5rem);
}

.stage-crosshair {
    position: absolute;
    width: 7.5rem;
    height: 7.5rem;
    pointer-events: none;
    opacity: 0.7;
    transform: translate3d(calc((var(--stage-pointer-x) - 50%) * 0.04), calc((var(--stage-pointer-y) - 50%) * 0.04), 0);
}

.stage-crosshair::before,
.stage-crosshair::after {
    content: "";
    position: absolute;
    background: currentColor;
}

.stage-crosshair::before {
    width: 100%;
    height: 1px;
}

.stage-crosshair::after {
    width: 1px;
    height: 100%;
}

.stage-crosshair--top {
    top: 2.5rem;
    right: 2.5rem;
}

.stage-crosshair--top::before,
.stage-crosshair--top::after {
    top: 0;
    right: 0;
}

.stage-crosshair--bottom {
    left: 2.5rem;
    bottom: 2.5rem;
}

.stage-crosshair--bottom::before,
.stage-crosshair--bottom::after {
    left: 0;
    bottom: 0;
}

@media (max-width: 767px) {
    .stage-crosshair {
        width: 4rem;
        height: 4rem;
    }

    .stage-crosshair--top {
        top: 5.75rem;
        right: 1.25rem;
    }

    .stage-crosshair--bottom {
        left: 1.25rem;
        bottom: 1.25rem;
    }
}

@keyframes ink-tap {
    12% {
        opacity: 0.8;
    }
    100% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(8);
    }
}

@keyframes wallpaper-scroll-breathe {
    0%, 100% {
        opacity: 0.56;
        transform: translate(-50%, -50%) scaleX(0.985);
    }
    50% {
        opacity: 0.82;
        transform: translate(-50%, -50%) scaleX(1.02);
    }
}

@keyframes wallpaper-grain-drift {
    from {
        background-position: 0 0, 0 0;
    }
    to {
        background-position: 18rem 0, 9rem 9rem;
    }
}

@media (prefers-reduced-motion: reduce) {
    .ink-tap,
    .wallpaper-veil__scroll,
    .wallpaper-veil__grain {
        animation: none;
    }
}
</style>
