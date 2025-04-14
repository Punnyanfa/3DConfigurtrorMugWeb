import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Mug } from './Mug';
import './App.css';

function App() {
  // Define the components list for the UI
  const components = [
    { name: 'Base', value: 'Base' },
    { name: 'Heel', value: 'Heel' },
    { name: 'Lace', value: 'Lace' },
    { name: 'Outsole', value: 'OutSode' },
    { name: 'Midsole', value: 'MidSode001' },
    { name: 'Tip', value: 'Tip' },
    { name: 'Accent', value: 'Accent' }, // Grouped: Accent_inside, Accent_outside, Line_inside, Line_outside
    { name: 'Logo', value: 'Logo' }, // Grouped: Logo_inside, Logo_outside
    { name: 'Details', value: 'Details' }, // Grouped: Cylinder, Cylinder001, Plane012, Plane012_1, Plane005, Plane005_1
  ];

  // State to track the selected component index
  const [selectedComponentIndex, setSelectedComponentIndex] = useState(0);

  // State to store the updatePartColor function from Mug
  const [updatePartColor, setUpdatePartColor] = useState(() => () => {});

  // Define the color swatches with their labels
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

  // State to track the selected color for UI feedback
  const [selectedColor, setSelectedColor] = useState(colors[0].value);

  // Handler to update the color of the selected part
  const handleColorClick = (colorValue) => {
    setSelectedColor(colorValue);
    updatePartColor(colorValue);
  };

  // Handler to receive the updatePartColor function from Mug
  const handleColorChange = (updateFunc) => {
    setUpdatePartColor(() => updateFunc);
  };

  // Handlers for navigation arrows
  const handlePrevComponent = () => {
    setSelectedComponentIndex((prev) => (prev === 0 ? components.length - 1 : prev - 1));
  };

  const handleNextComponent = () => {
    setSelectedComponentIndex((prev) => (prev === components.length - 1 ? 0 : prev + 1));
  };

  // Handler for selecting a component from the list
  const handleComponentClick = (index) => {
    setSelectedComponentIndex(index);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      {/* Components UI */}
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

      {/* Navigation and Label */}
      <div className="navigation-container">
        <button className="nav-arrow" onClick={handlePrevComponent}>←</button>
        <span className="nav-label">
          {components[selectedComponentIndex].name} {selectedComponentIndex + 1}/{components.length}
        </span>
        <button className="nav-arrow" onClick={handleNextComponent}>→</button>
      </div>

      {/* Canvas for the 3D model */}
      <Canvas style={{ width: '100%', height: '50%' }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Mug
          position={[0, 0, 0]}
          selectedPart={components[selectedComponentIndex].value}
          onColorChange={handleColorChange}
        />
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>

      {/* Color swatches */}
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