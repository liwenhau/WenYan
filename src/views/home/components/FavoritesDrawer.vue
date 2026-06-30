<template>
    <div v-if="show" class="fixed inset-0 z-50 flex justify-end">
        <div class="absolute inset-0 bg-black/25 backdrop-blur-[3px] transition-opacity" @click="emit('close')"></div>

        <aside class="slip-drawer relative w-full max-w-lg h-full shadow-2xl flex flex-col transition-transform duration-300 transform translate-x-0"
               :class="isDark ? 'slip-drawer--dark text-[#e8e0d0] border-l border-white/10' : 'slip-drawer--light text-[#332a1f] border-l border-black/10'">
            <div class="slip-drawer__grain"></div>

            <header class="relative z-10 p-6 border-b flex items-start justify-between gap-4"
                    :class="isDark ? 'border-white/10' : 'border-black/10'">
                <div>
                    <p class="text-xs font-sans opacity-50 tracking-[0.28em] mb-2">句笺库</p>
                    <h2 class="text-2xl font-bold font-serif tracking-widest">我的收藏</h2>
                    <span class="slip-count">{{ favorites.length }} 张句笺</span>
                </div>
                <button @click="emit('close')"
                        class="slip-close p-2 rounded-full transition-colors"
                        aria-label="关闭收藏"
                        :class="isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'">
                    <n-icon size="20"><Dismiss24Regular /></n-icon>
                </button>
            </header>

            <section v-if="favorites.length > 0" class="slip-tools relative z-10 px-5 pt-5">
                <label class="slip-search" :class="isDark ? 'slip-search--dark' : 'slip-search--light'">
                    <n-icon size="18"><Search24Regular /></n-icon>
                    <input v-model="keyword" type="search" placeholder="搜索句子、出处或作者" />
                </label>
                <div class="slip-filters" role="tablist" aria-label="收藏分类筛选">
                    <button
                        v-for="filter in visibleFilters"
                        :key="filter.value"
                        class="slip-filter"
                        :class="[
                            selectedType === filter.value ? 'slip-filter--active' : '',
                            isDark ? 'slip-filter--dark' : 'slip-filter--light'
                        ]"
                        role="tab"
                        :aria-selected="selectedType === filter.value"
                        @click="selectedType = filter.value">
                        {{ filter.label }}
                    </button>
                </div>
            </section>

            <section class="relative z-10 flex-1 overflow-y-auto px-5 py-6">
                <div v-if="favorites.length === 0" class="empty-slip h-full flex flex-col items-center justify-center text-sm tracking-widest">
                    <div class="empty-slip__paper">
                        <n-icon size="42" class="mb-4"><Collections24Regular /></n-icon>
                        <span>还没有收进句笺</span>
                    </div>
                </div>

                <div v-else-if="filteredFavorites.length === 0" class="empty-slip h-full flex flex-col items-center justify-center text-sm tracking-widest">
                    <div class="empty-slip__paper">
                        <n-icon size="42" class="mb-4"><Search24Regular /></n-icon>
                        <span>没有匹配的句笺</span>
                    </div>
                </div>

                <div v-else class="slip-stack">
                    <article v-for="(fav, index) in filteredFavorites" :key="fav.id"
                             class="slip-card group relative cursor-pointer"
                             :class="isDark ? 'slip-card--dark' : 'slip-card--light'"
                             :style="getSlipStyle(index)"
                             @click="emit('select', fav)">
                        <div class="slip-card__pin"></div>
                        <div class="slip-card__meta">
                            <span>{{ typeLabel(fav.type) }}</span>
                            <span>#{{ fav.id }}</span>
                        </div>
                        <p class="font-serif text-lg leading-relaxed line-clamp-4">
                            {{ fav.hitokoto }}
                        </p>

                        <footer class="mt-5 flex justify-between items-center text-xs opacity-70 w-full">
                            <span class="truncate pr-4">{{ fav.from_who || fav.from || '未知出处' }}</span>
                            <button @click.stop="emit('remove', fav.id)"
                                    class="slip-delete p-1.5 rounded-full hover:bg-red-500/10 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                    aria-label="删除收藏">
                                <n-icon size="16"><Delete24Regular /></n-icon>
                            </button>
                        </footer>
                    </article>
                </div>
            </section>
        </aside>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Dismiss24Regular, Delete24Regular, Collections24Regular, Search24Regular } from '@vicons/fluent';
import type { CSSProperties } from 'vue';
import type { Hitokoto } from '../types';

const props = defineProps<{
  show: boolean;
  isDark: boolean;
  favorites: Hitokoto[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'remove', id: number): void;
  (e: 'select', quote: Hitokoto): void;
}>();

const keyword = ref('');
const selectedType = ref('all');

const typeNames: Record<string, string> = {
    a: '动画',
    b: '漫画',
    c: '游戏',
    d: '文学',
    e: '原创',
    f: '网络',
    g: '其他',
    h: '影视',
    i: '诗词',
    j: '网易云',
    k: '哲学',
    l: '抖机灵'
};

const typeLabel = (type: string) => typeNames[type] || '句笺';

const visibleFilters = computed(() => {
    const types = Array.from(new Set(props.favorites.map(fav => fav.type).filter(Boolean)));
    return [
        { value: 'all', label: '全部' },
        ...types.map(type => ({ value: type, label: typeLabel(type) }))
    ];
});

const filteredFavorites = computed(() => {
    const query = keyword.value.trim().toLowerCase();
    return props.favorites.filter(fav => {
        const typeMatched = selectedType.value === 'all' || fav.type === selectedType.value;
        if (!typeMatched) return false;
        if (!query) return true;
        return [fav.hitokoto, fav.from, fav.from_who || '', fav.creator || '', typeLabel(fav.type)]
            .join(' ')
            .toLowerCase()
            .includes(query);
    });
});

const getSlipStyle = (index: number) => ({
    '--slip-rotate': `${(index % 5 - 2) * 0.65}deg`,
    '--slip-offset': `${index % 3 * 0.35}rem`
} as CSSProperties);
</script>

<style scoped>
.slip-drawer {
    isolation: isolate;
    overflow: hidden;
}

.slip-drawer--dark {
    background:
        radial-gradient(circle at 80% 0%, rgba(205, 172, 104, 0.1), transparent 18rem),
        linear-gradient(160deg, #171512, #101214 58%, #1a1712);
}

.slip-drawer--light {
    background:
        radial-gradient(circle at 80% 0%, rgba(147, 105, 54, 0.12), transparent 18rem),
        linear-gradient(160deg, #eee4cf, #ddd7c8 56%, #efe6d3);
}

.slip-drawer__grain {
    position: absolute;
    inset: 0;
    opacity: 0.14;
    background-image:
        linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px),
        linear-gradient(0deg, rgba(255,255,255,0.04) 1px, transparent 1px);
    background-size: 42px 42px;
    pointer-events: none;
}

.slip-count {
    display: inline-block;
    margin-top: 0.65rem;
    font-size: 0.76rem;
    letter-spacing: 0.12em;
    opacity: 0.58;
}

.slip-tools {
    display: grid;
    gap: 0.75rem;
}

.slip-search {
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    gap: 0.55rem;
    min-height: 2.6rem;
    border: 1px solid;
    border-radius: 0.55rem;
    padding: 0 0.85rem;
}

.slip-search--dark {
    border-color: rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.06);
}

.slip-search--light {
    border-color: rgba(96, 67, 35, 0.14);
    background: rgba(255, 252, 240, 0.58);
}

.slip-search input {
    min-width: 0;
    border: 0;
    background: transparent;
    color: inherit;
    outline: none;
    font-size: 0.88rem;
}

.slip-search input::placeholder {
    color: currentColor;
    opacity: 0.42;
}

.slip-filters {
    display: flex;
    gap: 0.45rem;
    overflow-x: auto;
    padding-bottom: 0.2rem;
    scrollbar-width: none;
}

.slip-filters::-webkit-scrollbar {
    display: none;
}

.slip-filter {
    flex: 0 0 auto;
    min-height: 2rem;
    border: 1px solid;
    border-radius: 999px;
    padding: 0 0.75rem;
    background: transparent;
    color: inherit;
    font-size: 0.78rem;
    opacity: 0.7;
    transition: opacity 180ms ease, background-color 180ms ease, border-color 180ms ease;
}

.slip-filter--dark {
    border-color: rgba(255, 255, 255, 0.1);
}

.slip-filter--light {
    border-color: rgba(96, 67, 35, 0.16);
}

.slip-filter--active {
    border-color: rgba(216, 180, 108, 0.65);
    background: rgba(216, 180, 108, 0.18);
    opacity: 1;
}

.slip-close:focus-visible,
.slip-delete:focus-visible,
.slip-filter:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 3px;
}

.slip-stack {
    display: grid;
    gap: 1.1rem;
    padding-bottom: 2rem;
}

.slip-card {
    --slip-rotate: 0deg;
    --slip-offset: 0rem;
    position: relative;
    padding: 1rem 1.1rem 1rem;
    border-radius: 0.35rem;
    transform: translateX(var(--slip-offset)) rotate(var(--slip-rotate));
    transition: transform 260ms ease, box-shadow 260ms ease, border-color 260ms ease;
}

.slip-card:hover {
    transform: translateX(0) rotate(0deg) translateY(-2px);
}

.slip-card--dark {
    color: rgba(238, 229, 211, 0.92);
    border: 1px solid rgba(255, 255, 255, 0.08);
    background:
        linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.035)),
        rgba(40, 35, 27, 0.72);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
}

.slip-card--light {
    border: 1px solid rgba(96, 67, 35, 0.14);
    background:
        linear-gradient(145deg, rgba(255, 252, 240, 0.92), rgba(228, 213, 182, 0.68)),
        #efe3c8;
    box-shadow: 0 18px 38px rgba(88, 63, 35, 0.12);
}

.slip-card__pin {
    position: absolute;
    top: 0.72rem;
    right: 0.82rem;
    width: 0.42rem;
    height: 0.42rem;
    border-radius: 999px;
    background: #d8b46c;
    box-shadow: 0 0 0 4px rgba(216, 180, 108, 0.12);
}

.slip-card__meta {
    display: flex;
    gap: 0.6rem;
    margin-bottom: 0.7rem;
    padding-right: 1.2rem;
    font-size: 0.72rem;
    letter-spacing: 0.14em;
    opacity: 0.54;
}

.empty-slip {
    opacity: 0.72;
}

.empty-slip__paper {
    display: flex;
    min-width: 13rem;
    min-height: 10rem;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 1px dashed currentColor;
    border-radius: 0.4rem;
    opacity: 0.55;
}

@media (max-width: 767px) {
    .slip-drawer {
        max-width: 92vw;
    }
}
</style>
