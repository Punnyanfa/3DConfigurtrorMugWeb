
import React, { useState, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useControls } from 'leva';

export function Mug({ selectedPart, onColorChange, onTextureChange, ...props }) {
  const { nodes, materials } = useGLTF('/model/Adidasrunningshoes.glb');

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
    Tounge: '#ffffff',
  });

  const [partTextures, setPartTextures] = useState({
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

  const { repeatX, repeatY, offsetX, offsetY, rotation, brightness, scale } = useControls('Texture', {
    scale: { value: 1, min: 0.1, max: 10, step: 0.1 },
    repeatX: { value: 1.1, min: 0.1, max: 10, step: 0.1 },
    repeatY: { value: 1.6, min: 0.1, max: 10, step: 0.1 },
    offsetX: { value: -0.01, min: -1, max: 1, step: 0.01 },
    offsetY: { value: -0.08, min: -1, max: 1, step: 0.01 },
    rotation: { value: 0.24, min: -Math.PI, max: Math.PI, step: 0.01 },
    brightness: { value: 2.0, min: 0.5, max: 2, step: 0.01 },
  });

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
        `Material.${String(
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
        ).padStart(3, '0')}`
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
        map: partName === 'Heel' ? texture : null,
      });
    });

    return mats;
  }, [materials, partColors, partTextures, repeatX, repeatY, offsetX, offsetY, rotation, scale]);

  const updatePartColor = (color) => {
    if (selectedPart) {
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
        }));
      } else {
        setPartColors((prev) => ({
          ...prev,
          [selectedPart]: color,
        }));
      }
    }
  };

  const updatePartTexture = (part, texture) => {
    if (part) {
      console.log('Updating texture for', part, 'to:', texture);
      if (part === 'Accent') {
        setPartTextures((prev) => ({
          ...prev,
          Accent_inside: texture,
          Accent_outside: texture,
          Line_inside: texture,
          Line_outside: texture,
        }));
      } else if (part === 'Logo') {
        setPartTextures((prev) => ({
          ...prev,
          Logo_inside: texture,
          Logo_outside: texture,
        }));
      } else if (part === 'Details') {
        setPartTextures((prev) => ({
          ...prev,
          Cylinder: texture,
          Cylinder001: texture,
          Plane012: texture,
          Plane012_1: texture,
          Plane005: texture,
        }));
      } else {
        setPartTextures((prev) => ({
          ...prev,
          [part]: texture,
        }));
      }
    }
  };

  React.useEffect(() => {
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
