// Import all gallery modules
import * as basicCube from '../gallery/basic-cube';
import * as cameras from '../gallery/cameras';
import * as transformObjects from '../gallery/transform-objects';
import * as animation from '../gallery/animation';

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
    id: 'cameras',
    title: 'Cameras',
    description: 'Explore perspective and orthographic camera types with various shapes',
    module: cameras
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
  }
];

export function getGalleryItem(id: string): GalleryItem | undefined {
  return galleryItems.find(item => item.id === id);
}