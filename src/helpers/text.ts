import {
	TextGeometry,
	type TextGeometryParameters
} from 'three/examples/jsm/geometries/TextGeometry.js';
import * as THREE from 'three';
import type { Font } from 'three/examples/jsm/loaders/FontLoader.js';

export const DEFAULT_3D_TEXT_GEOMETRY_OPTIONS = {
	size: 0.5,
	depth: 0.2,
	curveSegments: 12,
	bevelEnabled: true,
	bevelThickness: 0.03,
	bevelSize: 0.02,
	bevelOffset: 0,
	bevelSegments: 5
};

interface TextGeometryOptions extends Partial<TextGeometryParameters> {
    font: Font;
}

interface Create3DTextOptions {
	text: string;
	textGeometryOptions: TextGeometryOptions;
}

export const create3DTextGeometry = ({
	text,
	textGeometryOptions
}: Create3DTextOptions ) => {
	const geometryOptions = {
		...DEFAULT_3D_TEXT_GEOMETRY_OPTIONS,
		...textGeometryOptions
	};

	const textGeometry = new TextGeometry(text, {
		...geometryOptions
	});
	textGeometry.center();

	return textGeometry;
};

export const create3DTextMesh = ({
	text,
	textGeometryOptions,
	textMaterial
}: Create3DTextOptions & { textMaterial: THREE.Material }) => {
	const textGeometry = create3DTextGeometry({ text, textGeometryOptions });
	const textMesh = new THREE.Mesh(textGeometry, textMaterial);
	return textMesh;
};
