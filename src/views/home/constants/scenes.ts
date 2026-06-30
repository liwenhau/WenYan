import type { BackgroundMode } from '../composables/useHomeLogic';

export interface ScenePreset {
    mode: BackgroundMode;
    label: string;
    line: string;
    shareLabel: string;
    cardClass: string;
    accent: string;
    music: {
        id: number;
        title: string;
        artist?: string;
    };
}

export const scenePresets: ScenePreset[] = [
    {
        mode: 'still',
        label: '静读',
        line: '纸面微光',
        shareLabel: '静读笺',
        cardClass: 'share-card--still',
        accent: '#b89558',
        music: {
            id: 1363948882,
            title: '静读背景'
        }
    },
    {
        mode: 'night',
        label: '夜诵',
        line: '灯下有声',
        shareLabel: '夜诵笺',
        cardClass: 'share-card--night',
        accent: '#7fa6c8',
        music: {
            id: 1397345903,
            title: '夜诵背景'
        }
    },
    {
        mode: 'rain',
        label: '雨窗',
        line: '隔窗听句',
        shareLabel: '雨窗笺',
        cardClass: 'share-card--rain',
        accent: '#86aaa5',
        music: {
            id: 28188427,
            title: '雨窗背景'
        }
    },
    {
        mode: 'mountain',
        label: '山房',
        line: '岚气入卷',
        shareLabel: '山房笺',
        cardClass: 'share-card--mountain',
        accent: '#8fa77b',
        music: {
            id: 1363948882,
            title: '山房背景'
        }
    }
];

export const scenePresetMap = scenePresets.reduce((acc, scene) => {
    acc[scene.mode] = scene;
    return acc;
}, {} as Record<BackgroundMode, ScenePreset>);
