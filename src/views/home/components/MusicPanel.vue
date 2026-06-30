<template>
    <div v-if="show" class="music-panel-layer fixed inset-0 z-40 pointer-events-none">
        <button class="music-panel-layer__scrim absolute inset-0 pointer-events-auto" aria-label="关闭音场面板" @click="emit('close')"></button>
        <aside class="music-panel pointer-events-auto"
               :class="isDark ? 'music-panel--dark' : 'music-panel--light'">
            <header class="music-panel__header">
                <div>
                    <p>音场</p>
                    <h2>背景音乐</h2>
                </div>
                <button class="music-panel__icon" aria-label="关闭音场面板" @click="emit('close')">
                    <n-icon size="20"><Dismiss24Regular /></n-icon>
                </button>
            </header>

            <section class="music-panel__now">
                <div class="music-panel__disc" :class="{ 'music-panel__disc--playing': isPlaying }">
                    <n-icon size="24"><MusicNote120Filled /></n-icon>
                </div>
                <div class="music-panel__track">
                    <span>{{ customMusicTrack ? '自选曲目' : sceneLabel }}</span>
                    <strong>{{ currentMusicTitle }}</strong>
                </div>
                <button class="music-panel__play" @click="emit('toggleMusic')">
                    <n-icon size="20">
                        <Pause24Regular v-if="isPlaying" />
                        <Play24Regular v-else />
                    </n-icon>
                    <span>{{ isPlaying ? '暂停' : '播放' }}</span>
                </button>
            </section>

            <section class="music-panel__section">
                <div class="music-panel__section-title">
                    <span>网易云搜索</span>
                    <button v-if="customMusicTrack" @click="emit('resetSceneMusic')">恢复现场默认</button>
                </div>
                <div v-if="!neteaseApiAvailable" class="music-panel__notice">
                    配置 VITE_NETEASE_API_BASE 后可搜索网易云歌曲；未配置时仍可播放现场默认曲目。
                </div>
                <div v-else class="music-panel__login">
                    <span>{{ qrStatusLabel }}</span>
                    <button @click="emit('startQrLogin')">获取二维码</button>
                </div>
                <div v-if="qrLoginImage" class="music-panel__qr">
                    <img :src="qrLoginImage" alt="网易云登录二维码" />
                    <span>用网易云音乐扫码</span>
                </div>
                <div class="music-panel__search">
                    <input v-model="keyword" type="search" placeholder="搜索歌曲" @keydown.enter="handleSearch" />
                    <button @click="handleSearch">
                        <n-icon size="18"><Search24Regular /></n-icon>
                    </button>
                </div>
            </section>

            <section class="music-panel__results">
                <div v-if="musicSearchLoading" class="music-panel__empty">搜索中...</div>
                <button
                    v-for="track in musicSearchResults"
                    v-else
                    :key="track.id"
                    class="music-panel__result"
                    @click="handleSelect(track)">
                    <span>{{ track.title }}</span>
                    <small>{{ track.artist || '未知艺人' }}</small>
                </button>
                <div v-if="!musicSearchLoading && musicSearchResults.length === 0" class="music-panel__empty">
                    {{ neteaseApiAvailable ? '搜索后会显示可选曲目' : '等待本地网易云 API' }}
                </div>
            </section>
        </aside>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import {
    Dismiss24Regular,
    MusicNote120Filled,
    Pause24Regular,
    Play24Regular,
    Search24Regular
} from '@vicons/fluent';
import type { BackgroundMode, MusicTrack } from '../composables/useHomeLogic';
import { scenePresetMap } from '../constants/scenes';

const props = defineProps<{
  show: boolean;
  isDark: boolean;
  isPlaying: boolean;
  currentMusicTitle: string;
  musicSearchLoading: boolean;
  musicSearchResults: MusicTrack[];
  customMusicTrack: MusicTrack | null;
  qrLoginStatus: 'idle' | 'waiting' | 'success' | 'expired' | 'error';
  qrLoginImage: string;
  neteaseApiAvailable: boolean;
  backgroundMode: BackgroundMode;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'toggleMusic'): void;
  (e: 'searchMusic', keyword: string): void;
  (e: 'selectMusicTrack', track: MusicTrack): void;
  (e: 'resetSceneMusic'): void;
  (e: 'startQrLogin'): void;
}>();

const keyword = ref('');

const sceneLabel = computed(() => scenePresetMap[props.backgroundMode].label);
const qrStatusLabel = computed(() => {
    const labels = {
        idle: '未登录',
        waiting: '等待扫码或确认',
        success: '已登录',
        expired: '已过期',
        error: '登录异常'
    };
    return labels[props.qrLoginStatus];
});

const handleSearch = () => {
    emit('searchMusic', keyword.value);
};

const handleSelect = (track: MusicTrack) => {
    emit('selectMusicTrack', track);
};
</script>

<style scoped>
.music-panel-layer__scrim {
    border: 0;
    background: transparent;
}

.music-panel {
    position: absolute;
    right: 1.25rem;
    top: 4.75rem;
    display: grid;
    width: min(24rem, calc(100vw - 2rem));
    max-height: calc(100vh - 6rem);
    grid-template-rows: auto auto auto minmax(0, 1fr);
    overflow: hidden;
    border: 1px solid;
    border-radius: 0.7rem;
    box-shadow: 0 28px 90px rgba(0, 0, 0, 0.34);
    backdrop-filter: blur(24px);
}

.music-panel--dark {
    border-color: rgba(255, 255, 255, 0.11);
    background:
        radial-gradient(circle at 12% 0%, rgba(216, 180, 108, 0.14), transparent 15rem),
        rgba(15, 17, 17, 0.94);
    color: #eee5d3;
}

.music-panel--light {
    border-color: rgba(72, 49, 27, 0.13);
    background:
        radial-gradient(circle at 12% 0%, rgba(184, 135, 68, 0.16), transparent 15rem),
        rgba(241, 233, 215, 0.94);
    color: #2e261d;
}

.music-panel__header,
.music-panel__now,
.music-panel__section,
.music-panel__results {
    min-width: 0;
}

.music-panel__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.09);
    padding: 1rem;
}

.music-panel__header p,
.music-panel__section-title span,
.music-panel__track span {
    margin: 0 0 0.25rem;
    font-size: 0.72rem;
    letter-spacing: 0.16em;
    opacity: 0.55;
}

.music-panel__header h2 {
    margin: 0;
    font-family: "Songti SC", "Noto Serif SC", serif;
    font-size: 1.45rem;
    letter-spacing: 0;
}

.music-panel__icon,
.music-panel__play,
.music-panel__search button,
.music-panel__section-title button,
.music-panel__login button {
    border: 0;
    color: inherit;
}

.music-panel__icon {
    display: grid;
    width: 2.25rem;
    aspect-ratio: 1;
    place-items: center;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
}

.music-panel__now {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 0.85rem;
    padding: 1rem;
}

.music-panel__disc {
    display: grid;
    width: 3.2rem;
    aspect-ratio: 1;
    place-items: center;
    border: 1px solid rgba(216, 180, 108, 0.42);
    border-radius: 999px;
    color: #d8b46c;
    background: rgba(216, 180, 108, 0.1);
}

.music-panel__disc--playing {
    animation: music-disc 8s linear infinite;
}

.music-panel__track {
    display: grid;
    min-width: 0;
}

.music-panel__track strong {
    overflow: hidden;
    font-size: 0.98rem;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.music-panel__play {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    min-height: 2.35rem;
    border-radius: 999px;
    padding: 0 0.8rem;
    background: #d8b46c;
    color: #171512;
    font-weight: 700;
}

.music-panel__section {
    display: grid;
    gap: 0.7rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding: 1rem;
}

.music-panel__section-title,
.music-panel__login {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
}

.music-panel__section-title button,
.music-panel__login button {
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.09);
    padding: 0.38rem 0.65rem;
    font-size: 0.76rem;
}

.music-panel__notice,
.music-panel__login,
.music-panel__empty {
    font-size: 0.78rem;
    line-height: 1.55;
    opacity: 0.66;
}

.music-panel__qr {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.78rem;
    opacity: 0.72;
}

.music-panel__qr img {
    width: 5rem;
    aspect-ratio: 1;
    border-radius: 0.35rem;
    background: #fff;
    padding: 0.25rem;
}

.music-panel__search {
    display: grid;
    grid-template-columns: 1fr auto;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0.5rem;
}

.music-panel__search input {
    min-width: 0;
    border: 0;
    background: transparent;
    color: inherit;
    outline: 0;
    padding: 0.7rem 0.8rem;
}

.music-panel__search input::placeholder {
    color: currentColor;
    opacity: 0.4;
}

.music-panel__search button {
    display: grid;
    width: 2.75rem;
    place-items: center;
    background: rgba(216, 180, 108, 0.16);
}

.music-panel__results {
    display: grid;
    align-content: start;
    gap: 0.4rem;
    overflow-y: auto;
    padding: 0 1rem 1rem;
}

.music-panel__result {
    display: grid;
    gap: 0.2rem;
    border: 0;
    border-radius: 0.45rem;
    background: rgba(255, 255, 255, 0.07);
    color: inherit;
    padding: 0.7rem 0.8rem;
    text-align: left;
}

.music-panel__result span,
.music-panel__result small {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.music-panel__result small {
    opacity: 0.55;
}

.music-panel__empty {
    padding: 1rem 0.2rem;
    text-align: center;
}

.music-panel__icon:focus-visible,
.music-panel__play:focus-visible,
.music-panel__search button:focus-visible,
.music-panel__section-title button:focus-visible,
.music-panel__login button:focus-visible,
.music-panel__result:focus-visible {
    outline: 2px solid rgba(216, 180, 108, 0.9);
    outline-offset: 3px;
}

@keyframes music-disc {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

@media (max-width: 767px) {
    .music-panel {
        top: auto;
        right: 0.75rem;
        bottom: 0.75rem;
        left: 0.75rem;
        width: auto;
        max-height: min(82vh, 38rem);
    }
}

@media (prefers-reduced-motion: reduce) {
    .music-panel__disc--playing {
        animation: none;
    }
}
</style>
