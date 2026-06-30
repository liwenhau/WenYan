<template>
    <div class="wallpaper-center fixed inset-0 z-50 bg-[#090b0b]/88 p-3 backdrop-blur-xl" @click.self="emit('close')">
        <section class="wallpaper-center__shell" :class="isDark ? 'wallpaper-center__shell--dark' : 'wallpaper-center__shell--light'">
            <header class="wallpaper-center__header">
                <div class="wallpaper-center__title">
                    <span>壁纸控制中心</span>
                    <strong>把当前现场交给桌面</strong>
                </div>
                <button class="wallpaper-icon-button" :class="softButtonClass" @click="emit('close')" aria-label="关闭壁纸控制中心">
                    <n-icon size="20"><Dismiss24Regular /></n-icon>
                </button>
            </header>

            <main class="wallpaper-center__body">
                <section class="wallpaper-preview">
                    <div class="wallpaper-preview__screen" :class="[`wallpaper-preview__screen--${backgroundMode}`, previewRatioClass]">
                        <div class="wallpaper-preview__grain"></div>
                        <div class="wallpaper-preview__glow"></div>
                        <div class="wallpaper-preview__quote">
                            <p>{{ quote.hitokoto }}</p>
                            <span>{{ quote.from_who || quote.from || '聞言' }}</span>
                        </div>
                        <div class="wallpaper-preview__badge">
                            <span>{{ scenePreset.label }}</span>
                            <strong>{{ selectedPreset.label }}</strong>
                        </div>
                    </div>
                    <div class="wallpaper-preview__meta">
                        <div>
                            <span>当前现场</span>
                            <strong>{{ scenePreset.line }}</strong>
                        </div>
                        <div>
                            <span>预览比例</span>
                            <strong>{{ previewRatioLabel }}</strong>
                        </div>
                    </div>
                </section>

                <section class="wallpaper-config">
                    <div class="wallpaper-section">
                        <p class="wallpaper-section__label">预设</p>
                        <div class="preset-grid">
                            <button
                                v-for="preset in presets"
                                :key="preset.value"
                                class="preset-card"
                                :class="{ 'preset-card--active': activePreset === preset.value }"
                                @click="setPreset(preset.value)">
                                <n-icon size="22"><component :is="preset.icon" /></n-icon>
                                <strong>{{ preset.label }}</strong>
                                <span>{{ preset.description }}</span>
                            </button>
                        </div>
                    </div>

                    <div class="wallpaper-section">
                        <p class="wallpaper-section__label">预览尺寸</p>
                        <div class="ratio-control" :class="softPanelClass">
                            <button
                                v-for="ratio in previewRatios"
                                :key="ratio.value"
                                :class="{ 'ratio-control__item--active': previewRatio === ratio.value }"
                                @click="previewRatio = ratio.value">
                                {{ ratio.label }}
                            </button>
                        </div>
                    </div>

                    <div class="wallpaper-section">
                        <p class="wallpaper-section__label">客户端行为</p>
                        <label v-for="option in desktopOptions" :key="option.key" class="wallpaper-toggle" :class="softPanelClass">
                            <span>
                                <strong>{{ option.title }}</strong>
                                <small>{{ option.description }}</small>
                            </span>
                            <input type="checkbox" :checked="option.value" :disabled="option.disabled" @change="option.onChange" />
                        </label>
                    </div>
                </section>

                <aside class="wallpaper-diagnostics">
                    <div class="wallpaper-status" :class="statusClass">
                        <n-icon size="23"><Desktop24Regular /></n-icon>
                        <div>
                            <strong>{{ statusTitle }}</strong>
                            <span>{{ statusText }}</span>
                        </div>
                    </div>

                    <div class="diagnostic-list">
                        <div v-for="item in diagnostics" :key="item.label" class="diagnostic-item" :class="softPanelClass">
                            <span>{{ item.label }}</span>
                            <strong>{{ item.value }}</strong>
                        </div>
                    </div>

                    <div class="wallpaper-help" :class="softPanelClass">
                        <p>使用提示</p>
                        <span>{{ desktopAvailable ? desktopNote : '请从桌面客户端打开此面板。浏览器预览没有系统桌面权限。' }}</span>
                    </div>
                </aside>
            </main>

            <footer class="wallpaper-center__actions" :class="isDark ? 'bg-[#111312]/96 border-white/10' : 'bg-[#f3ecdc]/96 border-black/10'">
                <button class="wallpaper-secondary" :class="softButtonClass" :disabled="!desktopAvailable || busy || !wallpaperActive" @click="exitWallpaperMode">
                    退出壁纸
                </button>
                <button class="wallpaper-primary" :disabled="!desktopAvailable || busy" @click="applyWallpaperMode">
                    <n-icon size="21"><Wallpaper24Regular /></n-icon>
                    <span>{{ busy ? '正在应用...' : primaryActionText }}</span>
                </button>
            </footer>
        </section>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useMessage } from 'naive-ui';
import {
    Desktop24Regular,
    Dismiss24Regular,
    CursorHover24Regular,
    Wallpaper24Regular,
    LeafOne24Regular,
    Video24Regular
} from '@vicons/fluent';
import type { Hitokoto } from '../types';
import type { BackgroundMode } from '../composables/useHomeLogic';
import { scenePresetMap } from '../constants/scenes';

type WallpaperPreset = 'immersive' | 'quiet' | 'showcase';
type PreviewRatio = 'screen' | 'wide' | 'vertical';

const props = defineProps<{
  quote: Hitokoto;
  isDark: boolean;
  backgroundMode: BackgroundMode;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const message = useMessage();
const desktopAvailable = ref(false);
const wallpaperActive = ref(false);
const launchAtLogin = ref(false);
const platform = ref('browser');
const busy = ref(false);
const lastError = ref('');
const activePreset = ref<WallpaperPreset>('immersive');
const previewRatio = ref<PreviewRatio>('screen');
const lowPower = ref(false);
const passThroughMouse = ref(false);
const autoMusic = ref(true);
let removeStateListener: (() => void) | undefined;

const scenePreset = computed(() => scenePresetMap[props.backgroundMode]);
const softButtonClass = computed(() => props.isDark ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-black/5 text-black hover:bg-black/10');
const softPanelClass = computed(() => props.isDark ? 'bg-white/8 border-white/10' : 'bg-black/5 border-black/10');
const primaryActionText = computed(() => wallpaperActive.value ? '更新桌面壁纸' : '设为动态桌面壁纸');
const selectedPreset = computed(() => presets.find(preset => preset.value === activePreset.value) || presets[0]);
const previewRatioClass = computed(() => `wallpaper-preview__screen--ratio-${previewRatio.value}`);
const previewRatioLabel = computed(() => previewRatios.find(ratio => ratio.value === previewRatio.value)?.label || '当前屏幕');

const desktopNote = computed(() => {
    if (passThroughMouse.value) return '已启用鼠标穿透。需要调整或退出时，从托盘打开控制台即可。';
    if (lowPower.value) return '低功耗模式会减少粒子和循环动画，适合长时间常驻。';
    return '完整互动会保留点击换句、视差和音乐，适合沉浸阅读。';
});

const statusClass = computed(() => {
    if (!desktopAvailable.value) return props.isDark ? 'bg-red-500/12 border-red-300/20' : 'bg-red-500/10 border-red-500/20';
    if (wallpaperActive.value) return props.isDark ? 'bg-[#d8b46c]/14 border-[#d8b46c]/30' : 'bg-[#d8b46c]/24 border-[#8a6424]/20';
    return props.isDark ? 'bg-white/8 border-white/10' : 'bg-black/5 border-black/10';
});

const statusTitle = computed(() => {
    if (!desktopAvailable.value) return '需要桌面客户端';
    return wallpaperActive.value ? '动态壁纸运行中' : '客户端已就绪';
});

const statusText = computed(() => {
    if (lastError.value) return lastError.value;
    if (!desktopAvailable.value) return '浏览器无法写入系统桌面。';
    if (wallpaperActive.value) return `已在 ${platform.value} 桌面层运行，可继续更新设置。`;
    return '选择预设后，将当前现场应用到桌面层。';
});

const presets = [
    {
        value: 'immersive' as const,
        label: '沉浸互动',
        description: '点击换句、鼠标视差、自动播放音乐',
        icon: CursorHover24Regular
    },
    {
        value: 'quiet' as const,
        label: '静默常驻',
        description: '低功耗、鼠标穿透、不自动播放音乐',
        icon: LeafOne24Regular
    },
    {
        value: 'showcase' as const,
        label: '展示模式',
        description: '保留画面动效，关闭桌面点击接管',
        icon: Video24Regular
    }
];

const previewRatios = [
    { value: 'screen' as const, label: '当前屏幕' },
    { value: 'wide' as const, label: '16:9' },
    { value: 'vertical' as const, label: '竖屏' }
];

const setPreset = (preset: WallpaperPreset) => {
    activePreset.value = preset;
    if (preset === 'immersive') {
        lowPower.value = false;
        passThroughMouse.value = false;
        autoMusic.value = true;
    }
    if (preset === 'quiet') {
        lowPower.value = true;
        passThroughMouse.value = true;
        autoMusic.value = false;
    }
    if (preset === 'showcase') {
        lowPower.value = false;
        passThroughMouse.value = true;
        autoMusic.value = false;
    }
};

const desktopOptions = computed(() => [
    {
        key: 'launch',
        title: '开机后自动恢复',
        description: '客户端启动时自动回到桌面壁纸层',
        value: launchAtLogin.value,
        disabled: !desktopAvailable.value || busy.value,
        onChange: handleLaunchToggle
    },
    {
        key: 'lowPower',
        title: '低功耗显示',
        description: '减少粒子和循环动画，适合长时间常驻',
        value: lowPower.value,
        disabled: busy.value,
        onChange: (event: Event) => {
            lowPower.value = (event.target as HTMLInputElement).checked;
        }
    },
    {
        key: 'passThroughMouse',
        title: '不接管桌面点击',
        description: '鼠标点击会穿过壁纸，保留桌面原本操作',
        value: passThroughMouse.value,
        disabled: busy.value,
        onChange: (event: Event) => {
            passThroughMouse.value = (event.target as HTMLInputElement).checked;
        }
    },
    {
        key: 'autoMusic',
        title: '进入壁纸后播放音乐',
        description: '关闭后只保留画面，不自动播放背景音乐',
        value: autoMusic.value,
        disabled: busy.value,
        onChange: (event: Event) => {
            autoMusic.value = (event.target as HTMLInputElement).checked;
        }
    }
]);

const diagnostics = computed(() => [
    { label: '运行环境', value: desktopAvailable.value ? platform.value : '浏览器预览' },
    { label: '壁纸状态', value: wallpaperActive.value ? '运行中' : '未启用' },
    { label: '开机恢复', value: launchAtLogin.value ? '已开启' : '未开启' },
    { label: '鼠标穿透', value: passThroughMouse.value ? '已开启' : '未开启' },
    { label: '自动音乐', value: autoMusic.value ? '已开启' : '未开启' }
]);

const refreshState = async () => {
    const bridge = window.wenyanDesktop;
    desktopAvailable.value = Boolean(bridge);
    if (!bridge) return;
    try {
        const state = await bridge.getState();
        wallpaperActive.value = state.wallpaperActive;
        launchAtLogin.value = state.launchAtLogin;
        platform.value = state.platform;
        if (state.wallpaperOptions) {
            lowPower.value = state.wallpaperOptions.lowPower;
            passThroughMouse.value = state.wallpaperOptions.passThroughMouse;
            autoMusic.value = state.wallpaperOptions.autoMusic;
            activePreset.value = state.wallpaperOptions.lowPower ? 'quiet' : (state.wallpaperOptions.passThroughMouse ? 'showcase' : 'immersive');
        }
        lastError.value = '';
    } catch (error) {
        lastError.value = error instanceof Error ? error.message : '客户端状态读取失败';
    }
};

const applyWallpaperMode = async () => {
    const bridge = window.wenyanDesktop;
    if (!bridge) {
        message.warning('请在桌面客户端中使用此功能');
        return;
    }
    busy.value = true;
    const wasActive = wallpaperActive.value;
    try {
        await bridge.setWallpaperMode({
            scene: props.backgroundMode,
            quoteId: props.quote.id,
            lowPower: lowPower.value,
            passThroughMouse: passThroughMouse.value,
            autoMusic: autoMusic.value
        });
        await refreshState();
        message.success(wasActive ? '桌面壁纸已更新' : '已设置为动态桌面壁纸');
        emit('close');
    } catch (error) {
        lastError.value = error instanceof Error ? error.message : '设置壁纸失败';
        message.error(lastError.value);
    } finally {
        busy.value = false;
    }
};

const exitWallpaperMode = async () => {
    const bridge = window.wenyanDesktop;
    if (!bridge) return;
    busy.value = true;
    try {
        await bridge.exitWallpaperMode();
        await refreshState();
        message.success('已退出壁纸模式');
    } catch (error) {
        lastError.value = error instanceof Error ? error.message : '退出壁纸模式失败';
        message.error(lastError.value);
    } finally {
        busy.value = false;
    }
};

const handleLaunchToggle = async (event: Event) => {
    const bridge = window.wenyanDesktop;
    if (!bridge) return;
    const target = event.target as HTMLInputElement;
    busy.value = true;
    try {
        await bridge.setLaunchAtLogin(target.checked);
        await refreshState();
        message.success(target.checked ? '已开启开机恢复' : '已关闭开机恢复');
    } catch (error) {
        lastError.value = error instanceof Error ? error.message : '开机启动设置失败';
        message.error(lastError.value);
    } finally {
        busy.value = false;
    }
};

onMounted(() => {
    setPreset('immersive');
    refreshState();
    removeStateListener = window.wenyanDesktop?.onStateChanged(() => {
        refreshState();
    });
});

onUnmounted(() => {
    removeStateListener?.();
});
</script>

<style scoped>
.wallpaper-center {
    color: #eee5d3;
}

.wallpaper-center__shell {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    height: 100%;
    overflow: hidden;
    border: 1px solid;
    border-radius: 0.75rem;
    box-shadow: 0 30px 100px rgba(0, 0, 0, 0.42);
}

.wallpaper-center__shell--dark {
    border-color: rgba(255, 255, 255, 0.1);
    background:
        radial-gradient(circle at 18% 12%, rgba(216, 180, 108, 0.12), transparent 25rem),
        linear-gradient(145deg, rgba(17, 19, 18, 0.98), rgba(12, 14, 14, 0.98));
}

.wallpaper-center__shell--light {
    border-color: rgba(0, 0, 0, 0.12);
    background:
        radial-gradient(circle at 18% 12%, rgba(161, 105, 50, 0.14), transparent 25rem),
        linear-gradient(145deg, rgba(243, 236, 220, 0.98), rgba(224, 216, 198, 0.98));
    color: #28231d;
}

.wallpaper-center__header,
.wallpaper-center__actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    border-color: inherit;
}

.wallpaper-center__header {
    min-height: 4.3rem;
    border-bottom: 1px solid;
    padding: 0 1.25rem;
}

.wallpaper-center__title span,
.wallpaper-section__label {
    display: block;
    margin-bottom: 0.35rem;
    font-family: Arial, sans-serif;
    font-size: 0.72rem;
    letter-spacing: 0.18em;
    opacity: 0.55;
}

.wallpaper-center__title strong {
    font-family: "Songti SC", "Noto Serif SC", SimSun, serif;
    font-size: 1.55rem;
    letter-spacing: 0;
}

.wallpaper-center__body {
    display: grid;
    grid-template-columns: minmax(22rem, 1.25fr) minmax(21rem, 0.95fr) minmax(16rem, 0.65fr);
    gap: 1rem;
    min-height: 0;
    overflow: auto;
    padding: 1rem;
}

.wallpaper-preview,
.wallpaper-config,
.wallpaper-diagnostics {
    min-width: 0;
}

.wallpaper-preview {
    display: grid;
    grid-template-rows: minmax(0, 1fr) auto;
    gap: 0.85rem;
}

.wallpaper-preview__screen {
    position: relative;
    min-height: 24rem;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0.55rem;
    background:
        radial-gradient(circle at 50% 48%, rgba(216, 180, 108, 0.18), transparent 25rem),
        linear-gradient(135deg, #101312, #192018 48%, #111312);
    box-shadow: inset 0 0 80px rgba(0, 0, 0, 0.32);
}

.wallpaper-preview__screen--night {
    background:
        radial-gradient(circle at 50% 48%, rgba(127, 166, 200, 0.22), transparent 25rem),
        linear-gradient(135deg, #070a11, #111a28 52%, #150f13);
}

.wallpaper-preview__screen--rain {
    background:
        radial-gradient(circle at 50% 48%, rgba(134, 170, 165, 0.24), transparent 25rem),
        linear-gradient(135deg, #0d1112, #162123 52%, #0e1514);
}

.wallpaper-preview__screen--mountain {
    background:
        radial-gradient(circle at 50% 48%, rgba(143, 167, 123, 0.24), transparent 25rem),
        linear-gradient(135deg, #0b100d, #172216 52%, #0e1310);
}

.wallpaper-preview__screen--ratio-wide {
    aspect-ratio: 16 / 9;
    min-height: auto;
}

.wallpaper-preview__screen--ratio-vertical {
    width: min(100%, 23rem);
    aspect-ratio: 9 / 16;
    min-height: auto;
    justify-self: center;
}

.wallpaper-preview__grain,
.wallpaper-preview__glow {
    position: absolute;
    inset: 0;
}

.wallpaper-preview__grain {
    opacity: 0.16;
    background-image:
        linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px),
        linear-gradient(0deg, rgba(255,255,255,0.04) 1px, transparent 1px);
    background-size: 70px 70px;
}

.wallpaper-preview__glow {
    background:
        radial-gradient(ellipse at 50% 52%, rgba(255, 238, 184, 0.12), transparent 58%),
        linear-gradient(90deg, transparent, rgba(232, 204, 145, 0.08), transparent);
}

.wallpaper-preview__quote {
    position: absolute;
    inset: 0;
    display: grid;
    place-content: center;
    padding: clamp(1.5rem, 5vw, 4rem);
    text-align: center;
}

.wallpaper-preview__quote p {
    max-width: 12em;
    margin: 0;
    font-family: "Songti SC", "Noto Serif SC", SimSun, serif;
    font-size: clamp(1.55rem, 4vw, 4.2rem);
    line-height: 1.55;
    color: rgba(248, 240, 220, 0.92);
    text-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.wallpaper-preview__quote span {
    margin-top: 1.4rem;
    font-size: 0.86rem;
    letter-spacing: 0.18em;
    opacity: 0.58;
}

.wallpaper-preview__badge {
    position: absolute;
    left: 1rem;
    right: 1rem;
    bottom: 1rem;
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 0.45rem;
    padding: 0.7rem 0.85rem;
    background: rgba(0, 0, 0, 0.18);
    backdrop-filter: blur(16px);
}

.wallpaper-preview__badge span {
    opacity: 0.58;
}

.wallpaper-preview__badge strong {
    color: #d8b46c;
}

.wallpaper-preview__meta {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
}

.wallpaper-preview__meta div,
.diagnostic-item,
.wallpaper-help,
.wallpaper-toggle,
.ratio-control {
    border: 1px solid;
    border-radius: 0.55rem;
}

.wallpaper-preview__meta div,
.diagnostic-item {
    display: grid;
    gap: 0.25rem;
    padding: 0.85rem;
}

.wallpaper-preview__meta span,
.diagnostic-item span {
    font-size: 0.74rem;
    opacity: 0.55;
}

.wallpaper-preview__meta strong,
.diagnostic-item strong {
    font-size: 0.9rem;
}

.wallpaper-config,
.wallpaper-diagnostics {
    display: flex;
    min-height: 0;
    flex-direction: column;
    gap: 1rem;
}

.preset-grid {
    display: grid;
    gap: 0.7rem;
}

.preset-card {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.25rem 0.7rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0.55rem;
    background: rgba(255, 255, 255, 0.06);
    color: inherit;
    padding: 0.85rem;
    text-align: left;
    transition: border-color 180ms ease, background-color 180ms ease, transform 180ms ease;
}

.preset-card strong,
.preset-card span {
    grid-column: 2;
}

.preset-card span {
    font-size: 0.78rem;
    line-height: 1.5;
    opacity: 0.58;
}

.preset-card--active {
    border-color: rgba(216, 180, 108, 0.65);
    background: rgba(216, 180, 108, 0.16);
}

.ratio-control {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.35rem;
    padding: 0.35rem;
}

.ratio-control button {
    min-height: 2.45rem;
    border: 0;
    border-radius: 0.4rem;
    background: transparent;
    color: inherit;
    opacity: 0.64;
}

.ratio-control__item--active {
    background: #d8b46c !important;
    color: #171512 !important;
    opacity: 1 !important;
}

.wallpaper-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.8rem;
}

.wallpaper-toggle span {
    display: grid;
    gap: 0.22rem;
}

.wallpaper-toggle strong {
    font-size: 0.88rem;
}

.wallpaper-toggle small {
    font-size: 0.74rem;
    line-height: 1.45;
    opacity: 0.58;
}

.wallpaper-toggle input {
    width: 2.35rem;
    height: 1.2rem;
    accent-color: #d8b46c;
}

.wallpaper-status {
    display: flex;
    gap: 0.75rem;
    border: 1px solid;
    border-radius: 0.55rem;
    padding: 0.95rem;
}

.wallpaper-status div {
    display: grid;
    gap: 0.25rem;
}

.wallpaper-status span,
.wallpaper-help span {
    font-size: 0.78rem;
    line-height: 1.55;
    opacity: 0.66;
}

.diagnostic-list {
    display: grid;
    gap: 0.65rem;
}

.wallpaper-help {
    padding: 0.9rem;
}

.wallpaper-help p {
    margin: 0 0 0.45rem;
    font-weight: 700;
}

.wallpaper-center__actions {
    border-top: 1px solid;
    padding: 0.85rem 1rem;
}

.wallpaper-icon-button,
.wallpaper-primary,
.wallpaper-secondary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 0;
    transition: transform 180ms ease, filter 180ms ease, opacity 180ms ease, background-color 180ms ease;
}

.wallpaper-icon-button {
    width: 2.4rem;
    aspect-ratio: 1;
    border-radius: 999px;
    padding: 0;
}

.wallpaper-primary,
.wallpaper-secondary {
    min-height: 3rem;
    gap: 0.55rem;
    border-radius: 999px;
    padding: 0 1.25rem;
    font-weight: 700;
}

.wallpaper-primary {
    min-width: min(20rem, 48vw);
    background: #d8b46c;
    color: #171512;
}

.wallpaper-primary:hover {
    filter: brightness(1.06);
}

.wallpaper-primary:disabled,
.wallpaper-secondary:disabled {
    opacity: 0.46;
    cursor: not-allowed;
}

.wallpaper-icon-button:active,
.wallpaper-primary:active,
.wallpaper-secondary:active,
.preset-card:active {
    transform: scale(0.98);
}

.wallpaper-icon-button:focus-visible,
.wallpaper-primary:focus-visible,
.wallpaper-secondary:focus-visible,
.preset-card:focus-visible,
.ratio-control button:focus-visible,
.wallpaper-toggle input:focus-visible {
    outline: 2px solid rgba(216, 180, 108, 0.9);
    outline-offset: 3px;
}

@media (max-width: 1100px) {
    .wallpaper-center__body {
        grid-template-columns: 1fr 1fr;
    }

    .wallpaper-preview {
        grid-column: 1 / -1;
    }
}

@media (max-width: 760px) {
    .wallpaper-center {
        padding: 0.75rem;
    }

    .wallpaper-center__body {
        grid-template-columns: 1fr;
    }

    .wallpaper-center__header,
    .wallpaper-center__actions {
        align-items: stretch;
    }

    .wallpaper-center__actions {
        flex-direction: column-reverse;
    }

    .wallpaper-primary,
    .wallpaper-secondary {
        width: 100%;
    }

    .wallpaper-preview__screen {
        min-height: 18rem;
    }
}

@media (max-width: 520px) {
    .wallpaper-center__title strong {
        font-size: 1.25rem;
    }

    .wallpaper-preview__meta,
    .ratio-control {
        grid-template-columns: 1fr;
    }

    .wallpaper-preview__screen {
        min-height: 14rem;
    }
}
</style>
