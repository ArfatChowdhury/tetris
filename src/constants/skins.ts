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
  inkStroke?: boolean;
  refractiveGlass?: boolean;
  eldritchRune?: boolean;
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
  uiStyle: 'glass' | 'cartoon' | 'neumorphic' | 'kawaii' | 'dream' | 'anime' | 'comic';
  particles?: 'ash' | 'hearts' | 'bubbles' | 'sparks';
  imageScale?: number;
  imageFit?: 'cover' | 'contain' | 'fill';
  bobbingAnimation?: boolean;
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
    uiStyle: 'dream',
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
    uiStyle: 'dream',
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
    id: 'surfer_comic',
    name: 'Surfer\'s Comic Rush',
    price: 3500,
    preview: '🏄‍♂️',
    image: require('../assets/images/1777444483521.jpeg'),
    uiStyle: 'comic',
    particles: 'sparks',
    blockStyle: {
      glass: true,
      borderColor: '#000000',
    },
    particleColor: '#ffffff',
    lineClearEffect: 'shatter',
    colors: {
      primary: '#000000',
      secondary: '#ffffff',
      accent: '#ffcc00',
      background: ['#003366', '#004080', '#003366'],
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
  {
    id: 'phantom_ronin',
    name: 'Phantom Ronin',
    price: 4500,
    preview: '⚔️',
    image: require('../assets/images/1777444483521.jpeg'),
    uiStyle: 'anime',
    imageFit: 'contain',
    bobbingAnimation: true,
    blockStyle: {
      inkStroke: true,
      glow: true,
      magnifier: false,
    },
    particleColor: '#ff00ff', // Magenta lightning sparks
    lineClearEffect: 'shatter',
    colors: {
      primary: '#000000', // Ink black
      secondary: '#ff00ff', // Neon magenta
      accent: '#00ffff', // Neon cyan
      background: ['#e5e5e5', '#d4d4d4', '#e5e5e5'], // Parchment
    },
  },
  {
    id: 'crystalline_void',
    name: 'Crystalline Void',
    price: 5000,
    preview: '💎',
    uiStyle: 'glass',
    particles: 'bubbles',
    blockStyle: {
      refractiveGlass: true,
      magnifier: true,
      magnifierScale: 2.5,
    },
    particleColor: '#ffffff',
    lineClearEffect: 'shatter',
    colors: {
      primary: '#ffffff',
      secondary: '#00ced1',
      accent: '#ff00ff',
      background: ['#00001a', '#000033', '#00001a'],
    },
  },
  {
    id: 'eldritch_resonance',
    name: 'Eldritch Resonance',
    price: 6660,
    preview: '👁️',
    uiStyle: 'glass',
    particles: 'ash',
    blockStyle: {
      eldritchRune: true,
      breathing: true,
    },
    particleColor: '#8a2be2', // Purple void ash
    lineClearEffect: 'dissolve',
    colors: {
      primary: '#2e004f', // Deep void purple
      secondary: '#00ff00', // Bioluminescent green
      accent: '#ff0000', // Blood red
      background: ['#0a001a', '#05000d', '#0a001a'],
    },
  },
];
