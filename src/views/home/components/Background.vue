<template>
    <div class="absolute inset-0 pointer-events-none z-0 overflow-hidden transition-colors duration-500">
        
        <!-- Noise Mode -->
        <transition name="fade">
            <div v-if="mode === 'noise'" class="absolute inset-0 opacity-[0.03]"
                style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E');">
            </div>
        </transition>

        <!-- Ink Mode -->
        <transition name="fade">
            <div v-if="mode === 'ink'" class="absolute inset-0 opacity-60 dark:opacity-40 blur-3xl filter saturate-150 transition-all duration-1000">
                <div class="absolute w-[500px] h-[500px] rounded-full filter blur-3xl animate-blob transition-colors duration-1000"
                     :class="isDark ? 'bg-indigo-600/30 mix-blend-screen top-0 -left-20' : 'bg-blue-200 mix-blend-multiply top-0 -left-4'"></div>
                <div class="absolute w-[500px] h-[500px] rounded-full filter blur-3xl animate-blob animation-delay-2000 transition-colors duration-1000"
                     :class="isDark ? 'bg-purple-600/30 mix-blend-screen top-0 -right-20' : 'bg-purple-200 mix-blend-multiply top-0 -right-4'"></div>
                <div class="absolute w-[500px] h-[500px] rounded-full filter blur-3xl animate-blob animation-delay-4000 transition-colors duration-1000"
                     :class="isDark ? 'bg-teal-600/30 mix-blend-screen -bottom-32 left-20' : 'bg-pink-200 mix-blend-multiply -bottom-8 left-20'"></div>
            </div>
        </transition>

        <!-- Particles Mode -->
        <transition name="fade">
            <canvas v-if="mode === 'particles'" ref="canvasRef" class="absolute inset-0 w-full h-full opacity-60"></canvas>
        </transition>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import type { BackgroundMode } from '../composables/useHomeLogic';

const props = defineProps<{
    mode: BackgroundMode;
    isDark: boolean;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
let animationFrameId: number;

interface Particle {
    x: number;
    y: number;
    size: number;
    speedY: number;
    speedX: number;
    opacity: number;
}

const particles: Particle[] = [];
const particleCount = 50;

const initParticles = (width: number, height: number) => {
    particles.length = 0;
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2 + 1,
            speedY: Math.random() * 0.5 + 0.2,
            speedX: Math.random() * 0.4 - 0.2,
            opacity: Math.random() * 0.5 + 0.2
        });
    }
};

const drawParticles = () => {
    const canvas = canvasRef.value;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set color based on theme
    ctx.fillStyle = props.isDark ? 'rgba(255, 255, 255, ' : 'rgba(0, 0, 0, ';

    particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = props.isDark 
            ? `rgba(255, 255, 255, ${p.opacity})` 
            : `rgba(100, 100, 100, ${p.opacity})`; // Darker particles for light theme
        ctx.fill();

        // Update position
        p.y += p.speedY;
        p.x += p.speedX;

        // Reset if out of bounds
        if (p.y > canvas.height) {
            p.y = -10;
            p.x = Math.random() * canvas.width;
        }
        if (p.x > canvas.width) p.x = 0;
        if (p.x < 0) p.x = canvas.width;
    });

    animationFrameId = requestAnimationFrame(drawParticles);
};

const startParticles = () => {
    const canvas = canvasRef.value;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    initParticles(canvas.width, canvas.height);
    drawParticles();
};

const stopParticles = () => {
    cancelAnimationFrame(animationFrameId);
};

// Handle resize
const handleResize = () => {
    if (props.mode === 'particles' && canvasRef.value) {
        canvasRef.value.width = window.innerWidth;
        canvasRef.value.height = window.innerHeight;
    }
};

watch(() => props.mode, async (newMode) => {
    if (newMode === 'particles') {
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
    if (props.mode === 'particles') {
        startParticles();
    }
    window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
    stopParticles();
    window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 1s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

@keyframes blob {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0px, 0px) scale(1); }
}

.animate-blob {
    animation: blob 10s infinite;
}

.animation-delay-2000 {
    animation-delay: 2s;
}

.animation-delay-4000 {
    animation-delay: 4s;
}
</style>