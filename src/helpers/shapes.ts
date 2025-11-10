import * as THREE from 'three';

export function createCube(
  size: number = 1,
  color: number = 0xff0000,
  position: { x?: number; y?: number; z?: number } = {}
): THREE.Mesh {
  const geometry = new THREE.BoxGeometry(size, size, size);
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.5,
    metalness: 0.3
  });
  const cube = new THREE.Mesh(geometry, material);

  cube.position.x = position.x || 0;
  cube.position.y = position.y || size / 2;
  cube.position.z = position.z || 0;

  cube.castShadow = true;
  cube.receiveShadow = true;

  return cube;
}