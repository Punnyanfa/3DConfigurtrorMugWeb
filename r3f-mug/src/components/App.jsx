import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { Mug } from './Mug';
import { HokaMug } from './HokaMug';
import * as THREE from 'three';
import '../style.css';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const preloadedDesign = location.state?.designData || null;

  // State for manufacturers and services
  const [manufacturers, setManufacturers] = useState([]);
  const [selectedManufacturer, setSelectedManufacturer] = useState(preloadedDesign?.manufacturer || null);
  const [totalCost, setTotalCost] = useState(preloadedDesign?.totalCost || 0);
  const [appliedServices, setAppliedServices] = useState(preloadedDesign?.services?.auto || { colors: {}, textures: {} });

  // State for design and model
  const [selectedModel, setSelectedModel] = useState(preloadedDesign?.model || 'Adidas');
  const [customTexture, setCustomTexture] = useState(null);
  const [designData, setDesignData] = useState(
    preloadedDesign || {
      model: 'Adidas',
      colors: {},
      textures: {},
      services: { auto: { colors: {}, textures: {} }, manual: [] },
      originalColors: {},
    }
  );
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

  // Define original colors (based on Mug.js and HokaMug.js defaults)
  const originalColors = components.reduce((acc, comp) => {
    acc[comp.value] = '#ffffff';
    return acc;
  }, {});

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

  // Fetch manufacturers
  useEffect(() => {
    axios
      .get('https://localhost:7080/api/Manufacturer', {
        headers: { Accept: '*/*' },
      })
      .then((response) => {
        if (response.data.code === 200) {
          setManufacturers(response.data.data);
          if (preloadedDesign?.manufacturer) {
            const validManufacturer = response.data.data.find(
              (m) => m.id === preloadedDesign.manufacturer.id && m.status === 'Active'
            );
            setSelectedManufacturer(validManufacturer || null);
          }
        }
      })
      .catch((error) => {
        console.error('Error fetching manufacturers:', error);
        alert('Không thể tải danh sách nhà sản xuất. Vui lòng thử lại.');
      });
  }, []);

  // Update originalColors in designData when model changes
  useEffect(() => {
    setDesignData((prev) => ({
      ...prev,
      originalColors,
    }));
  }, [selectedModel]);

  // Handle manufacturer selection
  const handleManufacturerChange = (e) => {
    const manufacturerId = parseInt(e.target.value);
    const selected = manufacturers.find((m) => m.id === manufacturerId);
    setSelectedManufacturer(selected);
    setAppliedServices({ colors: {}, textures: {} });
    setTotalCost(preloadedDesign?.totalCost || 0); // Preserve total cost if editing
  };

  // Update total cost based on applied services (color and texture)
  const updateTotalCost = () => {
    const colorCost = Object.values(appliedServices.colors).reduce((sum, service) => sum + service.amount, 0);
    const textureCost = Object.values(appliedServices.textures).reduce((sum, service) => sum + service.amount, 0);
    const manualCost = (designData.services.manual || []).reduce((sum, service) => sum + service.amount, 0);
    setTotalCost(colorCost + textureCost + manualCost);
  };

  // Handle color change with service application
  const handleColorClick = (colorValue) => {
    setSelectedColor(colorValue);
    updatePartColor(colorValue);

    const component = components[selectedComponentIndex].value;
    const originalColor = originalColors[component];
    const colorChangeService = selectedManufacturer?.services.find(
      (s) => s.serviceName === 'Thay đổi màu sắc theo yêu cầu'
    );

    if (colorChangeService) {
      setAppliedServices((prev) => {
        const newServices = { ...prev };
        if (colorValue !== originalColor) {
          newServices.colors[component] = {
            serviceId: colorChangeService.id,
            serviceName: colorChangeService.serviceName,
            amount: colorChangeService.currentAmount,
          };
        } else {
          delete newServices.colors[component];
        }
        return newServices;
      });

      const newAppliedServices = { ...appliedServices };
      if (colorValue !== originalColor) {
        newAppliedServices.colors[component] = {
          serviceId: colorChangeService.id,
          serviceName: colorChangeService.serviceName,
          amount: colorChangeService.currentAmount,
        };
      } else {
        delete newAppliedServices.colors[component];
      }

      setAppliedServices(newAppliedServices);
      updateTotalCost();
    }
  };

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
          setCustomTexture({ texture, fileName: file.name, dataURL: e.target.result });
          updatePartTexture(components[selectedComponentIndex].value, texture);

          // Apply texture change service
          const component = components[selectedComponentIndex].value;
          const textureChangeService = selectedManufacturer?.services.find(
            (s) => s.serviceName === 'Thay đổi hình ảnh theo yêu cầu'
          );

          if (textureChangeService) {
            setAppliedServices((prev) => {
              const newServices = { ...prev };
              newServices.textures[component] = {
                serviceId: textureChangeService.id,
                serviceName: textureChangeService.serviceName,
                amount: textureChangeService.currentAmount,
              };
              return newServices;
            });
            updateTotalCost();
          }
        };
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

    // Remove texture change service
    const component = components[selectedComponentIndex].value;
    setAppliedServices((prev) => {
      const newServices = { ...prev };
      delete newServices.textures[component];
      return newServices;
    });
    updateTotalCost();
  };

  const handleColorChange = (updateFunc) => {
    setUpdatePartColor(() => updateFunc);
  };

  const handleTextureChange = (updateFunc) => {
    setUpdatePartTexture(() => updateFunc);
  };

  const handleDesignUpdate = (data) => {
    setDesignData((prev) => {
      const newTextures = {};
      Object.keys(data.textures).forEach((key) => {
        const textureData = data.textures[key];
        if (textureData && textureData.texture) {
          newTextures[key] = {
            dataURL: customTexture?.dataURL || textureData.dataURL,
            settings: textureData.settings,
          };
        } else {
          newTextures[key] = null;
        }
      });
      return {
        ...prev,
        model: selectedModel,
        colors: data.colors || prev.colors,
        textures: newTextures,
        services: { auto: appliedServices, manual: designData.services.manual || [] },
        originalColors,
      };
    });
  };

  const saveDesign = () => {
    if (!selectedManufacturer) {
      alert('Vui lòng chọn một nhà sản xuất trước khi lưu thiết kế.');
      return;
    }
    const savedDesigns = JSON.parse(localStorage.getItem('savedDesigns') || '[]');
    let designId = preloadedDesign?.id || (savedDesigns.length + 1);
    const existingDesignIndex = savedDesigns.findIndex((design) => design.id === designId);

    const newDesign = {
      id: designId,
      timestamp: new Date().toISOString(),
      data: {
        ...designData,
        manufacturer: selectedManufacturer,
        totalCost,
      },
    };

    if (existingDesignIndex !== -1) {
      // Overwrite existing design
      savedDesigns[existingDesignIndex] = newDesign;
    } else {
      // Add new design
      savedDesigns.push(newDesign);
    }

    localStorage.setItem('savedDesigns', JSON.stringify(savedDesigns));
    navigate('/library');
  };

  const handleComplete = () => {
    if (!selectedManufacturer) {
      alert('Vui lòng chọn một nhà sản xuất trước khi hoàn thành.');
      return;
    }
    setShowPopup(true);
  };

  const handleCopyDesignData = () => {
    const output = JSON.stringify(
      { ...designData, manufacturer: selectedManufacturer, totalCost },
      (key, value) => {
        if (value instanceof THREE.Texture) {
          return { fileName: customTexture?.fileName || 'unknown', dataURL: customTexture?.dataURL };
        }
        return value;
      },
      2
    );
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
      {/* Manufacturer Selection */}
      <div className="manufacturer-selector">
        <label htmlFor="manufacturer-select">Chọn Nhà Sản Xuất:</label>
        <select
          id="manufacturer-select"
          onChange={handleManufacturerChange}
          value={selectedManufacturer?.id || ''}
          disabled={!manufacturers.length}
        >
          <option value="" disabled>
            Chọn nhà sản xuất
          </option>
          {manufacturers.map((manufacturer) => (
            <option
              key={manufacturer.id}
              value={manufacturer.id}
              disabled={manufacturer.status === 'Inactive'}
            >
              {manufacturer.name} {manufacturer.status === 'Inactive' ? '(Không khả dụng)' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Total Cost Display */}
      <div className="total-cost">
        <h4>Tổng Chi Phí: {totalCost} VND</h4>
      </div>

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
        <button className="nav-arrow" onClick={handlePrevComponent}>
          ←
        </button>
        <span className="nav-label">
          {components[selectedComponentIndex].name} {selectedComponentIndex + 1}/{components.length}
        </span>
        <button className="nav-arrow" onClick={handleNextComponent}>
          →
        </button>
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
            initialColors={designData.colors}
            initialTextures={designData.textures}
          />
        ) : (
          <HokaMug
            position={[0, 0, 0]}
            selectedPart={components[selectedComponentIndex].value}
            onColorChange={handleColorChange}
            onTextureChange={handleTextureChange}
            onDesignUpdate={handleDesignUpdate}
            initialColors={designData.colors}
            initialTextures={designData.textures}
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
              value={JSON.stringify(
                { ...designData, manufacturer: selectedManufacturer, totalCost },
                (key, value) => {
                  if (value instanceof THREE.Texture) {
                    return { fileName: customTexture?.fileName || 'unknown', dataURL: customTexture?.dataURL };
                  }
                  return value;
                },
                2
              )}
              rows={15}
              style={{ width: '100%', fontFamily: 'monospace', resize: 'none' }}
            />
            <div className="popup-buttons">
              <button className="copy-btn" onClick={handleCopyDesignData}>
                Sao chép
              </button>
              <button className="save-btn" onClick={saveDesign}>
                Lưu Thiết Kế
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