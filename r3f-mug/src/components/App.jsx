
import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { Mug } from './Mug';
import { HokaMug } from './HokaMug';
import '../style.css'; // Updated to match src/style.css

function App() {
  const [selectedModel, setSelectedModel] = useState('Adidas');

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

  const handleColorClick = (colorValue) => {
    setSelectedColor(colorValue);
    updatePartColor(colorValue);
  };

  const handleColorChange = (updateFunc) => {
    setUpdatePartColor(() => updateFunc);
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
          />
        ) : (
          <HokaMug
            position={[0, 0, 0]}
            selectedPart={components[selectedComponentIndex].value}
            onColorChange={handleColorChange}
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
    </div>
  );
}

export default App;
