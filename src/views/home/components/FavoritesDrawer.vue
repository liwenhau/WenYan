<template>
    <div v-if="show" class="fixed inset-0 z-50 flex justify-end">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity" @click="emit('close')"></div>

        <!-- Drawer -->
        <div class="relative w-full max-w-sm h-full shadow-2xl flex flex-col transition-transform duration-300 transform translate-x-0"
             :class="isDark ? 'bg-[#1a1a1a] text-[#e0e0e0] border-l border-white/10' : 'bg-white text-[#333] border-l border-black/5'">
            
            <!-- Header -->
            <div class="p-6 border-b flex items-center justify-between"
                 :class="isDark ? 'border-white/10' : 'border-black/5'">
                <h2 class="text-xl font-bold font-serif tracking-widest">我的收藏</h2>
                <button @click="emit('close')" 
                        class="p-2 rounded-full transition-colors"
                        :class="isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'">
                    <n-icon size="20"><Dismiss24Regular /></n-icon>
                </button>
            </div>

            <!-- List -->
            <div class="flex-1 overflow-y-auto p-4 space-y-4">
                <div v-if="favorites.length === 0" class="h-full flex flex-col items-center justify-center opacity-40 text-sm tracking-widest">
                    <n-icon size="48" class="mb-4"><HeartBroken24Regular /></n-icon>
                    <span>暂无收藏</span>
                </div>

                <div v-for="fav in favorites" :key="fav.id"
                     class="group relative p-4 rounded-lg border transition-all duration-300 hover:shadow-lg cursor-pointer flex flex-col"
                     :class="isDark ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-white border-black/5 hover:border-black/10'"
                     @click="emit('select', fav)">
                    
                    <div class="font-serif text-lg mb-3 line-clamp-3 leading-relaxed">
                        {{ fav.hitokoto }}
                    </div>
                    
                    <div class="flex justify-between items-center text-xs opacity-60 mt-auto w-full">
                        <span>{{ fav.from_who || fav.from }}</span>
                        
                        <button @click.stop="emit('remove', fav.id)" 
                                class="p-1.5 rounded-full hover:bg-red-500/10 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                            <n-icon size="16"><Delete24Regular /></n-icon>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Dismiss24Regular, Delete24Regular } from '@vicons/fluent';
import type { Hitokoto } from '../types';

defineProps<{
  show: boolean;
  isDark: boolean;
  favorites: Hitokoto[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'remove', id: number): void;
  (e: 'select', quote: Hitokoto): void;
}>();
</script>
