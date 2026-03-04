<template>
    <div class="relative w-full h-screen overflow-hidden font-serif select-none flex flex-col md:flex-row transition-colors duration-500"
         :class="isDark ? 'bg-[#1a1a1a] text-[#e0e0e0]' : 'bg-[#f5f5f5] text-[#333]'"
         @click="handleBackgroundClick">
        
        <!-- Noise Texture Overlay -->
        <Background :mode="backgroundMode" :isDark="isDark" />

        <!-- Sidebar / Header -->
        <Sidebar 
            :likes="likes"
            :isLiked="isLiked"
            :isPlaying="isPlaying"
            :isDark="isDark"
            :isVertical="isVertical"
            :backgroundMode="backgroundMode"
            :currentCategory="currentCategory"
            @fetchQuote="fetchQuote"
            @toggleLike="toggleLike"
            @toggleMusic="toggleMusic"
            @toggleVertical="toggleVertical"
            @toggleBackgroundMode="toggleBackgroundMode"
            @copyQuote="copyQuote"
            @toggleTheme="toggleTheme"
            @setCategory="setCategory"
            @openShare="openShare"
            @openFavorites="openFavorites"
        />

        <!-- Main Content Area -->
        <main class="relative z-10 flex-grow flex flex-col justify-center items-center p-8 md:p-12 transition-opacity duration-700 ease-out" 
              :class="{'opacity-60 blur-sm': loading, 'opacity-100 blur-0': !loading}">
            
            <!-- Decorative Elements -->
            <div class="absolute top-10 right-10 w-24 h-24 border-t border-r rounded-tr-3xl pointer-events-none transition-colors duration-500"
                 :class="isDark ? 'border-white/5' : 'border-black/5'"></div>
            <div class="absolute bottom-10 left-10 w-24 h-24 border-b border-l rounded-bl-3xl pointer-events-none transition-colors duration-500"
                 :class="isDark ? 'border-white/5' : 'border-black/5'"></div>

            <QuoteDisplay 
                :quote="quote" 
                :loading="loading" 
                :isDark="isDark"
                :isVertical="isVertical"
                @fetchQuote="fetchQuote" 
            />

            <!-- Footer Instructions -->
            <FooterInstructions :isDark="isDark" />
        </main>

        <!-- Share Modal -->
        <ShareCard 
            v-if="showShare" 
            :show="showShare" 
            :quote="quote" 
            :isDark="isDark" 
            @close="closeShare" 
        />

        <!-- Favorites Drawer -->
        <FavoritesDrawer
            :show="showFavorites"
            :isDark="isDark"
            :favorites="favorites"
            @close="closeFavorites"
            @remove="removeFavorite"
            @select="handleFavoriteSelect"
        />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Background from './components/Background.vue';
import Sidebar from './components/Sidebar.vue';
import QuoteDisplay from './components/QuoteDisplay.vue';
import FooterInstructions from './components/FooterInstructions.vue';
import ShareCard from './components/ShareCard.vue';
import FavoritesDrawer from './components/FavoritesDrawer.vue';
import { useHomeLogic } from './composables/useHomeLogic';
import type { Hitokoto } from './types';

const { 
    quote, 
    loading, 
    isLiked, 
    likes, 
    isPlaying, 
    isDark,
    isVertical,
    backgroundMode,
    currentCategory,
    favorites,
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
} = useHomeLogic();

const showShare = ref(false);
const showFavorites = ref(false);

const openShare = () => {
    showShare.value = true;
};

const closeShare = () => {
    showShare.value = false;
};

const openFavorites = () => {
    showFavorites.value = true;
};

const closeFavorites = () => {
    showFavorites.value = false;
};

const handleFavoriteSelect = (quote: Hitokoto) => {
    restoreQuote(quote);
    closeFavorites();
};

const handleBackgroundClick = (e: MouseEvent) => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) return;
    // Prevent clicking background when modal is open
    if (showShare.value || showFavorites.value) return;
    fetchQuote();
};
</script>

<style scoped>
/* Typography */
.font-serif {
    font-family: "Songti SC", "Noto Serif SC", "SimSun", serif;
}
</style>
