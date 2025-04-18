
import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { Mug } from './Mug';
import { HokaMug } from './HokaMug';
import * as THREE from 'three';
import '../style.css';

function App() {
  const [selectedModel, setSelectedModel] = useState('Adidas');
  const [customTexture, setCustomTexture] = useState(null);
  const [designData, setDesignData] = useState({ model: 'Adidas', colors: {}, textures: {} });
  const [showPopup, setShowPopup] = useState(false);

  const adidasComponents = [
    { name: 'Base', value: 'Base' },
    { name: 'Heel', value: 'Heel' },
    { name: 'Lace', value: 'Lace' },
    { name: 'Outsole', value: 'OutSode' },
    { name: 'Midsole', value: 'MidSode001' },
    { name: 'Tip', value: 'Tip' },
    { name: 'Accent', value: 'Accent' },
    { name: 'Logo', value: 'Logo' },
    { name: 'Tounge', value: 'Tounge' },
    { name: 'Details', value: 'Details' },
  ];

  const hokaComponents = [
    { name: 'Base', value: 'Base' },
    { name: 'Cover', value: 'Cover' },
    { name: 'Inside', value: 'Inside' },
    { name: 'Lace', value: 'Lace' },
    { name: 'Logo', value: 'Logo' },
    { name: 'Midsole', value: 'MidSode' },
    { name: 'Outsole', value: 'OutSode' },
    { name: 'Tongue', value: 'Tounge' },
  ];

  const components = selectedModel === 'Adidas' ? adidasComponents : hokaComponents;

  const [selectedComponentIndex, setSelectedComponentIndex] = useState(0);
  const [updatePartColor, setUpdatePartColor] = useState(() => () => {});
  const [updatePartTexture, setUpdatePartTexture] = useState(() => () => {});
  const colors = [
    { name: 'Black', value: '#000000' },
    { name: 'White', value: '#ffffff' },
    { name: 'Off-White', value: '#f5f5f5' },
    { name: 'Gray', value: '#808080' },
    { name: 'Brown', value: '#4a3728' },
    { name: 'Navy Blue', value: '#1c2526' },
    { name: 'Light Blue', value: '#a3c1d4' },
    { name: 'Orange', value: '#ff4500' },
    { name: 'Pink', value: '#ff69b4' },
    { name: 'University Red', value: '#c8102e' },
  ];
  const [selectedColor, setSelectedColor] = useState(colors[0].value);

  const handleTextureUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const texture = new THREE.Texture(img);
          texture.flipY = false;
          texture.encoding = THREE.sRGBEncoding;
          texture.needsUpdate = true;
          console.log('Texture uploaded:', texture);
          setCustomTexture({ texture, fileName: file.name });
          updatePartTexture(components[selectedComponentIndex].value, texture);
        };
      };
      reader.onerror = () => {
        console.error('Error reading file');
        alert('Không thể đọc file hình ảnh. Vui lòng thử lại.');
      };
      reader.readAsDataURL(file);
    } else {
      alert('Vui lòng chọn một file hình ảnh hợp lệ (jpg, png, v.v.).');
    }
  };

  const handleRemoveTexture = () => {
    updatePartTexture(components[selectedComponentIndex].value, null);
    setCustomTexture(null);
    console.log('Texture removed for:', components[selectedComponentIndex].value);
  };

  const handleColorClick = (colorValue) => {
    setSelectedColor(colorValue);
    updatePartColor(colorValue);
  };

  const handleColorChange = (updateFunc) => {
    setUpdatePartColor(() => updateFunc);
  };

  const handleTextureChange = (updateFunc) => {
    setUpdatePartTexture(() => updateFunc);
  };

  const handleDesignUpdate = (data) => {
    setDesignData((prev) => ({
      ...prev,
      model: selectedModel,
      colors: data.colors || prev.colors,
      textures: data.textures || prev.textures,
    }));
  };

  const handleComplete = () => {
    setShowPopup(true);
  };

  const handleCopyDesignData = () => {
    const output = JSON.stringify(designData, (key, value) => {
      if (value instanceof THREE.Texture) {
        return { fileName: customTexture?.fileName || 'unknown' };
      }
      return value;
    }, 2);
    navigator.clipboard.writeText(output).then(() => {
      alert('Design data copied to clipboard!');
    }).catch((err) => {
      console.error('Failed to copy:', err);
      alert('Failed to copy design data.');
    });
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handlePrevComponent = () => {
    setSelectedComponentIndex((prev) => (prev === 0 ? components.length - 1 : prev - 1));
  };

  const handleNextComponent = () => {
    setSelectedComponentIndex((prev) => (prev === components.length - 1 ? 0 : prev + 1));
  };

  const handleComponentClick = (index) => {
    setSelectedComponentIndex(index);
  };

  const isTextureApplied = designData.textures[components[selectedComponentIndex].value] !== null;

  return (
    <div className="container">
      <div className="model-selector">
        <button
          className={selectedModel === 'Adidas' ? 'active' : ''}
          onClick={() => {
            setSelectedModel('Adidas');
            setSelectedComponentIndex(0);
          }}
        >
          Adidas
        </button>
        <button
          className={selectedModel === 'Hoka' ? 'active' : ''}
          onClick={() => {
            setSelectedModel('Hoka');
            setSelectedComponentIndex(0);
          }}
        >
          Hoka
        </button>
      </div>

      <div className="components-container">
        <h3>COMPONENTS</h3>
        <ul className="components-list">
          {components.map((component, index) => (
            <li
              key={component.name}
              className={`component-item ${index === selectedComponentIndex ? 'component-selected' : ''}`}
              onClick={() => handleComponentClick(index)}
            >
              <span className="component-dot"></span>
              {component.name}
            </li>
          ))}
        </ul>
      </div>

      <div className="navigation-container">
        <button className="nav-arrow" onClick={handlePrevComponent}>←</button>
        <span className="nav-label">
          {components[selectedComponentIndex].name} {selectedComponentIndex + 1}/{components.length}
        </span>
        <button className="nav-arrow" onClick={handleNextComponent}>→</button>
      </div>

      <div className="texture-upload">
        <label htmlFor="texture-upload">Tải Texture:</label>
        <input
          id="texture-upload"
          type="file"
          accept="image/*"
          onChange={handleTextureUpload}
        />
        <button
          className="remove-texture-btn"
          onClick={handleRemoveTexture}
          disabled={!isTextureApplied}
        >
          Xóa Texture
        </button>
      </div>

      <Canvas
        style={{ width: '100%', height: '50%' }}
        camera={{ fov: 5, position: [0, 0, 4], near: 0.1, far: 100 }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        {selectedModel === 'Adidas' ? (
          <Mug
            position={[0, 0, 0]}
            selectedPart={components[selectedComponentIndex].value}
            onColorChange={handleColorChange}
            onTextureChange={handleTextureChange}
            onDesignUpdate={handleDesignUpdate}
          />
        ) : (
          <HokaMug
            position={[0, 0, 0]}
            selectedPart={components[selectedComponentIndex].value}
            onColorChange={handleColorChange}
            onTextureChange={handleTextureChange}
            onDesignUpdate={handleDesignUpdate}
          />
        )}
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        <Environment preset="city" />
      </Canvas>

      <div className="swatches-container">
        {colors.map((color) => (
          <div key={color.name} className="swatch-wrapper">
            <div
              className={`swatch ${selectedColor === color.value ? 'swatch-selected' : ''}`}
              style={{ backgroundColor: color.value }}
              onClick={() => handleColorClick(color.value)}
            />
            {selectedColor === color.value && (
              <span className="swatch-label">{color.name}</span>
            )}
          </div>
        ))}
      </div>

      <div className="complete-container">
        <button className="complete-btn" onClick={handleComplete}>
          Hoàn thành
        </button>
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Design Data</h3>
            <textarea
              readOnly
              value={JSON.stringify(designData, (key, value) => {
                if (value instanceof THREE.Texture) {
                  return { fileName: customTexture?.fileName || 'unknown' };
                }
                return value;
              }, 2)}
              rows={15}
              style={{ width: '100%', fontFamily: 'monospace', resize: 'none' }}
            />
            <div className="popup-buttons">
              <button className="copy-btn" onClick={handleCopyDesignData}>
                Sao chép
              </button>
              <button className="close-btn" onClick={handleClosePopup}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
