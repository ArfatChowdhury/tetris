import React from 'react';

export type LineClearEffect = 'flash' | 'explode' | 'dissolve' | 'shatter';

export interface BlockStyle {
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  opacity?: number;
  glow?: boolean;
  glass?: boolean;
  led?: boolean;
  lava?: boolean;
  magnifier?: boolean;
  magnifierScale?: number;
  breathing?: boolean;
  marshmallow?: boolean;
  fluffy?: boolean;
  uniformColor?: string;
  cyber?: boolean;
}

export interface SkinColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string[];
}

export interface SkinDefinition {
  id: string;
  name: string;
  price: number;
  preview: string;
  image?: any; // require() image source for Mosaic
  uiStyle: 'glass' | 'cartoon' | 'neumorphic' | 'kawaii' | 'dream';
  particles?: 'ash' | 'hearts' | 'bubbles' | 'sparks';
  imageScale?: number;
  waterDroplets?: boolean;
  blockStyle: BlockStyle;
  particleColor: string;
  lineClearEffect: LineClearEffect;
  colors?: SkinColors;
  frames?: any[]; // For animated backgrounds
}

export const SKINS: SkinDefinition[] = [
  {
    id: 'goku_mosaic',
    name: 'Ultra Instinct',
    price: 0,
    preview: '⚡',
    image: require('../assets/images/goku_mosaic_bg.png'),
    uiStyle: 'glass',
    blockStyle: {
      glow: true,
      glass: true,
      magnifier: true,
      magnifierScale: 3.0,
      borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    particleColor: '#00ffff',
    lineClearEffect: 'shatter',
  },
  {
    id: 'samurai_embers',
    name: 'Crimson Samurai',
    price: 699,
    preview: '🔥',
    image: require('../assets/images/samurai_embers_bg.png'),
    uiStyle: 'glass',
    particles: 'ash',
    blockStyle: {
      lava: true,
      breathing: true,
      magnifier: true,
      magnifierScale: 2.0,
    },
    particleColor: '#ff4500',
    lineClearEffect: 'dissolve',
    colors: {
      primary: '#FF4500',
      secondary: '#8B0000',
      accent: '#FFD700',
      background: ['#0A0000', '#2A0505', '#0A0000'],
    },
  },
  {
    id: 'kawaii_crunch',
    name: 'Kawaii Carrot Crunch',
    price: 0,
    preview: '🐰',
    image: require('../assets/images/bunny/rabbit.png'),
    uiStyle: 'kawaii',
    particles: 'hearts',
    imageScale: 0.8,
    blockStyle: {
      marshmallow: true,
      fluffy: true,
      uniformColor: '#FFB6C1',
      borderColor: 'rgba(255, 182, 193, 0.4)', // Soft pink border
    },
    particleColor: '#FF69B4',
    lineClearEffect: 'dissolve',
    colors: {
      primary: '#FFB6C1', // Light pink
      secondary: '#FF8C00', // Carrot orange
      accent: '#FFFFFF',
      background: ['#FFF0F5', '#FFC0CB', '#FFF0F5'], // Soft pink gradient
    },
  },
  {
    id: 'bubblegum_bunny',
    name: 'Bubblegum Bunny',
    price: 1500,
    preview: '🫧',
    image: require('../assets/images/bunny/rabbit2.png'),
    uiStyle: 'neumorphic',
    particles: 'bubbles',
    blockStyle: {
      marshmallow: true,
      fluffy: true,
      uniformColor: '#FFB6C1',
      borderColor: 'rgba(255, 105, 180, 0.4)',
    },
    particleColor: '#FF69B4',
    lineClearEffect: 'dissolve',
    colors: {
      primary: '#FF69B4',
      secondary: '#00FFFF',
      accent: '#FFFFFF',
      background: ['#E0F7FA', '#FCE4EC', '#F8BBD0'],
    },
  },
  {
    id: 'cyber_void',
    name: 'Cyber-Void 2077',
    price: 2500,
    preview: '💾',
    uiStyle: 'glass',
    particles: 'sparks',
    blockStyle: {
      cyber: true,
      magnifier: true,
      magnifierScale: 1.5,
      glow: true,
    },
    particleColor: '#00ffff',
    lineClearEffect: 'shatter',
    colors: {
      primary: '#00FFFF', // Neon Cyan
      secondary: '#9400D3', // Dark Violet
      accent: '#FF00FF', // Magenta
      background: ['#050010', '#10002B', '#050010'],
    },
  },
  {
    id: 'anime_dreamscape',
    name: 'Eternal Dream',
    price: 3500,
    preview: '🌸',
    image: require('../assets/anime-girl/ezgif-frame-001.jpg'),
    frames: [
      require('../assets/anime-girl/ezgif-frame-001.jpg'),
      require('../assets/anime-girl/ezgif-frame-002.jpg'),
      require('../assets/anime-girl/ezgif-frame-003.jpg'),
      require('../assets/anime-girl/ezgif-frame-004.jpg'),
      require('../assets/anime-girl/ezgif-frame-005.jpg'),
      require('../assets/anime-girl/ezgif-frame-006.jpg'),
      require('../assets/anime-girl/ezgif-frame-007.jpg'),
      require('../assets/anime-girl/ezgif-frame-008.jpg'),
      require('../assets/anime-girl/ezgif-frame-009.jpg'),
      require('../assets/anime-girl/ezgif-frame-010.jpg'),
      require('../assets/anime-girl/ezgif-frame-011.jpg'),
      require('../assets/anime-girl/ezgif-frame-012.jpg'),
      require('../assets/anime-girl/ezgif-frame-013.jpg'),
      require('../assets/anime-girl/ezgif-frame-014.jpg'),
      require('../assets/anime-girl/ezgif-frame-015.jpg'),
      require('../assets/anime-girl/ezgif-frame-016.jpg'),
      require('../assets/anime-girl/ezgif-frame-017.jpg'),
      require('../assets/anime-girl/ezgif-frame-018.jpg'),
      require('../assets/anime-girl/ezgif-frame-019.jpg'),
      require('../assets/anime-girl/ezgif-frame-020.jpg'),
      require('../assets/anime-girl/ezgif-frame-021.jpg'),
      require('../assets/anime-girl/ezgif-frame-022.jpg'),
      require('../assets/anime-girl/ezgif-frame-023.jpg'),
      require('../assets/anime-girl/ezgif-frame-024.jpg'),
      require('../assets/anime-girl/ezgif-frame-025.jpg'),
    ],
    uiStyle: 'dream', 
    particles: 'sparks',
    blockStyle: {
      glass: true,
      glow: true,
      opacity: 0.7,
      borderColor: '#ff69b4',
    },
    particleColor: '#ff69b4',
    lineClearEffect: 'shatter',
    colors: {
      primary: '#ffb6c1',
      secondary: '#dda0dd',
      accent: '#ffffff',
      background: ['#1a0b1a', '#2a0b2a', '#1a0b1a'], // Darker background to let the dream image pop
    },
  },
  {
    id: 'pixel_retro',
    name: '8-Bit Arcade',
    price: 1200,
    preview: '🕹️',
    image: require('../assets/images/imagine-art-feed-item (2).png'),
    uiStyle: 'cartoon',
    blockStyle: {
      borderRadius: 0,
      borderWidth: 2,
      borderColor: '#ffffff',
    },
    particleColor: '#ffffff',
    lineClearEffect: 'explode',
    colors: {
      primary: '#ffffff',
      secondary: '#333333',
      accent: '#ffcc00',
      background: ['#000000', '#111111', '#000000'],
    },
  },
  {
    id: 'solar_inferno_v2',
    name: 'Solar Flare',
    price: 2000,
    preview: '☀️',
    image: require('../assets/images/1777444483521.jpeg'),
    uiStyle: 'glass',
    particles: 'sparks',
    blockStyle: {
      lava: true,
      breathing: true,
      magnifier: true,
      magnifierScale: 1.5,
    },
    particleColor: '#ff4500',
    lineClearEffect: 'shatter',
    colors: {
      primary: '#ff4500',
      secondary: '#ff8c00',
      accent: '#ffff00',
      background: ['#200000', '#500000', '#200000'],
    },
  },
  {
    id: 'minimal_zen',
    name: 'Zen Minimalist',
    price: 800,
    preview: '⚪',
    image: require('../assets/images/imagine-art-feed-item.png'),
    uiStyle: 'neumorphic',
    blockStyle: {
      uniformColor: '#6c757d',
      borderRadius: 4,
    },
    particleColor: '#cccccc',
    lineClearEffect: 'dissolve',
    colors: {
      primary: '#6c757d',
      secondary: '#cccccc',
      accent: '#ffffff',
      background: ['#f0f0f0', '#ffffff', '#f0f0f0'],
    },
  },
];
