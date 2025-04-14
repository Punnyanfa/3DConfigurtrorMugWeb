import React, { useState, useMemo } from 'react';
import { useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useControls } from 'leva';

export function Mug({ selectedPart, onColorChange, ...props }) {
  const { nodes, materials } = useGLTF('/model/Adidasrunningshoes.glb');
  const texture = useTexture('/texture/Umeko.jpg', (tex) => {
    console.log('Texture loaded:', tex);
  }, (err) => {
    console.error('Texture failed to load:', err);
  });

  // Configure texture properties
  texture.flipY = false;
  texture.encoding = THREE.sRGBEncoding;

  // State to track the color of each part
  const [partColors, setPartColors] = useState({
    Accent_inside: '#ffffff',
    Accent_outside: '#ffffff',
    Base: '#ffffff',
    Cover: '#ffffff',
    Cylinder: '#ffffff',
    Cylinder001: '#ffffff',
    Heel: '#ffffff',
    Lace: '#ffffff',
    Line_inside: '#ffffff',
    Line_outside: '#ffffff',
    Logo_inside: '#ffffff',
    Logo_outside: '#ffffff',
    MidSode001: '#ffffff',
    OutSode: '#ffffff',
    Tip: '#ffffff',
    Plane012: '#ffffff',
    Plane012_1: '#ffffff',
    Plane005: '#ffffff',
    Plane005_1: '#ffffff',
  });

  // Runtime controls with leva for texture adjustments
  const { repeatX, repeatY, offsetX, offsetY, rotation, brightness, scale } = useControls('Texture', {
    scale: { value: 1, min: 0.1, max: 10, step: 0.1 },
    repeatX: { value: 1.1, min: 0.1, max: 10, step: 0.1 },
    repeatY: { value: 1.6, min: 0.1, max: 10, step: 0.1 },
    offsetX: { value: -0.01, min: -1, max: 1, step: 0.01 },
    offsetY: { value: -0.08, min: -1, max: 1, step: 0.01 },
    rotation: { value: 0.24, min: -Math.PI, max: Math.PI, step: 0.01 },
    brightness: { value: 2.0, min: 0.5, max: 2, step: 0.01 },
  });

  // Apply texture adjustments
  const adjustedRepeatX = repeatX * scale;
  const adjustedRepeatY = repeatY * scale;
  texture.repeat.set(adjustedRepeatX, adjustedRepeatY);
  texture.offset.set(offsetX, offsetY);
  texture.rotation = rotation;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  // Create a base material for the heel with texture
  const heelMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    map: texture || null,
    color: texture ? new THREE.Color(brightness, brightness, brightness) : '#ff0000',
    roughness: materials['Material.005'].roughness || 0.5,
    metalness: materials['Material.005'].metalness || 0,
  }), [texture, brightness, materials]);

  // Create a dictionary of materials for each part, using partColors
  const partMaterials = useMemo(() => {
    const mats = {};
    const partNames = [
      'Accent_inside', 'Accent_outside', 'Base', 'Cover', 'Cylinder', 'Cylinder001',
      'Heel', 'Lace', 'Line_inside', 'Line_outside', 'Logo_inside', 'Logo_outside',
      'MidSode001', 'OutSode', 'Tip', 'Plane012', 'Plane012_1', 'Plane005', 'Plane005_1'
    ];

    partNames.forEach((partName) => {
      const originalMaterial = materials[partName === 'Heel' ? '' : `Material.${String(partName === 'Base' ? '003' : partName === 'Cover' ? '011' : partName === 'Cylinder' ? '015' : partName === 'Cylinder001' ? '014' : partName === 'Lace' ? '013' : partName === 'OutSode' ? '009' : partName === 'Plane005' ? '012' : partName === 'Plane005_1' ? '016' : '004').padStart(3, '0')}`] || materials['Material.005'];
      mats[partName] = new THREE.MeshStandardMaterial({
        ...originalMaterial,
        color: new THREE.Color(partColors[partName]),
        map: partName === 'Heel' ? texture : null,
      });
    });

    return mats;
  }, [materials, partColors, texture]);

  // Callback to update the color of the selected part
  const updatePartColor = (color) => {
    if (selectedPart) {
      // Update colors for grouped parts
      if (selectedPart === 'Accent') {
        setPartColors((prev) => ({
          ...prev,
          Accent_inside: color,
          Accent_outside: color,
          Line_inside: color,
          Line_outside: color,
        }));
      } else if (selectedPart === 'Logo') {
        setPartColors((prev) => ({
          ...prev,
          Logo_inside: color,
          Logo_outside: color,
        }));
      } else if (selectedPart === 'Details') {
        setPartColors((prev) => ({
          ...prev,
          Cylinder: color,
          Cylinder001: color,
          Plane012: color,
          Plane012_1: color,
          Plane005: color,
          Plane005_1: color,
        }));
      } else {
        setPartColors((prev) => ({
          ...prev,
          [selectedPart]: color,
        }));
      }
    }
  };

  // Expose the color update function to the parent
  React.useEffect(() => {
    onColorChange(updatePartColor);
  }, [selectedPart, onColorChange]);

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
      <mesh geometry={nodes.Plane005_1.geometry} material={partMaterials['Plane005_1']} />
    </group>
  );
}

useGLTF.preload('/model/Adidasrunningshoes.glb');