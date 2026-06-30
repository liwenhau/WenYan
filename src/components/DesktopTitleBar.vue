<template>
  <header v-if="desktopAvailable" class="desktop-titlebar">
    <div class="desktop-titlebar__brand">
      <span class="desktop-titlebar__mark">聞</span>
      <div>
        <strong>聞言</strong>
        <small>{{ statusLabel }}</small>
      </div>
    </div>

    <div class="desktop-titlebar__drag" aria-hidden="true"></div>

    <div class="desktop-titlebar__actions">
      <button type="button" class="desktop-titlebar__button" title="最小化" aria-label="最小化" @click="minimize">
        <n-icon size="16"><Subtract24Regular /></n-icon>
      </button>
      <button type="button" class="desktop-titlebar__button" :title="maximized ? '还原' : '最大化'" :aria-label="maximized ? '还原' : '最大化'" @click="toggleMaximize">
        <n-icon size="15">
          <FullScreenMinimize24Regular v-if="maximized" />
          <Maximize24Regular v-else />
        </n-icon>
      </button>
      <button type="button" class="desktop-titlebar__button desktop-titlebar__button--close" title="隐藏到托盘" aria-label="隐藏到托盘" @click="close">
        <n-icon size="16"><Dismiss24Regular /></n-icon>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import {
  Dismiss24Regular,
  FullScreenMinimize24Regular,
  Maximize24Regular,
  Subtract24Regular
} from '@vicons/fluent';

const desktopAvailable = ref(false);
const isWallpaperWindow = ref(false);
const wallpaperActive = ref(false);
const maximized = ref(false);
let removeStateListener: (() => void) | undefined;

const statusLabel = computed(() => wallpaperActive.value ? '动态壁纸运行中' : '桌面控制台');

const applyState = (state: WenyanDesktopState) => {
  desktopAvailable.value = true;
  wallpaperActive.value = state.wallpaperActive;
  maximized.value = state.mainWindowMaximized;
};

const refreshState = async () => {
  const bridge = window.wenyanDesktop;
  desktopAvailable.value = Boolean(bridge);
  if (!bridge) return;
  applyState(await bridge.getState());
};

const minimize = async () => {
  const state = await window.wenyanDesktop?.minimizeWindow();
  if (state) applyState(state);
};

const toggleMaximize = async () => {
  const state = await window.wenyanDesktop?.toggleMaximizeWindow();
  if (state) applyState(state);
};

const close = async () => {
  const state = await window.wenyanDesktop?.closeWindow();
  if (state) applyState(state);
};

onMounted(() => {
  const params = new URLSearchParams(window.location.search);
  isWallpaperWindow.value = params.get('wallpaper') === '1';
  if (window.wenyanDesktop && !isWallpaperWindow.value) {
    document.body.classList.add('wenyan-desktop-shell');
  }
  if (!isWallpaperWindow.value) {
    refreshState();
    removeStateListener = window.wenyanDesktop?.onStateChanged(applyState);
  }
});

onUnmounted(() => {
  removeStateListener?.();
  document.body.classList.remove('wenyan-desktop-shell');
});
</script>

<style scoped>
.desktop-titlebar {
  position: fixed;
  inset: 0 0 auto;
  z-index: 60;
  display: grid;
  grid-template-columns: auto 1fr auto;
  height: 2.35rem;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background:
    linear-gradient(90deg, rgba(17, 19, 18, 0.94), rgba(20, 22, 20, 0.86)),
    rgba(17, 19, 18, 0.92);
  color: rgba(238, 229, 211, 0.86);
  backdrop-filter: blur(18px);
  user-select: none;
  -webkit-app-region: drag;
}

.desktop-titlebar__brand {
  display: flex;
  height: 100%;
  align-items: center;
  gap: 0.65rem;
  padding: 0 0.95rem;
  min-width: 12rem;
}

.desktop-titlebar__mark {
  display: grid;
  width: 1.55rem;
  aspect-ratio: 1;
  place-items: center;
  border: 1px solid rgba(216, 180, 108, 0.45);
  color: rgba(216, 180, 108, 0.92);
  font-family: "Songti SC", "Noto Serif SC", SimSun, serif;
  font-size: 1rem;
  line-height: 1;
}

.desktop-titlebar__brand strong,
.desktop-titlebar__brand small {
  display: block;
  line-height: 1.1;
}

.desktop-titlebar__brand strong {
  font-family: "Songti SC", "Noto Serif SC", SimSun, serif;
  font-size: 0.92rem;
  letter-spacing: 0.08em;
}

.desktop-titlebar__brand small {
  margin-top: 0.12rem;
  font-family: Arial, sans-serif;
  font-size: 0.66rem;
  letter-spacing: 0.12em;
  opacity: 0.52;
}

.desktop-titlebar__drag {
  height: 100%;
}

.desktop-titlebar__actions {
  display: flex;
  height: 100%;
  -webkit-app-region: no-drag;
}

.desktop-titlebar__button {
  display: grid;
  width: 2.9rem;
  height: 100%;
  place-items: center;
  border: 0;
  border-left: 1px solid rgba(255, 255, 255, 0.04);
  background: transparent;
  color: rgba(238, 229, 211, 0.72);
  transition: background-color 160ms ease, color 160ms ease;
}

.desktop-titlebar__button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.96);
}

.desktop-titlebar__button--close:hover {
  background: rgba(174, 56, 46, 0.86);
  color: #fff;
}

.desktop-titlebar__button:focus-visible {
  outline: 2px solid rgba(216, 180, 108, 0.9);
  outline-offset: -3px;
}
</style>
