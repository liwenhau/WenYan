<template>
    <div class="flex flex-col md:flex-row h-screen p-2  md:m-0 md:bg-white shadow-md rounded-md bg-black">
        <header class="max-h-screen md:w-16 flex md:flex-col heti heti--ancient text-white md:text-black">
            <div class="w-3/5 md:h-1/2 md:w-full md:relative">
                <h2 class="heti--vertical md:top-10 md:absolute">聞言</h2>
            </div>
            <div class="w-2/5 grid grid-cols-2 gap-4 md:h-1/2 md:w-full md:relative leading-relaxed">
                <n-avatar class="md:mx-auto ml-auto  md:absolute md:inset-x-0 md:bottom-10">
                    <n-badge :value="comments" show-zero>
                        <n-icon size="27" class=" text-red-600"><heart12-filled /></n-icon>
                    </n-badge>
                </n-avatar>
                <n-avatar>
                    <n-icon size="27"
                        class="md:mx-auto ml-auto  md:absolute md:inset-x-0 md:bottom-20 animate-bounce text-blue-600">
                        <music-note120-filled />
                    </n-icon>
                </n-avatar>
            </div>
        </header>
        <div class="md:p-2 md:m-10 flex-grow bg-black text-blue-50 shadow-md rounded-md relative ">
            <div class="h-full flex flex-col justify-center">
                <div class="align-middle md:text-2xl text-xl heti--ancient">
                    <q>{{ name }}</q>
                </div>
            </div>
        </div>
        <footer class="md:w-16"></footer>
    </div>
</template>
<script lang="ts">
import { computed, defineComponent, unref, ref, reactive, toRefs } from 'vue';
import { useRouter } from 'vue-router';
import { Heart12Filled, MusicNote120Filled } from '@vicons/fluent'
export default defineComponent({
    components: {
        Heart12Filled,
        MusicNote120Filled
    },
    setup() {
        const router = useRouter();
        const state = reactive({
            name: '一个人的意义不在于他的成就，而在于他所企求成就的东西。',
            comments: 20
        });
        return { ...toRefs(state) };
    },
});
</script>
<style></style>