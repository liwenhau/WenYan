<template>
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" @click.self="emit('close')">
        <div class="relative bg-white dark:bg-[#1a1a1a] rounded-xl shadow-2xl overflow-hidden max-w-md w-full flex flex-col">
            <!-- Card Preview Area -->
            <div ref="cardRef" class="relative p-8 md:p-12 aspect-[3/4] flex flex-col items-center justify-center text-center overflow-hidden transition-colors duration-0"
                 :class="[
                    themeConfig.bgClass,
                    themeConfig.textClass,
                    { 'vertical-rl': isVertical }
                 ]"
                 :style="themeConfig.customStyle">
                
                <!-- Background Noise (Reused) -->
                <div class="absolute inset-0 z-0 opacity-[0.03]"
                     style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E');">
                </div>

                <!-- Decorative Borders -->
                <div class="absolute top-6 right-6 w-16 h-16 border-t border-r rounded-tr-2xl pointer-events-none"
                     :class="themeConfig.borderClass"></div>
                <div class="absolute bottom-6 left-6 w-16 h-16 border-b border-l rounded-bl-2xl pointer-events-none"
                     :class="themeConfig.borderClass"></div>

                <!-- Content -->
                <div class="relative z-10 flex flex-col h-full w-full"
                     :class="isVertical ? 'justify-between' : 'items-center justify-center'">
                    
                    <div class="mb-8" :class="{ 'absolute top-8 right-8 mb-0': isVertical }">
                         <h1 class="text-2xl font-bold tracking-widest font-serif opacity-90">聞言</h1>
                    </div>

                    <div class="px-2 flex-grow flex items-center justify-center"
                         :class="isVertical ? 'mx-16' : 'mb-8'">
                        <div class="text-2xl leading-relaxed tracking-wide font-serif text-shadow-sm relative">
                            <span class="text-4xl absolute font-serif opacity-20"
                                  :class="isVertical ? '-top-4 -right-4' : '-top-6 -left-4'">“</span>
                            <span class="heti--ancient inline-block">{{ quote.hitokoto }}</span>
                            <span class="text-4xl absolute font-serif opacity-20"
                                  :class="isVertical ? '-bottom-4 -left-4' : '-bottom-6 -right-4'">”</span>
                        </div>
                    </div>

                    <div class="flex flex-col gap-1 text-base font-light tracking-wider opacity-80 w-full"
                         :class="isVertical ? 'items-start ml-4 flex-grow-0' : 'items-end mt-auto'">
                        <cite class="not-italic"
                              :class="[
                                  themeConfig.borderClass,
                                  isVertical ? 'border-l pl-2' : 'border-b pb-1'
                              ]">
                            {{ quote.from }}
                        </cite>
                        <span class="text-xs opacity-70 mt-1" v-if="quote.from_who">
                            — {{ quote.from_who }}
                        </span>
                    </div>
                    
                    <!-- QR Code / Footer -->
                    <div class="opacity-50 text-xs tracking-widest uppercase font-sans transition-all duration-300 flex"
                         :class="[
                            themeConfig.borderClass,
                            isVertical ? 'border-l pl-4 items-end gap-4 mt-auto' : 'mt-8 pt-4 w-full justify-between items-center border-t'
                         ]">
                         
                         <template v-if="isVertical">
                            <div class="bg-white p-1 rounded-sm">
                                <QrcodeVue :value="quote.hitokoto" :size="48" level="L" />
                            </div>
                            <div class="flex flex-col gap-2 writing-vertical-rl">
                                <span>WenYan · Daily Quote</span>
                                <span>{{ formattedDateCN }}</span>
                            </div>
                         </template>
                         
                         <template v-else>
                            <div class="flex flex-col">
                                <span>WenYan · Daily Quote</span>
                                <span>{{ formattedDateEN }}</span>
                            </div>
                            <div class="bg-white p-1 rounded-sm">
                                <QrcodeVue :value="quote.hitokoto" :size="48" level="L" />
                            </div>
                         </template>
                    </div>
                </div>
            </div>

            <!-- Customization Controls -->
            <div class="p-4 bg-white dark:bg-[#222] border-t dark:border-white/5 flex flex-col gap-4">
                <div class="flex justify-center gap-2">
                    <button v-for="theme in themes" :key="theme.name"
                            @click="currentTheme = theme.name"
                            class="w-8 h-8 rounded-full border-2 transition-all"
                            :class="[
                                theme.previewClass,
                                currentTheme === theme.name ? 'border-blue-500 scale-110' : 'border-transparent hover:scale-105'
                            ]"
                            :title="theme.label">
                    </button>
                </div>
                <div class="flex justify-center gap-4 text-sm">
                    <button @click="isVertical = !isVertical" 
                            class="flex items-center gap-1 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 transition-colors">
                        <n-icon><TextDirectionVertical24Regular v-if="!isVertical" /><TextDirectionHorizontalLeft24Regular v-else /></n-icon>
                        {{ isVertical ? '转为横排' : '转为竖排' }}
                    </button>
                </div>
            </div>

            <!-- Actions -->
            <div class="p-4 bg-white dark:bg-[#222] border-t dark:border-white/5 flex justify-between items-center gap-4">
                <button @click="emit('close')" class="px-4 py-2 text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors">
                    关闭
                </button>
                <button @click="downloadCard" 
                        class="px-6 py-2 bg-neutral-800 hover:bg-black text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-full text-sm font-medium transition-all active:scale-95 flex items-center gap-2"
                        :disabled="generating">
                    <span v-if="generating">生成中...</span>
                    <span v-else>保存图片</span>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import html2canvas from 'html2canvas';
import { useMessage } from 'naive-ui';
import QrcodeVue from 'qrcode.vue';
import { TextDirectionVertical24Regular, TextDirectionHorizontalLeft24Regular } from '@vicons/fluent';
import type { Hitokoto } from '../types';

const props = defineProps<{
  show: boolean;
  quote: Hitokoto;
  isDark: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const isVertical = ref(false);

const formattedDateEN = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
});

const formattedDateCN = new Date().toLocaleDateString('zh-CN-u-ca-chinese', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
}).replace(/(\d+)/g, (n) => {
    // Simple number to Chinese conversion if needed, but locale generic should handle basic format
    const chars = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    return n.split('').map(d => chars[parseInt(d)]).join('');
});

const message = useMessage();
const cardRef = ref<HTMLElement | null>(null);
const generating = ref(false);
const currentTheme = ref('default');

const themes = [
    { 
        name: 'default', 
        label: '默认',
        previewClass: 'bg-neutral-200',
        bgClass: props.isDark ? 'bg-[#1a1a1a]' : 'bg-[#f5f5f5]',
        textClass: props.isDark ? 'text-[#e0e0e0]' : 'text-[#333]',
        borderClass: props.isDark ? 'border-white/10' : 'border-black/10',
        customStyle: {}
    },
    { 
        name: 'paper', 
        label: '纸张',
        previewClass: 'bg-[#fdfbf7]',
        bgClass: 'bg-[#fdfbf7]',
        textClass: 'text-[#4a4a4a]',
        borderClass: 'border-[#8c8c8c]/20',
        customStyle: {}
    },
    { 
        name: 'ink', 
        label: '水墨',
        previewClass: 'bg-black',
        bgClass: 'bg-black',
        textClass: 'text-white/90',
        borderClass: 'border-white/20',
        customStyle: {}
    },
    { 
        name: 'blue', 
        label: '青花',
        previewClass: 'bg-[#1e3a8a]',
        bgClass: 'bg-[#1e3a8a]',
        textClass: 'text-white/90',
        borderClass: 'border-white/20',
        customStyle: {}
    },
    { 
        name: 'red', 
        label: '丹红',
        previewClass: 'bg-[#7f1d1d]',
        bgClass: 'bg-[#7f1d1d]',
        textClass: 'text-[#fecaca]',
        borderClass: 'border-[#fecaca]/20',
        customStyle: {}
    }
];

const themeConfig = computed(() => {
    const theme = themes.find(t => t.name === currentTheme.value) || themes[0];
    if (theme.name === 'default') {
        return {
            ...theme,
            bgClass: props.isDark ? 'bg-[#1a1a1a]' : 'bg-[#f5f5f5]',
            textClass: props.isDark ? 'text-[#e0e0e0]' : 'text-[#333]',
            borderClass: props.isDark ? 'border-white/10' : 'border-black/10'
        };
    }
    return theme;
});

const downloadCard = async () => {
    if (!cardRef.value || generating.value) return;
    
    generating.value = true;
    try {
        // Get the computed background color from the element to ensure html2canvas captures it correctly
        const computedStyle = window.getComputedStyle(cardRef.value);
        const backgroundColor = computedStyle.backgroundColor;

        const canvas = await html2canvas(cardRef.value, {
            scale: 2, // Retina quality
            useCORS: true,
            backgroundColor: backgroundColor,
            logging: false,
            onclone: (clonedDoc) => {
                const element = clonedDoc.querySelector('.vertical-rl') as HTMLElement;
                if (element && isVertical.value) {
                    // Fix for html2canvas vertical text issues
                    element.style.width = '100%';
                    element.style.height = '100%';
                    
                    // Force vertical writing mode on specific elements for html2canvas
                    const verticalElements = clonedDoc.querySelectorAll('.writing-vertical-rl');
                    verticalElements.forEach((el) => {
                         (el as HTMLElement).style.writingMode = 'vertical-rl';
                         (el as HTMLElement).style.textOrientation = 'mixed';
                    });

                    // Adjust positioning for html2canvas capture
                    const cardContent = clonedDoc.querySelector('.relative.p-8') as HTMLElement;
                    if(cardContent) {
                        cardContent.style.display = 'flex';
                        cardContent.style.flexDirection = 'column';
                    }
                }
            }
        });
        
        const link = document.createElement('a');
        link.download = `wenyan-quote-${props.quote.id}-${currentTheme.value}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        message.success('图片已保存');
        emit('close');
    } catch (err) {
        console.error(err);
        message.error('生成图片失败');
    } finally {
        generating.value = false;
    }
};
</script>

<style scoped>
.font-serif {
    font-family: "Songti SC", "Noto Serif SC", "SimSun", serif;
}
.text-shadow-sm {
    text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.heti--ancient {
    font-feature-settings: "fwid";
}

.vertical-rl {
    writing-mode: vertical-rl;
}

.writing-vertical-rl {
    writing-mode: vertical-rl;
    text-orientation: mixed;
}
</style>
