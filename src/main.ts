import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './index.css'
import {
    // create naive ui
    create,
    NCard,
    NIcon,
    NIconWrapper,
    NBadge,
    NTag,
    NTooltip,
    NPopover
    // coponent
} from 'naive-ui'
const naive = create({
    components: [NCard,NIcon,NIconWrapper,NBadge,NTag,NTooltip,NPopover]
})
createApp(App).use(router).use(naive).mount('#app')
