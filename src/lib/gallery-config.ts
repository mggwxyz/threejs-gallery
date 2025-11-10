export interface GalleryItem {
  id: string;
  title: string;
  description: string;
}

export const galleryItems: GalleryItem[] = [
  {
    id: 'basic-cube',
    title: 'Basic Cube',
    description: ''
  },
  {
    id: 'cameras',
    title: 'Camera Types',
    description: 'Explore perspective and orthographic camera types with various shapes'
  },
  {
    id: 'transform-cube',
    title: 'Transform Controls',
    description: 'Interactive transform controls for position, rotation, and scale'
  },
  {
    id: 'gsap-animation',
    title: 'GSAP Animations',
    description: 'Complex timeline animations with multiple cubes using GSAP'
  }
];

export function getGalleryItem(id: string): GalleryItem | undefined {
  return galleryItems.find(item => item.id === id);
}