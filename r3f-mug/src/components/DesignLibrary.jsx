import React, { useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { Mug } from './Mug';
import { HokaMug } from './HokaMug';
import * as THREE from 'three';
import '../style.css';
import { useNavigate } from 'react-router-dom';

function DesignLibrary() {
  const navigate = useNavigate();
  const [savedDesigns, setSavedDesigns] = useState(JSON.parse(localStorage.getItem('savedDesigns') || '[]'));
  const [selectedDesign, setSelectedDesign] = useState(null);

  const handleViewDesign = (design) => {
    setSelectedDesign(design);
  };

  const handleEditDesign = (design) => {
    navigate('/', { state: { designData: design.data } });
  };

  const handleClosePopup = () => {
    setSelectedDesign(null);
  };

  const handleDeleteDesign = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa thiết kế này?')) {
      const updatedDesigns = savedDesigns.filter((design) => design.id !== id);
      setSavedDesigns(updatedDesigns);
      localStorage.setItem('savedDesigns', JSON.stringify(updatedDesigns));
      if (selectedDesign && selectedDesign.id === id) {
        setSelectedDesign(null);
      }
    }
  };

  const recreatedTextures = useMemo(() => {
    if (!selectedDesign || !selectedDesign.data.textures) return {};

    const textures = {};
    Object.entries(selectedDesign.data.textures).forEach(([part, textureData]) => {
      if (textureData && textureData.dataURL) {
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
        };
      }
    });
    return textures;
  }, [selectedDesign]);

  return (
    <div className="container p-4">
      <h1 className="text-2xl font-bold mb-4">Thư viện thiết kế</h1>
      {savedDesigns.length === 0 ? (
        <p className="text-gray-500">Chưa có thiết kế nào được lưu. Hãy tạo một thiết kế mới!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedDesigns.map((design) => (
            <div key={design.id} className="border rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold">Thiết kế #{design.id}</h3>
              <p className="text-sm text-gray-600">Ngày tạo: {new Date(design.timestamp).toLocaleString()}</p>
              <p className="text-sm text-gray-600">Mô hình: {design.data.model}</p>
              <div className="mt-2 flex gap-2">
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  onClick={() => handleViewDesign(design)}
                >
                  Xem
                </button>
                <button
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                  onClick={() => handleEditDesign(design)}
                >
                  Sửa
                </button>
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  onClick={() => handleDeleteDesign(design.id)}
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedDesign && (
        <div className="popup-overlay">
          <div className="popup-content" style={{ width: '400px', height: '400px' }}>
            <h3 className="text-xl font-bold mb-2">Thiết kế #{selectedDesign.id}</h3>
            <Canvas
              style={{ width: '100%', height: '300px' }}
              camera={{ fov: 5, position: [0, 0, 4], near: 0.1, far: 100 }}
            >
              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 10, 5]} intensity={1} />
              {selectedDesign.data.model === 'Adidas' ? (
                <Mug
                  position={[0, 0, 0]}
                  selectedPart={null}
                  onColorChange={() => {}}
                  onTextureChange={() => {}}
                  onDesignUpdate={() => {}}
                  initialColors={selectedDesign.data.colors}
                  initialTextures={recreatedTextures}
                />
              ) : (
                <HokaMug
                  position={[0, 0, 0]}
                  selectedPart={null}
                  onColorChange={() => {}}
                  onTextureChange={() => {}}
                  onDesignUpdate={() => {}}
                  initialColors={selectedDesign.data.colors}
                  initialTextures={recreatedTextures}
                />
              )}
              <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
              <Environment preset="city" />
            </Canvas>
            <div className="popup-buttons mt-4">
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

export default DesignLibrary;