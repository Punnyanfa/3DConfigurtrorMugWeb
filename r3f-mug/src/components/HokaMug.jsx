import React, { useState, useMemo, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useControls } from 'leva';

export function HokaMug({ selectedPart, onColorChange, onTextureChange, onDesignUpdate, initialColors = {}, initialTextures = {}, ...props }) {
 const { nodes, materials } = useGLTF('/model/HokaSneakerShoe.glb');
 useGLTF.preload('/model/HokaSneakerShoe.glb');

 const [partColors, setPartColors] = useState({
 Base: initialColors.Base || '#ffffff',
 Cover: initialColors.Cover || '#ffffff',
 Inside: initialColors.Inside || '#ffffff',
 Lace: initialColors.Lace || '#ffffff',
 Logo: initialColors.Logo || '#ffffff',
 MidSode: initialColors.MidSode || '#ffffff',
 OutSode: initialColors.OutSode || '#ffffff',
 Text: initialColors.Text || '#ffffff',
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
 Base: null,
 Cover: null,
 Inside: null,
 Lace: null,
 Logo: null,
 MidSode: null,
 OutSode: null,
 Text: null,
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
 'Base', 'Cover', 'Inside', 'Lace', 'Logo', 'MidSode', 'OutSode', 'Text', 'Tounge'
 ];

 partNames.forEach((partName) => {
 const originalMaterial = materials[
 partName === 'Base' ? 'Smooth Gold' :
 partName === 'Cover' ? 'Perforated rubber' :
 partName === 'Inside' ? 'Perforated rubber' :
 partName === 'Lace' ? 'Black Jacket Lining - 01' :
 partName === 'Logo' ? 'Material.004' :
 partName === 'MidSode' ? 'Gold Sheen' :
 partName === 'OutSode' ? 'Material.002' :
 partName === 'Text' ? 'Material.003' :
 'Acoustic Foam'
 ];

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
 setPartColors((prev) => {
 const newColors = { ...prev, [selectedPart]: color };
 onDesignUpdate({ colors: newColors, textures: partTextures });
 return newColors;
 });
 }
 };

 const updatePartTexture = (part, texture) => {
 if (part) {
 console.log('Updating texture for', part, 'to:', texture ? 'Texture applied' : 'Texture removed');
 setPartTextures((prev) => {
 const newTextures = { ...prev, [part]: texture };
 const texturesWithSettings = Object.keys(newTextures).reduce((acc, key) => {
 acc[key] = newTextures[key] ? { texture: newTextures[key], settings: textureSettings, dataURL: newTextures[key]?.image?.src || initialTextures[key]?.dataURL } : null;
 return acc;
 }, {});
 onDesignUpdate({ colors: partColors, textures: texturesWithSettings });
 return newTextures;
 });
 }
 };

 useEffect(() => {
 onColorChange(updatePartColor);
 onTextureChange(updatePartTexture);
 }, [selectedPart, onColorChange, onTextureChange]);

 return (
 <group {...props} dispose={null}>
 <mesh geometry={nodes.Base.geometry} material={partMaterials['Base']} scale={0.019} />
 <mesh geometry={nodes.Cover.geometry} material={partMaterials['Cover']} scale={0.019} />
 <mesh geometry={nodes.Inside.geometry} material={partMaterials['Inside']} scale={0.018} />
 <mesh geometry={nodes.Lace.geometry} material={partMaterials['Lace']} scale={0.014} />
 <mesh geometry={nodes.Logo.geometry} material={partMaterials['Logo']} scale={[0.021, 0.02, 0.019]} />
 <mesh geometry={nodes.MidSode.geometry} material={partMaterials['MidSode']} scale={0.019} />
 <mesh geometry={nodes.OutSode.geometry} material={partMaterials['OutSode']} scale={0.019} />
 <mesh geometry={nodes.Text.geometry} material={partMaterials['Text']} scale={[-0.02, -0.018, -0.008]} />
 <mesh geometry={nodes.Tounge.geometry} material={partMaterials['Tounge']} scale={0.019} />
 </group>
 );
}

useGLTF.preload('/model/HokaSneakerShoe.glb');