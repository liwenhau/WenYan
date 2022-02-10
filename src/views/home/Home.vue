<template>
</template>
<script lang="ts">
import { computed, defineComponent, unref, ref, reactive, toRefs } from 'vue';
import { useRouter } from 'vue-router';
export default defineComponent({
    setup() {
        const router = useRouter();
        const state = reactive({
             name:'hhhh'
        });
        return { ...toRefs(state)};
    },
});
</script>
<style>
</style>