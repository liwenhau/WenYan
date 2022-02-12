<template>
    <div class="flex flex-col md:flex-row h-screen p-2 m-1 md:m-0 md:bg-white shadow-md rounded-md bg-black">
        <header class="max-h-screen md:w-16 bg-white">
            <div class=""><img src="../../assets/images/log.svg" alt="" class="w-20"></div>           
        </header>
        <div
            class="md:p-2 md:m-1 flex-grow shadow-md rounded-md bg-gradient-to-r from-gray-800 to-indigo-900 dark:bg-black text-blue-50"
        >
            <div class="heti heti--ancient">
                <h2>
                    一剪梅·红藕香残玉簟秋
                    <span class="heti-meta heti-small">
                        [宋]
                        <abbr title="号易安居士">李清照</abbr>
                    </span>
                </h2>
                <p class="heti-verse heti-x-large">
                    红藕香残玉簟秋。轻解罗裳，独上兰舟
                    <span class="heti-hang">。</span>
                    <br />云中谁寄锦书来，雁字回时，月满西楼
                    <span class="heti-hang">。</span>
                    <br />花自飘零水自流。一种相思，两处闲愁
                    <span class="heti-hang">。</span>
                    <br />此情无计可消除，才下眉头，却上心头
                    <span class="heti-hang">。</span>
                </p>
            </div>
        </div>
        <footer class="md:w-16 bg-fuchsia-800">点赞评论</footer>
    </div>
</template>
<script lang="ts">
import { computed, defineComponent, unref, ref, reactive, toRefs } from 'vue';
import { useRouter } from 'vue-router';
export default defineComponent({
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