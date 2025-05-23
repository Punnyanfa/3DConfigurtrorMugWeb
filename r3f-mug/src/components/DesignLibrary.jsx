import React, { useState, useMemo, useEffect } from 'react';
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
 const [additionalServices, setAdditionalServices] = useState([]);
 const [tempTotalCost, setTempTotalCost] = useState(0);
 const [recreatedTextures, setRecreatedTextures] = useState({});

 const handleViewDesign = (design) => {
 setSelectedDesign(design);
 setAdditionalServices(design.data.services?.manual || []);
 const autoCost =
 Object.values(design.data.services?.auto?.colors || {}).reduce((sum, service) => sum + service.amount, 0) +
 Object.values(design.data.services?.auto?.textures || {}).reduce((sum, service) => sum + service.amount, 0);
 const manualCost = (design.data.services?.manual || []).reduce((sum, service) => sum + service.amount, 0);
 setTempTotalCost(autoCost + manualCost);
 };

 const handleEditDesign = (design) => {
 navigate('/', { state: { designData: design.data } });
 };

 const handleClosePopup = () => {
 setSelectedDesign(null);
 setAdditionalServices([]);
 setTempTotalCost(0);
 setRecreatedTextures({});
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

 const handleServiceToggle = (service) => {
 const isSelected = additionalServices.some((s) => s.serviceId === service.id);
 let updatedServices;
 if (isSelected) {
 updatedServices = additionalServices.filter((s) => s.serviceId !== service.id);
 } else {
 updatedServices = [
 ...additionalServices,
 { serviceId: service.id, serviceName: service.serviceName, amount: service.currentAmount },
 ];
 }
 setAdditionalServices(updatedServices);

 const autoCost =
 Object.values(selectedDesign.data.services?.auto?.colors || {}).reduce((sum, service) => sum + service.amount, 0) +
 Object.values(selectedDesign.data.services?.auto?.textures || {}).reduce((sum, service) => sum + service.amount, 0);
 const manualCost = updatedServices.reduce((sum, service) => sum + service.amount, 0);
 setTempTotalCost(autoCost + manualCost);
 };

 const handleSaveServices = () => {
 const updatedDesign = {
 ...selectedDesign,
 data: {
 ...selectedDesign.data,
 services: {
 auto: selectedDesign.data.services.auto,
 manual: additionalServices,
 },
 totalCost: tempTotalCost,
 },
 };
 const updatedDesigns = savedDesigns.map((design) =>
 design.id === selectedDesign.id ? updatedDesign : design
 );
 setSavedDesigns(updatedDesigns);
 localStorage.setItem('savedDesigns', JSON.stringify(updatedDesigns));
 setSelectedDesign(updatedDesign);
 alert('Đã cập nhật dịch vụ cho thiết kế!');
 };

 useEffect(() => {
 if (!selectedDesign || !selectedDesign.data.textures) {
 setRecreatedTextures({});
 return;
 }

 const textures = {};
 let loadedCount = 0;
 const totalTextures = Object.keys(selectedDesign.data.textures).filter(
 (key) => selectedDesign.data.textures[key]?.dataURL
 ).length;

 if (totalTextures === 0) {
 setRecreatedTextures({});
 return;
 }

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

 loadedCount++;
 if (loadedCount === totalTextures) {
 setRecreatedTextures(textures);
 }
 };
 img.onerror = () => {
 console.error(`Failed to load texture for part ${part}`);
 loadedCount++;
 if (loadedCount === totalTextures) {
 setRecreatedTextures(textures);
 }
 };
 }
 });
 }, [selectedDesign]);

 return (
 <div className="container p-4">
 <div className="navigation-buttons">
 <button className="nav-btn" onClick={() => navigate('/')}>
 Go to Design
 </button>
 </div>
 <h1 className="text-2xl font-bold mb-4">Thư viện thiết kế</h1>
 {savedDesigns.length === 0 ? (
 <p className="text-gray-500">Chưa có thiết kế nào được lưu. Hãy tạo một thiết kế mới!</p >
 ) : (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
 {savedDesigns.map((design) => (
 <div key={design.id} className="border rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
 <h3 className="text-lg font-semibold">Thiết kế #{design.id}</h3>
 <p className="text-sm text-gray-600">Ngày tạo: {new Date(design.timestamp).toLocaleString()}</p>
 <p className="text-sm text-gray-600">Mô hình: {design.data.model}</p>
 <p className="text-sm text-gray-600">
 Nhà sản xuất: {design.data.manufacturer?.name || 'Không xác định'}
 </p>
 <p className="text-sm text-gray-600">Tổng chi phí: {design.data.totalCost || 0} VND</p>
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
 <div className="popup-content" style={{ width: '500px', height: '700px' }}>
 <h3 className="text-xl font-bold mb-2">Thiết kế #{selectedDesign.id}</h3>
 <p className="text-sm text-gray-600">
 Nhà sản xuất: {selectedDesign.data.manufacturer?.name || 'Không xác định'}
 </p>
 <p className="text-sm text-gray-600">Tổng chi phí: {tempTotalCost} VND</p>
 <p className="text-sm text-gray-600">Dịch vụ tự động áp dụng:</p>
 <ul className="text-sm text-gray-600 mb-2">
 {Object.entries(selectedDesign.data.services?.auto?.colors || {}).map(([component, service]) => (
 <li key={component}>
 {component}: {service.serviceName} - {service.amount} VND
 </li>
 ))}
 {Object.entries(selectedDesign.data.services?.auto?.textures || {}).map(([component, service]) => (
 <li key={component}>
 {component}: {service.serviceName} - {service.amount} VND
 </li>
 ))}
 {Object.keys(selectedDesign.data.services?.auto?.colors || {}).length === 0 &&
 Object.keys(selectedDesign.data.services?.auto?.textures || {}).length === 0 && (
 <li>Không có dịch vụ tự động.</li>
 )}
 </ul>
 <p className="text-sm text-gray-600">Dịch vụ bổ sung:</p>
 <div className="services-selector">
 {(selectedDesign.data.manufacturer?.services || [])
 .filter(
 (service) =>
 service.serviceName !== 'Thay đổi màu sắc theo yêu cầu' &&
 service.serviceName !== 'Thay đổi hình ảnh theo yêu cầu'
 )
 .map((service) => (
 <div key={service.id} className="service-item">
 <label>
 <input
 type="checkbox"
 checked={additionalServices.some((s) => s.serviceId === service.id)}
 onChange={() => handleServiceToggle(service)}
 />
 {service.serviceName} - {service.currentAmount} VND
 </label>
 </div>
 ))}
 {(selectedDesign.data.manufacturer?.services || []).filter(
 (service) =>
 service.serviceName !== 'Thay đổi màu sắc theo yêu cầu' &&
 service.serviceName !== 'Thay đổi hình ảnh theo yêu cầu'
 ).length === 0 && <p>Không có dịch vụ bổ sung nào khả dụng.</p>}
 </div>
 <Canvas
 style={{ width: '100%', height: '400px' }}
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
 <button className="save-btn" onClick={handleSaveServices}>
 Lưu Dịch Vụ
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

export default DesignLibrary;