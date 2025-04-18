
import React, { useState, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useControls } from 'leva';

export function HokaMug({ selectedPart, onColorChange, onTextureChange, onDesignUpdate, ...props }) {
  const { nodes, materials } = useGLTF('/model/HokaSneakerShoe.glb');

  const [partColors, setPartColors] = useState({
    Base: '#ffffff',
    Cover: '#ffffff',
    Inside: '#ffffff',
    Lace: '#ffffff',
    Logo: '#ffffff',
    MidSode: '#ffffff',
    OutSode: '#ffffff',
    Text: '#ffffff',
    Tounge: '#ffffff',
  });

  const [partTextures, setPartTextures] = useState({
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

  const { repeatX, repeatY, offsetX, offsetY, rotation, brightness, scale } = useControls('Texture', {
    scale: { value: 1, min: 0.1, max: 10, step: 0.1 },
    repeatX: { value: 1.1, min: 0.1, max: 10, step: 0.1 },
    repeatY: { value: 1.6, min: 0.1, max: 10, step: 0.1 },
    offsetX: { value: -0.01, min: -1, max: 1, step: 0.01 },
    offsetY: { value: -0.08, min: -1, max: 1, step: 0.01 },
    rotation: { value: 0.24, min: -Math.PI, max: Math.PI, step: 0.01 },
    brightness: { value: 2.0, min: 0.5, max: 5, step: 0.01 },
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
        map: texture,
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
      console.log('Updating texture for', part, 'to:', texture);
      setPartTextures((prev) => {
        const newTextures = { ...prev, [part]: texture };
        const texturesWithSettings = Object.keys(newTextures).reduce((acc, key) => {
          acc[key] = newTextures[key] ? { texture: newTextures[key], settings: textureSettings } : null;
          return acc;
        }, {});
        onDesignUpdate({ colors: partColors, textures: texturesWithSettings });
        return newTextures;
      });
    }
  };

  React.useEffect(() => {
    onColorChange(updatePartColor);
    onTextureChange(updatePartTexture);
    onDesignUpdate({ colors: partColors, textures: partTextures });
  }, [selectedPart, onColorChange, onTextureChange, onDesignUpdate, partColors, partTextures]);

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
