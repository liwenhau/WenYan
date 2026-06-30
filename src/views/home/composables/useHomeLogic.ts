import { ref, onMounted, onUnmounted } from 'vue';
import { useMessage } from 'naive-ui';
import axios from 'axios';
import type { Hitokoto } from '../types';
import { useFavorites } from './useFavorites';
import { scenePresetMap, scenePresets } from '../constants/scenes';

export type BackgroundMode = 'still' | 'night' | 'rain' | 'mountain';

export interface MusicTrack {
    id: number;
    title: string;
    artist?: string;
}

type QrLoginStatus = 'idle' | 'waiting' | 'success' | 'expired' | 'error';

export function useHomeLogic() {
    const message = useMessage();
    const loading = ref(false);
    const isLiked = ref(false);
    const likes = ref(20);
    const isPlaying = ref(false);
    const isDark = ref(true); // Default to dark mode
    const isVertical = ref(false); // Default to horizontal mode
    const backgroundMode = ref<BackgroundMode>('still');
    const currentCategory = ref<string | null>(null); // null means random/all
    const quoteHistory = ref<Hitokoto[]>([]);
    const currentMusicTitle = ref(scenePresetMap[backgroundMode.value].music.title);
    const musicSearchLoading = ref(false);
    const musicSearchResults = ref<MusicTrack[]>([]);
    const customMusicTrack = ref<MusicTrack | null>(null);
    const qrLoginStatus = ref<QrLoginStatus>('idle');
    const qrLoginImage = ref('');
    const desktopNeteaseApiBase = ref('');
    const neteaseApiAvailable = ref(Boolean(import.meta.env.VITE_NETEASE_API_BASE));
    
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

    const audio = new Audio();
    audio.loop = true;
    audio.preload = 'none';
    audio.volume = 0.42;
    let removeDesktopStateListener: (() => void) | undefined;

    const toggleTheme = () => {
        isDark.value = !isDark.value;
    };

    const toggleVertical = () => {
        isVertical.value = !isVertical.value;
    };

    const toggleBackgroundMode = () => {
        const modes = scenePresets.map(scene => scene.mode);
        const nextIndex = (modes.indexOf(backgroundMode.value) + 1) % modes.length;
        setBackgroundMode(modes[nextIndex]);
    };

    const setBackgroundMode = (mode: BackgroundMode, options: { silent?: boolean } = {}) => {
        backgroundMode.value = mode;
        if (!options.silent) {
            message.info(`已入${scenePresetMap[backgroundMode.value].label}`);
        }
        if (isPlaying.value && !customMusicTrack.value) {
            playSceneMusic();
        }
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
            
            if (quote.value.id !== 0) {
                quoteHistory.value = [quote.value, ...quoteHistory.value].slice(0, 12);
            }
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
        if (quote.value.id !== savedQuote.id && quote.value.id !== 0) {
            quoteHistory.value = [quote.value, ...quoteHistory.value].slice(0, 12);
        }
        quote.value = savedQuote;
        isLiked.value = true;
    };

    const restorePreviousQuote = () => {
        const previous = quoteHistory.value.shift();
        if (!previous) {
            message.info('还没有上一句');
            return;
        }
        quote.value = previous;
        isLiked.value = isFavorite(quote.value.id);
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

    const getNeteaseOuterMusicUrl = (id: number) => {
        return `https://music.163.com/song/media/outer/url?id=${id}.mp3`;
    };

    const getNeteaseApiBase = () => {
        return (import.meta.env.VITE_NETEASE_API_BASE || desktopNeteaseApiBase.value || '').replace(/\/$/, '');
    };

    const requestNeteaseApi = async (path: string, params: Record<string, any> = {}) => {
        const base = getNeteaseApiBase();
        if (!base) throw new Error('NetEase API base is not configured');
        return axios.get(`${base}${path}`, {
            params: {
                ...params,
                timestamp: Date.now()
            },
            withCredentials: true,
            timeout: 10000
        });
    };

    const resolveNeteaseMusicUrl = async (id: number) => {
        if (!getNeteaseApiBase()) return getNeteaseOuterMusicUrl(id);
        try {
            const res = await requestNeteaseApi('/song/url', {
                id,
                level: 'standard'
            });
            const url = res.data?.url || res.data?.data?.[0]?.url;
            if (url) return url as string;
        } catch {
            // Fallback to public outer URL when local API is unavailable.
        }
        return getNeteaseOuterMusicUrl(id);
    };

    const playSceneMusic = async () => {
        const scene = scenePresetMap[backgroundMode.value];
        const track = customMusicTrack.value || scene.music;
        currentMusicTitle.value = track.artist ? `${track.title} · ${track.artist}` : track.title;
        try {
            const url = await resolveNeteaseMusicUrl(track.id);
            if (audio.src !== url) {
                audio.src = url;
            }
            await audio.play();
        } catch {
            isPlaying.value = false;
            message.warning('网易云外链暂时无法播放，可检查歌曲可用性');
        }
    };

    const searchMusic = async (keyword: string) => {
        const trimmed = keyword.trim();
        if (!trimmed) {
            musicSearchResults.value = [];
            return;
        }
        musicSearchLoading.value = true;
        try {
            if (!getNeteaseApiBase()) {
                message.warning('请先配置 VITE_NETEASE_API_BASE 后搜索网易云歌曲');
                musicSearchResults.value = [];
                return;
            }
            const res = await requestNeteaseApi('/cloudsearch', {
                keywords: trimmed,
                type: 1,
                limit: 8,
                offset: 0
            });
            const songs = res.data?.songs || res.data?.result?.songs || [];
            musicSearchResults.value = songs.map((song: any) => ({
                id: Number(song.id),
                title: song.title || song.name,
                artist: song.artist || (Array.isArray(song.ar) ? song.ar.map((artist: any) => artist.name).join('/') : '')
            })).filter((song: MusicTrack) => song.id && song.title);
        } catch {
            message.warning('网易云搜索暂时不可用');
        } finally {
            musicSearchLoading.value = false;
        }
    };

    const selectMusicTrack = (track: MusicTrack) => {
        customMusicTrack.value = track;
        currentMusicTitle.value = track.artist ? `${track.title} · ${track.artist}` : track.title;
        isPlaying.value = true;
        playSceneMusic();
    };

    const resetSceneMusic = () => {
        customMusicTrack.value = null;
        currentMusicTitle.value = scenePresetMap[backgroundMode.value].music.title;
        if (isPlaying.value) playSceneMusic();
    };

    const startQrLogin = async () => {
        if (!getNeteaseApiBase()) {
            message.warning('请先配置网易云 API 服务地址');
            qrLoginStatus.value = 'error';
            return;
        }
        try {
            qrLoginStatus.value = 'waiting';
            const keyRes = await requestNeteaseApi('/login/qr/key');
            const key = keyRes.data?.key || keyRes.data?.data?.unikey;
            if (!key) throw new Error('Missing QR key');
            const createRes = await requestNeteaseApi('/login/qr/create', {
                key,
                qrimg: true
            });
            qrLoginImage.value = createRes.data?.img || createRes.data?.data?.qrimg || '';

            const poll = async () => {
                if (qrLoginStatus.value !== 'waiting') return;
                const checkRes = await requestNeteaseApi('/login/qr/check', { key });
                const code = Number(checkRes.data?.code);
                if (code === 803) {
                    qrLoginStatus.value = 'success';
                    message.success('网易云登录成功');
                    return;
                }
                if (code === 800) {
                    qrLoginStatus.value = 'expired';
                    message.warning('二维码已过期，请重新获取');
                    return;
                }
                if (code === 802 || code === 801) {
                    qrLoginStatus.value = 'waiting';
                } else if (checkRes.data?.error) {
                    throw new Error(checkRes.data.error || checkRes.data.message);
                }
                window.setTimeout(poll, 1800);
            };
            window.setTimeout(poll, 1800);
        } catch (error) {
            qrLoginStatus.value = 'error';
            message.error(error instanceof Error ? error.message : '网易云扫码登录初始化失败');
        }
    };

    const toggleMusic = () => {
        isPlaying.value = !isPlaying.value;
        if (isPlaying.value) {
            playSceneMusic();
        } else {
            audio.pause();
        }
    };

    onMounted(() => {
        window.wenyanDesktop?.getState().then(state => {
            desktopNeteaseApiBase.value = state.neteaseApiBase || '';
            neteaseApiAvailable.value = Boolean(getNeteaseApiBase());
        }).catch(() => {
            neteaseApiAvailable.value = Boolean(getNeteaseApiBase());
        });
        removeDesktopStateListener = window.wenyanDesktop?.onStateChanged(state => {
            desktopNeteaseApiBase.value = state.neteaseApiBase || '';
            neteaseApiAvailable.value = Boolean(getNeteaseApiBase());
        });
        fetchQuote();
    });

    onUnmounted(() => {
        removeDesktopStateListener?.();
        audio.pause();
        audio.src = '';
    });

    return {
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
        favorites,
        quoteHistory,
        currentCategory,
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
    };
}
