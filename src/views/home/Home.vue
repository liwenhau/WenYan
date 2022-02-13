<template>
    <div
        class="flex flex-col md:flex-row h-screen p-2 m-1 md:m-0 md:bg-white shadow-md rounded-md bg-black"
    >
        <header
            class="max-h-screen md:w-16 flex md:flex-col heti heti--ancient text-white md:text-black"
        >
            <div class="w-3/5 md:h-1/2 md:w-full md:relative">
                <h2 class="heti--vertical md:top-10 md:absolute">闻言</h2>
            </div>
            <div class="w-2/5 md:h-1/2 md:w-full md:relative">
                <i-topcoat-like
                    class="md:mx-auto ml-auto md:absolute md:inset-x-0 md:bottom-10 animate-bounce text-red-600"
                />
                <n-icon><thumb-like16-filled/></n-icon>
            </div>
        </header>
        <div class="md:p-2 md:m-10 flex-grow bg-black text-blue-50 shadow-md rounded-md">
            <div class="mx-auto my-auto">
                <div class="heti heti--ancient">
                    <h2>
                        一剪梅·红藕香残玉簟秋
                        <span class="heti-meta heti-small">
                            [宋]
                            <abbr title="号易安居士">李清照</abbr>
                        </span>
                    </h2>
                    <div class="heti-verse heti-x-large">
                        红藕香残玉簟秋。轻解罗裳，独上兰舟
                        <span class="heti-hang">。</span>
                        <br />云中谁寄锦书来，雁字回时，月满西楼
                        <span class="heti-hang">。</span>
                        <br />花自飘零水自流。一种相思，两处闲愁
                        <span class="heti-hang">。</span>
                        <br />此情无计可消除，才下眉头，却上心头
                        <span class="heti-hang">。</span>
                    </div>
                </div>
            </div>
        </div>
        <footer class="md:w-16"></footer>
    </div>
</template>
<script lang="ts">
import { computed, defineComponent, unref, ref, reactive, toRefs } from 'vue';
import { useRouter } from 'vue-router';
import { ThumbLike16Filled } from '@vicons/fluent'
export default defineComponent({
    components:{
     ThumbLike16Filled
    },
    setup() {
        const router = useRouter();
        const state = reactive({
            name: 'hhhh'
        });
        return { ...toRefs(state) };
    },
});
</script>
<style>
</style>