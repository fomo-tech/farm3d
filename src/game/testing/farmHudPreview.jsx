import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { FarmToolDock } from '../../components/FarmToolDock.jsx';

function Preview() {
  const [tool, setTool] = useState('hand');
  const [crop, setCrop] = useState('carrot');
  const crops = { carrot: { id: 'carrot', name: 'Cà rốt', level: 1, seedCost: 10, growMs: 60000 }, tomato: { id: 'tomato', name: 'Cà chua', level: 1, seedCost: 20, growMs: 120000 }, corn: { id: 'corn', name: 'Ngô', level: 1, seedCost: 30, growMs: 180000 } };
  return <FarmToolDock crops={crops} progress={{ inventory: { carrot: 13 }, barnLevel: 1, selectedCrop: crop, level: 2 }} connected activeTool={tool} selectTool={setTool} chooseCrop={item => setCrop(item.id)} openHerd={() => {}} openInventory={() => {}} />;
}
createRoot(document.getElementById('root')).render(<Preview />);
