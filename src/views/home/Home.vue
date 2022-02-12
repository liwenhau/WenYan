<template>
    <div class="flex flex-col md:flex-row">
        <header class="">logo</header>
        <div
            class="mx-auto w-full h-full p-2 shadow-md rounded-md bg-gradient-to-r from-gray-800 to-indigo-900 dark:bg-black text-blue-50"
        >
            <div>作者</div>
            <div>内容</div>
        </div>
        <footer>点赞评论</footer>
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