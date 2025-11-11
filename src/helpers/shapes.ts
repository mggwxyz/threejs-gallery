import * as THREE from 'three';

interface CreateCubeOptions {
  size: number;
  color?: THREE.Color;
  position: { x?: number; y?: number; z?: number };
  map?: THREE.Texture;
}
export function createCube(options: CreateCubeOptions) {
  const { size = 1, color, position = { x: 0, y: 0, z: 0 }, map } = options;

  const geometry = new THREE.BoxGeometry(size, size, size);
  const material = new THREE.MeshStandardMaterial({
    color,
    map,
  });
  const cube = new THREE.Mesh(geometry, material);

  cube.position.x = position.x || 0;
  cube.position.y = position.y || size / 2;
  cube.position.z = position.z || 0;

  cube.castShadow = true;
  cube.receiveShadow = true;

  return cube;
}

export interface CreateSphereOptions {
  size: number;
  color?: THREE.Color;
  position: { x?: number; y?: number; z?: number };
  map?: THREE.Texture;
}

export function createSphere(options: CreateSphereOptions) {
  const { size = 1, color, position = { x: 0, y: 0, z: 0 }, map} = options;

  const geometry = new THREE.SphereGeometry(size, 32, 32);
  const material = new THREE.MeshStandardMaterial({
    color,
    map,
  });
  const sphere = new THREE.Mesh(geometry, material);

  sphere.position.x = position.x || 0;
  sphere.position.y = position?.y || size / 2;
  sphere.position.z = position.z || 0;

  sphere.castShadow = true;
  sphere.receiveShadow = true;

  return sphere;
}