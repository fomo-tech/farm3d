import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { CharacterCreationModal } from './components/CharacterArrivalModal.jsx';
createRoot(document.getElementById('root')).render(<CharacterCreationModal defaultName="Bắp Non" onSubmit={() => {}} />);
