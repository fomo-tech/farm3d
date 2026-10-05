import React from 'react';
import {createRoot} from 'react-dom/client';
import PlayTogetherWorldMapModal from './components/PlayTogetherWorldMapModal.jsx';
createRoot(document.getElementById('root')).render(<PlayTogetherWorldMapModal isOpen onClose={()=>{}} onTravel={()=>{}} session={{farmId:'farm_000003'}} playerCoord={{x:21,z:-18}} currentZone={{id:'city-center',label:'Thành phố Bình Minh'}}/>);
