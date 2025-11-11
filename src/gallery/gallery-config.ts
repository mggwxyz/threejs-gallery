// Import all gallery modules
import * as basicCube from './basic-cube';
import * as cameras from './cameras';
import * as transformObjects from './transform-objects';
import * as animation from './animation';
import * as textures from './textures';
import * as threeDText from './3d-text';
import * as physics from './physics';

export type GalleryModule = {
  default: (canvas: HTMLCanvasElement) => (() => void) | undefined;
};

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  module: GalleryModule;
}

export const galleryItems: GalleryItem[] = [
  {
    id: 'basic-cube',
    title: 'Basic Cube',
    description: 'A simple rotating cube with orbit controls and a floor',
    module: basicCube
  },
  {
    id: 'transform-objects',
    title: 'Transform Objects',
    description: 'Interactive transform controls for position, rotation, and scale',
    module: transformObjects
  },
  {
    id: 'animation',
    title: 'Animation',
    description: 'Complex timeline animations with multiple cubes using GSAP',
    module: animation
  },
  {
    id: 'cameras',
    title: 'Cameras',
    description: 'Explore perspective and orthographic camera types with various shapes',
    module: cameras
  },
  {
    id: 'textures',
    title: 'Textures',
    description: 'Explore different types of textures',
    module: textures
  },
  {
    id: '3d-text',
    title: '3D Text',
    description: 'Create 3D text with various fonts and styles',
    module: threeDText
  },
  {
    id: 'physics',
    title: 'Physics',
    description: 'Explore physics-based interactions with three.js',
    module: physics
  }
];

export function getGalleryItem(id: string): GalleryItem | undefined {
  return galleryItems.find(item => item.id === id);
}