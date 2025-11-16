import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { createSphere } from './shapes';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { Font } from 'three/examples/jsm/loaders/FontLoader.js';

interface CreateSphereObjectOptions {
	size: number;
	color: THREE.Color;
	position: { x: number; y: number; z: number };
	mass: number;
}

export const createSphereObject = (options: CreateSphereObjectOptions) => {
	const sphere = createSphere({
		size: options.size,
		color: options.color,
		position: options.position
	});
	const cannonSphere = new CANNON.Sphere(options.size);
	const sphereBody = new CANNON.Body({
		mass: options.mass,
		position: new CANNON.Vec3(options.position.x, options.position.y, options.position.z),
		shape: cannonSphere
	});
	return { sphere, sphereBody };
};

export const addSphereObjectToSceneAndWorld = (
	scene: THREE.Scene,
	world: CANNON.World,
	options: CreateSphereObjectOptions
) => {
	const { sphere, sphereBody } = createSphereObject(options);
	scene.add(sphere);
	world.addBody(sphereBody);
	return { sphere, sphereBody };
};
