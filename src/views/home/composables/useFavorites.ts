import { ref, onMounted } from 'vue';
import { useMessage } from 'naive-ui';
import type { Hitokoto } from '../types';

export function useFavorites() {
    const message = useMessage();
    const favorites = ref<Hitokoto[]>([]);

    const loadFavorites = () => {
        try {
            const saved = localStorage.getItem('wenyan-favorites');
            if (saved) {
                favorites.value = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Failed to load favorites', e);
        }
    };

    const saveFavorites = () => {
        localStorage.setItem('wenyan-favorites', JSON.stringify(favorites.value));
    };

    const addToFavorites = (quote: Hitokoto) => {
        if (!favorites.value.find(f => f.id === quote.id)) {
            favorites.value.unshift(quote);
            saveFavorites();
            message.success('❤️ 已收藏');
        }
    };

    const removeFromFavorites = (id: number) => {
        const index = favorites.value.findIndex(f => f.id === id);
        if (index > -1) {
            favorites.value.splice(index, 1);
            saveFavorites();
        }
    };

    const isFavorite = (id: number) => {
        return favorites.value.some(f => f.id === id);
    };

    onMounted(() => {
        loadFavorites();
    });

    return {
        favorites,
        addToFavorites,
        removeFromFavorites,
        isFavorite
    };
}
