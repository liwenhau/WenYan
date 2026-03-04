import { ref, onMounted, onUnmounted } from 'vue';
import { useMessage } from 'naive-ui';
import axios from 'axios';
import type { Hitokoto } from '../types';
import { useFavorites } from './useFavorites';

export type BackgroundMode = 'noise' | 'ink' | 'particles';

export function useHomeLogic() {
    const message = useMessage();
    const loading = ref(false);
    const isLiked = ref(false);
    const likes = ref(20);
    const isPlaying = ref(false);
    const isDark = ref(true); // Default to dark mode
    const isVertical = ref(false); // Default to horizontal mode
    const backgroundMode = ref<BackgroundMode>('noise');
    const currentCategory = ref<string | null>(null); // null means random/all
    
    const { favorites, addToFavorites, removeFromFavorites, isFavorite } = useFavorites();

    const quote = ref<Hitokoto>({
        id: 0,
        hitokoto: '正在加载...',
        type: 'a',
        from: '...',
        from_who: null,
        creator: '',
        created_at: ''
    });

    // Audio
    const audio = new Audio('https://music.163.com/song/media/outer/url?id=1363948882.mp3'); 
    audio.loop = true;

    const toggleTheme = () => {
        isDark.value = !isDark.value;
    };

    const toggleVertical = () => {
        isVertical.value = !isVertical.value;
    };

    const toggleBackgroundMode = () => {
        const modes: BackgroundMode[] = ['noise', 'ink', 'particles'];
        const nextIndex = (modes.indexOf(backgroundMode.value) + 1) % modes.length;
        backgroundMode.value = modes[nextIndex];
        const modeNames = { noise: '噪点', ink: '水墨', particles: '粒子' };
        message.info(`已切换至${modeNames[backgroundMode.value]}背景`);
    };

    const setCategory = (category: string | null) => {
        currentCategory.value = category;
        fetchQuote();
    };

    const toggleLike = () => {
        if (!isLiked.value) {
            isLiked.value = true;
            likes.value++;
            addToFavorites(quote.value);
        } else {
            isLiked.value = false;
            likes.value--;
            removeFromFavorites(quote.value.id);
        }
    };

    const removeFavorite = (id: number) => {
        removeFromFavorites(id);
        if (quote.value.id === id) {
            isLiked.value = false;
            likes.value--;
        }
    };

    const fetchQuote = async () => {
        if (loading.value) return;
        loading.value = true;
        try {
            const params: Record<string, any> = {};
            if (currentCategory.value) {
                params.c = currentCategory.value;
            }

            const [res] = await Promise.all([
                axios.get<Hitokoto>('https://v1.hitokoto.cn', { params }),
                new Promise(resolve => setTimeout(resolve, 300))
            ]);
            
            quote.value = res.data;
            // Check if current quote is already in favorites
            isLiked.value = isFavorite(quote.value.id);
            likes.value = Math.floor(Math.random() * 50) + 10;
        } catch (err) {
            message.error('获取文案失败，请稍后重试');
            console.error(err);
        } finally {
            loading.value = false;
        }
    };

    // Restore quote from favorite
    const restoreQuote = (savedQuote: Hitokoto) => {
        quote.value = savedQuote;
        isLiked.value = true;
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

    const handleKeydown = (e: KeyboardEvent) => {
        if (e.code === 'Space') {
            e.preventDefault();
            fetchQuote();
        }
    };

    onMounted(() => {
        fetchQuote();
        window.addEventListener('keydown', handleKeydown);
    });

    onUnmounted(() => {
        window.removeEventListener('keydown', handleKeydown);
        audio.pause();
    });

    return {
        quote,
        loading,
        isLiked,
        likes,
        isPlaying,
        isDark,
        isVertical,
        backgroundMode,
        favorites,
        currentCategory,
        fetchQuote,
        copyQuote,
        toggleLike,
        toggleMusic,
        toggleTheme,
        toggleVertical,
        toggleBackgroundMode,
        setCategory,
        removeFavorite,
        restoreQuote
    };
}
