import { shallowRef } from 'vue';
import { 
    Sparkle24Regular,
    MoviesAndTv24Regular,
    BookOpen24Regular,
    Games24Regular,
    Book24Regular,
    Open24Regular,
    Globe24Regular,
    MoreHorizontal24Regular,
    Video24Regular,
    TextQuote24Regular,
    Headphones24Regular,
    Lightbulb24Regular,
    EmojiLaugh24Regular
} from '@vicons/fluent';

export const categories = [
    { label: '随机推荐', value: null, icon: shallowRef(Sparkle24Regular) },
    { label: '动画', value: 'a', icon: shallowRef(MoviesAndTv24Regular) },
    { label: '漫画', value: 'b', icon: shallowRef(BookOpen24Regular) },
    { label: '游戏', value: 'c', icon: shallowRef(Games24Regular) },
    { label: '文学', value: 'd', icon: shallowRef(Book24Regular) },
    { label: '原创', value: 'e', icon: shallowRef(Open24Regular) },
    { label: '来自网络', value: 'f', icon: shallowRef(Globe24Regular) },
    { label: '其他', value: 'g', icon: shallowRef(MoreHorizontal24Regular) },
    { label: '影视', value: 'h', icon: shallowRef(Video24Regular) },
    { label: '诗词', value: 'i', icon: shallowRef(TextQuote24Regular) },
    { label: '网易云', value: 'j', icon: shallowRef(Headphones24Regular) },
    { label: '哲学', value: 'k', icon: shallowRef(Lightbulb24Regular) },
    { label: '抖机灵', value: 'l', icon: shallowRef(EmojiLaugh24Regular) },
];
