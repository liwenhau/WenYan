<template>
    <div class="absolute inset-0 pointer-events-none z-0 overflow-hidden transition-colors duration-500 stage-field"
         :class="[
             isDark ? 'stage-field--dark' : 'stage-field--light',
             `stage-field--${mode}`,
             { 'stage-field--alive': isPlaying, 'stage-field--loading': loading, 'stage-field--holding': isHolding, 'stage-field--low-power': lowPower, 'stage-field--wallpaper': wallpaperMode }
         ]"
         :style="stageVars">
        <div class="stage-vignette"></div>
        <div class="stage-paper-grain"></div>
        <div class="stage-aurora"></div>
        <div class="stage-light stage-light--left"></div>
        <div class="stage-light stage-light--right"></div>
        <div v-if="wallpaperMode" class="wallpaper-atmosphere" aria-hidden="true">
            <div class="wallpaper-atmosphere__wash wallpaper-atmosphere__wash--near"></div>
            <div class="wallpaper-atmosphere__wash wallpaper-atmosphere__wash--far"></div>
            <div class="wallpaper-atmosphere__beam"></div>
            <div class="wallpaper-atmosphere__paper"></div>
        </div>
        <div class="stage-ripples">
            <span v-for="ring in 4" :key="ring" :style="{ animationDelay: `${ring * 1.15}s` }"></span>
        </div>

        <!-- Still Reading Mode -->
        <transition name="fade">
            <div v-if="mode === 'still'" class="absolute inset-0 opacity-[0.08]"
                style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E');">
            </div>
        </transition>

        <!-- Night Recital / Mountain Room Wash -->
        <transition name="fade">
            <div v-if="mode === 'night' || mode === 'mountain'" class="absolute inset-0 opacity-80 filter saturate-125 transition-all duration-1000">
                <div class="ink-wash ink-wash--one"></div>
                <div class="ink-wash ink-wash--two"></div>
                <div class="ink-wash ink-wash--three"></div>
            </div>
        </transition>

        <!-- Rain Window -->
        <transition name="fade">
            <div v-if="mode === 'rain'" class="rain-field">
                <span v-for="drop in 34" :key="drop" :style="rainDropStyle(drop)"></span>
            </div>
        </transition>

        <!-- Particles Mode -->
        <transition name="fade">
            <canvas v-if="mode === 'night' || mode === 'mountain'" ref="canvasRef" class="absolute inset-0 w-full h-full opacity-60"></canvas>
        </transition>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch, nextTick, type CSSProperties } from 'vue';
import type { BackgroundMode } from '../composables/useHomeLogic';

const props = defineProps<{
    mode: BackgroundMode;
    isDark: boolean;
    isPlaying: boolean;
    loading: boolean;
    isHolding: boolean;
    pointerX: number;
    pointerY: number;
    lowPower?: boolean;
    wallpaperMode?: boolean;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
let animationFrameId: number;
let resizeObserver: ResizeObserver | null = null;

const stageVars = computed<CSSProperties>(() => ({
    '--pointer-x': `${props.pointerX}%`,
    '--pointer-y': `${props.pointerY}%`,
    '--stage-pulse': props.isPlaying ? '1' : '0',
    '--stage-drift': props.loading ? '1' : '0',
    '--stage-hold': props.isHolding ? '1' : '0'
} as CSSProperties));

interface Particle {
    x: number;
    y: number;
    size: number;
    speedY: number;
    speedX: number;
    opacity: number;
}

const particles: Particle[] = [];
const particleCount = computed(() => {
    if (props.lowPower) return props.wallpaperMode ? 36 : 28;
    return props.wallpaperMode ? 120 : 80;
});

const rainDropStyle = (index: number) => ({
    left: `${(index * 29) % 101}%`,
    animationDelay: `${(index % 11) * -0.38}s`,
    animationDuration: `${1.25 + (index % 7) * 0.16}s`,
    opacity: `${0.18 + (index % 5) * 0.08}`
});

const initParticles = (width: number, height: number) => {
    particles.length = 0;
    for (let i = 0; i < particleCount.value; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2.4 + 0.8,
            speedY: Math.random() * 0.38 + 0.08,
            speedX: Math.random() * 0.34 - 0.17,
            opacity: Math.random() * 0.48 + 0.14
        });
    }
};

const drawParticles = () => {
    const canvas = canvasRef.value;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width / window.devicePixelRatio;
    const height = canvas.height / window.devicePixelRatio;
    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
        ctx.beginPath();
        const pulse = props.isPlaying ? 1.35 : 1;
        ctx.arc(p.x, p.y, p.size * pulse, 0, Math.PI * 2);
        ctx.fillStyle = props.isDark 
            ? `rgba(225, 238, 255, ${p.opacity})` 
            : `rgba(79, 67, 48, ${p.opacity * 0.72})`;
        ctx.fill();

        p.y += p.speedY * (props.loading ? 4 : 1);
        p.x += p.speedX + (props.pointerX - 50) * 0.0018;

        if (p.y > height + 10) {
            p.y = -10;
            p.x = Math.random() * width;
        }
        if (p.x > width) p.x = 0;
        if (p.x < 0) p.x = width;
    });

    animationFrameId = requestAnimationFrame(drawParticles);
};

const startParticles = () => {
    const canvas = canvasRef.value;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = canvas.getContext('2d');
    ctx?.setTransform(ratio, 0, 0, ratio, 0, 0);

    initParticles(rect.width, rect.height);
    drawParticles();
};

const stopParticles = () => {
    cancelAnimationFrame(animationFrameId);
};

// Handle resize
const handleResize = () => {
    if ((props.mode === 'night' || props.mode === 'mountain') && canvasRef.value) {
        startParticles();
    }
};

watch(() => props.mode, async (newMode) => {
    if (newMode === 'night' || newMode === 'mountain') {
        await nextTick();
        startParticles();
    } else {
        stopParticles();
    }
});

watch(() => props.isDark, () => {
    // Colors update automatically in draw loop
});

onMounted(() => {
    if (props.mode === 'night' || props.mode === 'mountain') {
        startParticles();
    }
    window.addEventListener('resize', handleResize);
    if ('ResizeObserver' in window) {
        resizeObserver = new ResizeObserver(handleResize);
        const canvas = canvasRef.value as HTMLCanvasElement | null;
        if (canvas) resizeObserver.observe(canvas);
    }
});

onUnmounted(() => {
    stopParticles();
    window.removeEventListener('resize', handleResize);
    resizeObserver?.disconnect();
});
</script>

<style scoped>
.stage-field {
    --pointer-x: 50%;
    --pointer-y: 50%;
    --stage-pulse: 0;
    --stage-drift: 0;
    --stage-hold: 0;
    background:
        radial-gradient(circle at var(--pointer-x) var(--pointer-y), rgba(214, 197, 154, 0.18), transparent 26rem),
        linear-gradient(125deg, #171512 0%, #0c1117 45%, #161514 100%);
}

.stage-field--light {
    background:
        radial-gradient(circle at var(--pointer-x) var(--pointer-y), rgba(166, 98, 54, 0.16), transparent 24rem),
        linear-gradient(130deg, #efe8d6 0%, #d7dfd0 48%, #e8dcc4 100%);
}

.stage-field--still.stage-field--dark {
    background:
        radial-gradient(circle at var(--pointer-x) var(--pointer-y), rgba(205, 181, 123, 0.16), transparent 25rem),
        linear-gradient(125deg, #171512 0%, #101315 52%, #16120f 100%);
}

.stage-field--night.stage-field--dark {
    background:
        radial-gradient(circle at var(--pointer-x) var(--pointer-y), rgba(93, 139, 171, 0.22), transparent 28rem),
        linear-gradient(130deg, #0a0d14 0%, #111826 46%, #17120f 100%);
}

.stage-field--rain.stage-field--dark {
    background:
        radial-gradient(circle at var(--pointer-x) var(--pointer-y), rgba(130, 163, 169, 0.2), transparent 26rem),
        linear-gradient(135deg, #111417 0%, #182022 50%, #121716 100%);
}

.stage-field--mountain.stage-field--dark {
    background:
        radial-gradient(circle at var(--pointer-x) var(--pointer-y), rgba(151, 170, 137, 0.18), transparent 27rem),
        linear-gradient(130deg, #121711 0%, #182117 48%, #111412 100%);
}

.stage-field--night.stage-field--light {
    background:
        radial-gradient(circle at var(--pointer-x) var(--pointer-y), rgba(88, 118, 148, 0.17), transparent 25rem),
        linear-gradient(130deg, #d9e1df 0%, #c7d3d8 48%, #e7dcc8 100%);
}

.stage-field--rain.stage-field--light {
    background:
        radial-gradient(circle at var(--pointer-x) var(--pointer-y), rgba(83, 126, 131, 0.2), transparent 24rem),
        linear-gradient(135deg, #dfe4dd 0%, #cfdedb 52%, #e9ddca 100%);
}

.stage-field--mountain.stage-field--light {
    background:
        radial-gradient(circle at var(--pointer-x) var(--pointer-y), rgba(99, 129, 87, 0.18), transparent 25rem),
        linear-gradient(130deg, #e6e0c9 0%, #cfdcc5 48%, #e8dfcc 100%);
}

.stage-field--wallpaper {
    background:
        radial-gradient(circle at var(--pointer-x) var(--pointer-y), rgba(232, 204, 145, 0.16), transparent 26rem),
        radial-gradient(ellipse at 50% 48%, rgba(126, 155, 129, 0.16), transparent 44rem),
        linear-gradient(118deg, #0b0f12 0%, #151914 42%, #17120e 100%);
}

.stage-field--wallpaper.stage-field--still.stage-field--dark {
    background:
        radial-gradient(circle at var(--pointer-x) var(--pointer-y), rgba(232, 204, 145, 0.18), transparent 28rem),
        radial-gradient(ellipse at 52% 50%, rgba(122, 104, 70, 0.22), transparent 46rem),
        linear-gradient(120deg, #0d1111 0%, #17150f 48%, #0d1213 100%);
}

.stage-field--wallpaper.stage-field--night.stage-field--dark {
    background:
        radial-gradient(circle at var(--pointer-x) var(--pointer-y), rgba(125, 166, 200, 0.2), transparent 30rem),
        radial-gradient(ellipse at 52% 58%, rgba(43, 65, 99, 0.42), transparent 42rem),
        linear-gradient(122deg, #070a11 0%, #111a28 48%, #150f13 100%);
}

.stage-field--wallpaper.stage-field--rain.stage-field--dark {
    background:
        radial-gradient(circle at var(--pointer-x) var(--pointer-y), rgba(134, 170, 165, 0.2), transparent 28rem),
        radial-gradient(ellipse at 42% 50%, rgba(72, 100, 99, 0.34), transparent 42rem),
        linear-gradient(132deg, #0d1112 0%, #162123 48%, #0e1514 100%);
}

.stage-field--wallpaper.stage-field--mountain.stage-field--dark {
    background:
        radial-gradient(circle at var(--pointer-x) var(--pointer-y), rgba(143, 167, 123, 0.2), transparent 30rem),
        radial-gradient(ellipse at 50% 58%, rgba(65, 91, 65, 0.38), transparent 43rem),
        linear-gradient(128deg, #0b100d 0%, #172216 50%, #0e1310 100%);
}

.stage-vignette {
    position: absolute;
    inset: -10%;
    background: radial-gradient(circle at 50% 44%, transparent 0 34%, rgba(0, 0, 0, 0.36) 76%, rgba(0, 0, 0, 0.62) 100%);
    opacity: calc(1 + var(--stage-hold) * 0.2);
}

.stage-field--wallpaper .stage-vignette {
    background:
        radial-gradient(circle at 50% 46%, transparent 0 32%, rgba(0, 0, 0, 0.28) 68%, rgba(0, 0, 0, 0.74) 100%),
        linear-gradient(90deg, rgba(0, 0, 0, 0.28), transparent 22% 78%, rgba(0, 0, 0, 0.28));
}

.stage-field--light .stage-vignette {
    background: radial-gradient(circle at 50% 42%, transparent 0 40%, rgba(95, 64, 35, 0.12) 78%, rgba(70, 45, 24, 0.24) 100%);
}

.stage-paper-grain {
    position: absolute;
    inset: 0;
    opacity: 0.16;
    mix-blend-mode: overlay;
    background-image:
        linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px),
        linear-gradient(0deg, rgba(255,255,255,0.05) 1px, transparent 1px);
    background-size: 72px 72px, 72px 72px;
    transform: translate3d(calc((var(--pointer-x) - 50%) * -0.08), calc((var(--pointer-y) - 50%) * -0.08), 0);
}

.stage-aurora {
    position: absolute;
    inset: -22% -10%;
    opacity: calc(0.38 + var(--stage-pulse) * 0.22 + var(--stage-hold) * 0.18);
    background:
        conic-gradient(from 180deg at 45% 50%, transparent 0deg, rgba(94, 137, 160, 0.28) 75deg, transparent 140deg, rgba(181, 150, 84, 0.18) 210deg, transparent 310deg),
        linear-gradient(100deg, transparent, rgba(137, 83, 60, 0.14), transparent);
    filter: blur(28px);
    animation: stage-orbit 20s linear infinite;
}

.stage-field--wallpaper .stage-aurora {
    opacity: calc(0.42 + var(--stage-pulse) * 0.22 + var(--stage-hold) * 0.1);
    filter: blur(42px);
    animation-duration: 34s;
}

.stage-light {
    position: absolute;
    top: 10%;
    width: 34vw;
    height: 80vh;
    opacity: calc(0.2 + var(--stage-pulse) * 0.32 + var(--stage-hold) * 0.2);
    filter: blur(20px);
    transform-origin: top;
}

.stage-light--left {
    left: 8%;
    background: linear-gradient(100deg, rgba(220, 191, 124, 0.22), transparent 68%);
    transform: rotate(10deg);
}

.stage-light--right {
    right: 5%;
    background: linear-gradient(260deg, rgba(102, 168, 158, 0.20), transparent 64%);
    transform: rotate(-12deg);
}

.stage-field--wallpaper .stage-light {
    top: -5%;
    height: 105vh;
    opacity: calc(0.26 + var(--stage-pulse) * 0.2);
    filter: blur(32px);
}

.stage-field--wallpaper .stage-light--left {
    left: 12%;
    width: 28vw;
    background: linear-gradient(100deg, rgba(232, 204, 145, 0.28), transparent 72%);
}

.stage-field--wallpaper .stage-light--right {
    right: 10%;
    width: 32vw;
    background: linear-gradient(260deg, rgba(119, 170, 154, 0.22), transparent 68%);
}

.wallpaper-atmosphere {
    position: absolute;
    inset: 0;
    overflow: hidden;
}

.wallpaper-atmosphere__wash {
    position: absolute;
    border-radius: 44% 56% 58% 42%;
    filter: blur(40px);
    opacity: 0.42;
    mix-blend-mode: screen;
    animation: wallpaper-wash-drift 24s ease-in-out infinite;
}

.wallpaper-atmosphere__wash--near {
    left: 12%;
    top: 18%;
    width: 38rem;
    height: 24rem;
    background: rgba(210, 173, 91, 0.18);
}

.wallpaper-atmosphere__wash--far {
    right: 8%;
    bottom: 10%;
    width: 44rem;
    height: 28rem;
    background: rgba(93, 143, 143, 0.16);
    animation-delay: -9s;
}

.wallpaper-atmosphere__beam {
    position: absolute;
    left: 50%;
    top: 50%;
    width: min(88vw, 92rem);
    height: 44vh;
    transform: translate(-50%, -50%) rotate(-2deg);
    background: linear-gradient(90deg, transparent, rgba(240, 219, 168, 0.08), rgba(255, 255, 255, 0.04), rgba(240, 219, 168, 0.08), transparent);
    filter: blur(10px);
    animation: wallpaper-beam-pulse 16s ease-in-out infinite;
}

.wallpaper-atmosphere__paper {
    position: absolute;
    inset: -5%;
    opacity: 0.14;
    background:
        repeating-linear-gradient(94deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 24px),
        repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 18px);
    transform: rotate(-1deg);
    animation: wallpaper-paper-float 36s linear infinite;
}

.stage-field--rain .wallpaper-atmosphere__wash--near {
    background: rgba(86, 143, 150, 0.2);
}

.stage-field--rain .wallpaper-atmosphere__wash--far {
    background: rgba(165, 188, 176, 0.12);
}

.stage-field--night .wallpaper-atmosphere__wash--near {
    background: rgba(93, 139, 171, 0.18);
}

.stage-field--night .wallpaper-atmosphere__wash--far {
    background: rgba(206, 160, 92, 0.1);
}

.stage-field--mountain .wallpaper-atmosphere__wash--near {
    background: rgba(111, 151, 103, 0.2);
}

.stage-field--mountain .wallpaper-atmosphere__wash--far {
    background: rgba(199, 176, 105, 0.12);
}

.stage-ripples {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    opacity: calc(0.16 + var(--stage-pulse) * 0.28 + var(--stage-drift) * 0.18 + var(--stage-hold) * 0.32);
}

.stage-ripples span {
    position: absolute;
    width: 22rem;
    aspect-ratio: 1;
    border: 1px solid rgba(220, 191, 124, 0.24);
    border-radius: 999px;
    animation: ripple-live 5.6s cubic-bezier(0.16, 1, 0.3, 1) infinite;
}

.stage-field--wallpaper .stage-ripples span {
    width: min(54vw, 38rem);
    border-color: rgba(232, 204, 145, 0.16);
    animation-duration: 9s;
}

.stage-field--light .stage-ripples span {
    border-color: rgba(83, 67, 45, 0.2);
}

.ink-wash {
    position: absolute;
    border-radius: 45% 55% 58% 42%;
    filter: blur(34px);
    opacity: calc(0.46 + var(--stage-pulse) * 0.22);
    mix-blend-mode: screen;
    animation: ink-breathe 13s ease-in-out infinite;
}

.stage-field--light .ink-wash {
    mix-blend-mode: multiply;
}

.ink-wash--one {
    width: 42rem;
    height: 30rem;
    left: -9rem;
    top: -6rem;
    background: rgba(84, 111, 123, 0.34);
}

.ink-wash--two {
    width: 36rem;
    height: 34rem;
    right: -10rem;
    top: 9rem;
    background: rgba(130, 80, 75, 0.28);
    animation-delay: -4s;
}

.ink-wash--three {
    width: 32rem;
    height: 25rem;
    left: 24%;
    bottom: -9rem;
    background: rgba(182, 145, 82, 0.22);
    animation-delay: -8s;
}

.stage-field--mountain .ink-wash--one {
    background: rgba(105, 136, 106, 0.32);
}

.stage-field--mountain .ink-wash--two {
    background: rgba(92, 126, 137, 0.24);
}

.stage-field--mountain .ink-wash--three {
    background: rgba(198, 177, 115, 0.2);
}

.rain-field {
    position: absolute;
    inset: -12% 0;
    overflow: hidden;
    opacity: calc(0.58 + var(--stage-pulse) * 0.18);
}

.stage-field--wallpaper .rain-field {
    opacity: calc(0.68 + var(--stage-pulse) * 0.16);
}

.stage-field--wallpaper .rain-field span {
    height: 34vh;
    width: 1px;
    background: linear-gradient(to bottom, transparent, rgba(217, 235, 229, 0.64), rgba(217, 235, 229, 0.14), transparent);
    filter: blur(0.2px);
}

.stage-field--holding .stage-paper-grain {
    opacity: 0.24;
}

.stage-field--holding .stage-ripples span {
    animation-duration: 3.2s;
}

.stage-field--low-power .stage-aurora,
.stage-field--low-power .ink-wash,
.stage-field--low-power .stage-ripples span,
.stage-field--low-power .wallpaper-atmosphere__wash,
.stage-field--low-power .wallpaper-atmosphere__beam,
.stage-field--low-power .wallpaper-atmosphere__paper {
    animation-duration: 32s;
}

.stage-field--low-power .rain-field span:nth-child(2n),
.stage-field--low-power .rain-field span:nth-child(3n) {
    display: none;
}

.stage-field--low-power .stage-ripples {
    opacity: 0.12;
}

.rain-field span {
    position: absolute;
    top: -20%;
    width: 1px;
    height: 24vh;
    background: linear-gradient(to bottom, transparent, rgba(210, 229, 224, 0.46), transparent);
    transform: rotate(13deg);
    animation: rain-fall linear infinite;
}

.stage-field--light .rain-field span {
    background: linear-gradient(to bottom, transparent, rgba(82, 109, 105, 0.34), transparent);
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 1s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

@keyframes stage-orbit {
    0% { transform: rotate(0deg) scale(1); }
    50% { transform: rotate(180deg) scale(1.08); }
    100% { transform: rotate(360deg) scale(1); }
}

@keyframes ripple-live {
    0% {
        opacity: 0;
        transform: scale(0.45);
    }
    20% {
        opacity: 0.8;
    }
    100% {
        opacity: 0;
        transform: scale(2.1);
    }
}

@keyframes ink-breathe {
    0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg) scale(1); }
    45% { transform: translate3d(3rem, -2rem, 0) rotate(7deg) scale(1.12); }
    70% { transform: translate3d(-1rem, 2rem, 0) rotate(-5deg) scale(0.94); }
}

@keyframes rain-fall {
    from { transform: translate3d(0, -20vh, 0) rotate(13deg); }
    to { transform: translate3d(-8vw, 130vh, 0) rotate(13deg); }
}

@keyframes wallpaper-wash-drift {
    0%, 100% {
        transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
    }
    45% {
        transform: translate3d(3.5rem, -2.4rem, 0) rotate(6deg) scale(1.08);
    }
    72% {
        transform: translate3d(-2rem, 2.2rem, 0) rotate(-4deg) scale(0.96);
    }
}

@keyframes wallpaper-beam-pulse {
    0%, 100% {
        opacity: 0.55;
        transform: translate(-50%, -50%) rotate(-2deg) scaleX(0.96);
    }
    50% {
        opacity: 0.86;
        transform: translate(-50%, -50%) rotate(1deg) scaleX(1.02);
    }
}

@keyframes wallpaper-paper-float {
    from {
        background-position: 0 0, 0 0;
    }
    to {
        background-position: 18rem 0, 0 18rem;
    }
}

@media (prefers-reduced-motion: reduce) {
    .stage-aurora,
    .stage-ripples span,
    .ink-wash,
    .rain-field span,
    .wallpaper-atmosphere__wash,
    .wallpaper-atmosphere__beam,
    .wallpaper-atmosphere__paper {
        animation: none;
    }
}

@media (max-width: 767px) {
    .stage-light {
        width: 60vw;
        height: 60vh;
    }

    .stage-ripples span {
        width: 15rem;
    }
}
</style>
