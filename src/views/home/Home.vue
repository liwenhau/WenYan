<template>
    <div class="relative w-full h-screen overflow-hidden bg-[#1a1a1a] text-[#e0e0e0] font-serif select-none flex flex-col md:flex-row" @click="handleBackgroundClick">
        
        <!-- Noise Texture Overlay -->
        <div class="absolute inset-0 pointer-events-none z-0 opacity-[0.03]"
             style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E');">
        </div>

        <!-- Sidebar / Header -->
        <header class="relative z-10 flex md:flex-col justify-between items-center p-6 md:w-24 md:h-full border-b md:border-b-0 md:border-r border-white/5 bg-[#1a1a1a]/80 backdrop-blur-sm transition-all duration-500 ease-in-out">
            <!-- Logo / Title -->
            <div class="flex-shrink-0 cursor-pointer group" @click.stop="fetchQuote">
                <h1 class="heti--vertical text-3xl font-bold tracking-widest text-white/90 group-hover:text-white transition-colors duration-500" style="font-family: 'Songti SC', serif;">
                    聞言
                </h1>
            </div>

            <!-- Actions -->
            <div class="flex md:flex-col gap-6 items-center" @click.stop>
                <n-badge :value="likes" :max="999" show-zero :offset="[-5, 5]">
                    <button 
                        class="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-white/10 active:scale-95"
                        :class="isLiked ? 'text-red-500' : 'text-neutral-400 hover:text-white'"
                        @click="toggleLike">
                        <n-icon size="22">
                            <Heart12Filled />
                        </n-icon>
                    </button>
                </n-badge>

                <n-tooltip trigger="hover" placement="right">
                    <template #trigger>
                        <button 
                            class="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-white/10 active:scale-95"
                            :class="isPlaying ? 'text-blue-400' : 'text-neutral-400 hover:text-white'"
                            @click="toggleMusic">
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
                            class="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-white/10 active:scale-95 text-neutral-400 hover:text-white"
                            @click="copyQuote">
                            <n-icon size="20">
                                <Copy16Regular /> 
                            </n-icon>
                        </button>
                    </template>
                    复制
                </n-tooltip>
            </div>
        </header>

        <!-- Main Content Area -->
        <main class="relative z-10 flex-grow flex flex-col justify-center items-center p-8 md:p-12 transition-opacity duration-700 ease-out" 
              :class="{'opacity-60 blur-sm': loading, 'opacity-100 blur-0': !loading}">
            
            <!-- Decorative Elements -->
            <div class="absolute top-10 right-10 w-24 h-24 border-t border-r border-white/5 rounded-tr-3xl pointer-events-none"></div>
            <div class="absolute bottom-10 left-10 w-24 h-24 border-b border-l border-white/5 rounded-bl-3xl pointer-events-none"></div>

            <article class="text-center max-w-5xl w-full flex flex-col items-center justify-center min-h-[40vh] cursor-pointer" @click.stop="fetchQuote">
                
                <!-- Quote Text -->
                <div class="relative mb-12 md:mb-16 px-4">
                    <transition name="fade-slide" mode="out-in">
                        <div :key="quote.id" class="text-3xl md:text-5xl lg:text-6xl leading-relaxed tracking-wide font-serif text-shadow-sm">
                            <span class="text-white/20 text-6xl absolute -top-8 -left-8 font-serif">“</span>
                            <span class="heti--ancient inline-block">{{ quote.hitokoto }}</span>
                            <span class="text-white/20 text-6xl absolute -bottom-8 -right-8 font-serif">”</span>
                        </div>
                    </transition>
                </div>
                
                <!-- Metadata -->
                <div class="flex flex-col items-end gap-2 text-lg md:text-xl text-neutral-400 font-light tracking-wider transition-opacity duration-500 delay-100" 
                     :class="{'opacity-0 translate-y-4': loading, 'opacity-80 translate-y-0': !loading}">
                    <cite class="not-italic border-b border-white/10 pb-1 hover:border-white/30 transition-colors">
                        {{ quote.from }}
                    </cite>
                    <span class="text-sm md:text-base opacity-70 mt-1" v-if="quote.from_who">
                        — {{ quote.from_who }}
                    </span>
                </div>
            </article>

            <!-- Footer Instructions -->
             <div class="absolute bottom-6 md:bottom-8 text-neutral-600 text-xs tracking-[0.2em] opacity-40 hover:opacity-80 transition-opacity duration-300 font-sans uppercase">
                <span class="hidden md:inline">Space to Shuffle &nbsp;•&nbsp; Click to Copy</span>
                <span class="md:hidden">Tap to Shuffle</span>
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Heart12Filled, MusicNote120Filled, Copy16Regular } from '@vicons/fluent';
import { useMessage } from 'naive-ui';
import axios from 'axios';

// Interfaces
interface Hitokoto {
    id: number;
    hitokoto: string;
    type: string;
    from: string;
    from_who: string | null;
    creator: string;
    created_at: string;
}

// State
const message = useMessage();
const loading = ref(false);
const isLiked = ref(false);
const likes = ref(20);
const isPlaying = ref(false);
const quote = ref<Hitokoto>({
    id: 0,
    hitokoto: '正在加载...',
    type: 'a',
    from: '...',
    from_who: null,
    creator: '',
    created_at: ''
});

// Audio (Placeholder URL - using a reliable nature sound or loop if possible, sticking to user's URL for now)
const audio = new Audio('https://music.163.com/song/media/outer/url?id=1363948882.mp3'); 
audio.loop = true;

// Methods
const fetchQuote = async () => {
    if (loading.value) return;
    loading.value = true;
    try {
        // Adding a small artificial delay for smoother UI feel if API is too fast
        const [res] = await Promise.all([
            axios.get<Hitokoto>('https://v1.hitokoto.cn'),
            new Promise(resolve => setTimeout(resolve, 300))
        ]);
        
        quote.value = res.data;
        isLiked.value = false;
        likes.value = Math.floor(Math.random() * 50) + 10;
    } catch (err) {
        message.error('获取文案失败，请稍后重试');
        console.error(err);
    } finally {
        loading.value = false;
    }
};

const copyQuote = async () => {
    try {
        const text = `${quote.value.hitokoto} —— ${quote.value.from_who || ''}「${quote.value.from}」`;
        await navigator.clipboard.writeText(text);
        message.success('已复制到剪贴板');
    } catch (err) {
        message.error('复制失败');
    }
};

const toggleLike = () => {
    isLiked.value = !isLiked.value;
    if (isLiked.value) {
        likes.value++;
        message.success('❤️ 已收藏');
    } else {
        likes.value--;
    }
};

const toggleMusic = () => {
    isPlaying.value = !isPlaying.value;
    if (isPlaying.value) {
        audio.play().catch(() => {
            message.warning('无法播放音乐，请检查网络或交互限制');
            isPlaying.value = false;
        });
    } else {
        audio.pause();
    }
};

const handleBackgroundClick = (e: MouseEvent) => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) return;
    fetchQuote();
};

const handleKeydown = (e: KeyboardEvent) => {
    if (e.code === 'Space') {
        e.preventDefault();
        fetchQuote();
    }
};

// Lifecycle
onMounted(() => {
    fetchQuote();
    window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
    audio.pause();
});
</script>

<style scoped>
/* Typography */
.font-serif {
    font-family: "Songti SC", "Noto Serif SC", "SimSun", serif;
}

.heti--vertical {
    writing-mode: vertical-rl;
    text-orientation: upright;
    letter-spacing: 0.1em;
}

.text-shadow-sm {
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

/* Animations */
.animate-spin-slow {
    animation: spin 8s linear infinite;
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

/* Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
    transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-slide-enter-from {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
    filter: blur(4px);
}

.fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-10px) scale(0.98);
    filter: blur(4px);
}
</style>
