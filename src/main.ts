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
    NTag
    // component
} from 'naive-ui'
const naive = create({
    components: [NCard,NIcon,NIconWrapper,NBadge,NTag]
})
createApp(App).use(router).use(naive).mount('#app')
