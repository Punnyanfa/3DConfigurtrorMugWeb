import React, { useState, useMemo, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useControls } from 'leva';

export function Mug({ selectedPart, onColorChange, onTextureChange, onDesignUpdate, initialColors = {}, initialTextures = {}, ...props }) {
 const { nodes, materials } = useGLTF('/model/Adidasrunningshoes.glb');
 useGLTF.preload('/model/Adidasrunningshoes.glb');

 const [partColors, setPartColors] = useState({
 Accent_inside: initialColors.Accent_inside || '#ffffff',
 Accent_outside: initialColors.Accent_outside || '#ffffff',
 Base: initialColors.Base || '#ffffff',
 Cover: initialColors.Cover || '#ffffff',
 Cylinder: initialColors.Cylinder || '#ffffff',
 Cylinder001: initialColors.Cylinder001 || '#ffffff',
 Heel: initialColors.Heel || '#ffffff',
 Lace: initialColors.Lace || '#ffffff',
 Line_inside: initialColors.Line_inside || '#ffffff',
 Line_outside: initialColors.Line_outside || '#ffffff',
 Logo_inside: initialColors.Logo_inside || '#ffffff',
 Logo_outside: initialColors.Logo_outside || '#ffffff',
 MidSode001: initialColors.MidSode001 || '#ffffff',
 OutSode: initialColors.OutSode || '#ffffff',
 Tip: initialColors.Tip || '#ffffff',
 Plane012: initialColors.Plane012 || '#ffffff',
 Plane012_1: initialColors.Plane012_1 || '#ffffff',
 Plane005: initialColors.Plane005 || '#ffffff',
 Tounge: initialColors.Tounge || '#ffffff',
 });

 const [partTextures, setPartTextures] = useState({});

 // Recreate textures from initialTextures
 useEffect(() => {
 const textures = {};
 const totalTextures = Object.keys(initialTextures).filter(
 (key) => initialTextures[key]?.dataURL || initialTextures[key] instanceof THREE.Texture
 ).length;

 if (totalTextures === 0) {
 setPartTextures({
 Accent_inside: null,
 Accent_outside: null,
 Base: null,
 Cover: null,
 Cylinder: null,
 Cylinder001: null,
 Heel: null,
 Lace: null,
 Line_inside: null,
 Line_outside: null,
 Logo_inside: null,
 Logo_outside: null,
 MidSode001: null,
 OutSode: null,
 Tip: null,
 Plane012: null,
 Plane012_1: null,
 Plane005: null,
 Tounge: null,
 });
 onDesignUpdate({ colors: partColors, textures: {} });
 return;
 }

 let loadedCount = 0;
 Object.entries(initialTextures).forEach(([part, textureData]) => {
 if (textureData instanceof THREE.Texture) {
 textures[part] = textureData;
 loadedCount++;
 if (loadedCount === totalTextures) {
 setPartTextures(textures);
 onDesignUpdate({ colors: partColors, textures });
 }
 } else if (textureData && textureData.dataURL) {
 const img = new Image();
 img.src = textureData.dataURL;
 img.onload = () => {
 const texture = new THREE.Texture(img);
 texture.flipY = false;
 texture.encoding = THREE.sRGBEncoding;
 const settings = textureData.settings || {
 scale: 1,
 repeatX: 1,
 repeatY: 1,
 offsetX: 0,
 offsetY: 0,
 rotation: 0,
 brightness: 1,
 };
 texture.repeat.set(settings.repeatX * settings.scale, settings.repeatY * settings.scale);
 texture.offset.set(settings.offsetX, settings.offsetY);
 texture.rotation = settings.rotation;
 texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
 texture.needsUpdate = true;
 textures[part] = texture;

 loadedCount++;
 if (loadedCount === totalTextures) {
 setPartTextures(textures);
 onDesignUpdate({ colors: partColors, textures });
 }
 };
 img.onerror = () => {
 console.error(`Failed to load texture for part ${part}`);
 textures[part] = null;
 loadedCount++;
 if (loadedCount === totalTextures) {
 setPartTextures(textures);
 onDesignUpdate({ colors: partColors, textures });
 }
 };
 }
 });
 }, [initialTextures, partColors, onDesignUpdate]);

 const { repeatX, repeatY, offsetX, offsetY, rotation, brightness, scale } = useControls('Texture', {
 scale: { value: 1, min: 0.1, max: 10, step: 0.1 },
 repeatX: { value: 1.1, min: 0.1, max: 10, step: 0.1 },
 repeatY: { value: 1.6, min: 0.1, max: 10, step: 0.1 },
 offsetX: { value: -0.01, min: -1, max: 1, step: 0.01 },
 offsetY: { value: -0.08, min: -1, max: 1, step: 0.01 },
 rotation: { value: 0.24, min: -Math.PI, max: Math.PI, step: 0.01 },
 brightness: { value: 2.0, min: 0.5, max: 2, step: 0.01 },
 });

 const textureSettings = useMemo(
 () => ({ scale, repeatX, repeatY, offsetX, offsetY, rotation, brightness }),
 [scale, repeatX, repeatY, offsetX, offsetY, rotation, brightness]
 );

 const partMaterials = useMemo(() => {
 const mats = {};
 const partNames = [
 'Accent_inside', 'Accent_outside', 'Base', 'Cover', 'Cylinder', 'Cylinder001',
 'Heel', 'Lace', 'Line_inside', 'Line_outside', 'Logo_inside', 'Logo_outside',
 'MidSode001', 'OutSode', 'Tip', 'Plane012', 'Plane012_1', 'Plane005', 'Tounge'
 ];

 partNames.forEach((partName) => {
 const originalMaterial = materials[
 partName === 'Heel' ? 'Material.005' :
 `Material.${
 partName === 'Base' ? '003' :
 partName === 'Accent_inside' ? '003' :
 partName === 'Accent_outside' ? '003' :
 partName === 'Logo_inside' ? '003' :
 partName === 'Logo_outside' ? '003' :
 partName === 'Plane012' ? '003' :
 partName === 'Plane012_1' ? '003' :
 partName === 'Tip' ? '003' :
 partName === 'Cover' ? '011' :
 partName === 'Cylinder' ? '015' :
 partName === 'Cylinder001' ? '014' :
 partName === 'Tounge' ? '003' :
 partName === 'Lace' ? '013' :
 partName === 'OutSode' ? '003' :
 partName === 'Plane005' ? '012' :
 partName === 'Plane005_1' ? '016' : '004'
 }`
 ] || materials['Material.005'];

 const texture = partTextures[partName];
 if (texture) {
 texture.repeat.set(repeatX * scale, repeatY * scale);
 texture.offset.set(offsetX, offsetY);
 texture.rotation = rotation;
 texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
 texture.needsUpdate = true;
 }

 mats[partName] = new THREE.MeshStandardMaterial({
 ...originalMaterial,
 color: new THREE.Color(partColors[partName]),
 map: texture || null,
 });
 });

 return mats;
 }, [materials, partColors, partTextures, repeatX, repeatY, offsetX, offsetY, rotation, scale]);

 const updatePartColor = (color) => {
 if (selectedPart) {
 let newColors;
 if (selectedPart === 'Accent') {
 newColors = {
 ...partColors,
 Accent_inside: color,
 Accent_outside: color,
 Line_inside: color,
 Line_outside: color,
 };
 } else if (selectedPart === 'Logo') {
 newColors = {
 ...partColors,
 Logo_inside: color,
 Logo_outside: color,
 };
 } else if (selectedPart === 'Details') {
 newColors = {
 ...partColors,
 Cylinder: color,
 Cylinder001: color,
 Plane012: color,
 Plane012_1: color,
 Plane005: color,
 };
 } else {
 newColors = { ...partColors, [selectedPart]: color };
 }
 setPartColors(newColors);
 onDesignUpdate({ colors: newColors, textures: partTextures });
 }
 };

 const updatePartTexture = (part, texture) => {
 if (part) {
 console.log('Updating texture for', part, 'to:', texture ? 'Texture applied' : 'Texture removed');
 let newTextures;
 if (part === 'Accent') {
 newTextures = {
 ...partTextures,
 Accent_inside: texture,
 Accent_outside: texture,
 Line_inside: texture,
 Line_outside: texture,
 };
 } else if (part === 'Logo') {
 newTextures = {
 ...partTextures,
 Logo_inside: texture,
 Logo_outside: texture,
 };
 } else if (part === 'Details') {
 newTextures = {
 ...partTextures,
 Cylinder: texture,
 Cylinder001: texture,
 Plane012: texture,
 Plane012_1: texture,
 Plane005: texture,
 };
 } else {
 newTextures = { ...partTextures, [part]: texture };
 }
 setPartTextures(newTextures);
 const texturesWithSettings = Object.keys(newTextures).reduce((acc, key) => {
 acc[key] = newTextures[key] ? { texture: newTextures[key], settings: textureSettings, dataURL: newTextures[key]?.image?.src || initialTextures[key]?.dataURL } : null;
 return acc;
 }, {});
 onDesignUpdate({ colors: partColors, textures: texturesWithSettings });
 }
 };

 useEffect(() => {
 onColorChange(updatePartColor);
 onTextureChange(updatePartTexture);
 }, [selectedPart, onColorChange, onTextureChange]);

 return (
 <group {...props} dispose={null}>
 <mesh geometry={nodes.Accent_inside.geometry} material={partMaterials['Accent_inside']} />
 <mesh geometry={nodes.Accent_outside.geometry} material={partMaterials['Accent_outside']} />
 <mesh geometry={nodes.Base.geometry} material={partMaterials['Base']} />
 <mesh geometry={nodes.Cover.geometry} material={partMaterials['Cover']} />
 <mesh geometry={nodes.Cylinder.geometry} material={partMaterials['Cylinder']} />
 <mesh geometry={nodes.Cylinder001.geometry} material={partMaterials['Cylinder001']} />
 <mesh geometry={nodes.Heel.geometry} material={partMaterials['Heel']} />
 <mesh geometry={nodes.Lace.geometry} material={partMaterials['Lace']} />
 <mesh geometry={nodes.Line_inside.geometry} material={partMaterials['Line_inside']} />
 <mesh geometry={nodes.Line_outside.geometry} material={partMaterials['Line_outside']} />
 <mesh geometry={nodes.Logo_inside.geometry} material={partMaterials['Logo_inside']} />
 <mesh geometry={nodes.Logo_outside.geometry} material={partMaterials['Logo_outside']} />
 <mesh geometry={nodes.MidSode001.geometry} material={partMaterials['MidSode001']} />
 <mesh geometry={nodes.OutSode.geometry} material={partMaterials['OutSode']} />
 <mesh geometry={nodes.Tip.geometry} material={partMaterials['Tip']} />
 <mesh geometry={nodes.Plane012.geometry} material={partMaterials['Plane012']} />
 <mesh geometry={nodes.Plane012_1.geometry} material={partMaterials['Plane012_1']} />
 <mesh geometry={nodes.Plane005.geometry} material={partMaterials['Plane005']} />
 <mesh geometry={nodes.Plane005_1.geometry} material={partMaterials['Tounge']} />
 </group>
 );
}

useGLTF.preload('/model/Adidasrunningshoes.glb');