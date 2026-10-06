import { useState } from 'react';
import { Icon3dBike } from './icons3d/GameIcons3D.jsx';
import './VehicleQuickMenu.css';

export function VehicleQuickMenu({ vehicles, owned, current, connected, onSelect }) {
  const [open, setOpen] = useState(false);
  return <div className="vehicle-quick-menu">
    {open && <section className="vehicle-quick-panel" aria-label="Phương tiện đã sở hữu">
      <header><strong>Gara của bạn</strong><button type="button" onClick={() => setOpen(false)} aria-label="Đóng gara">×</button></header>
      <small>Chọn xe để lên · chọn Đi bộ để xuống</small>
      {vehicles.filter(vehicle => vehicle.id === 'walk' || owned.includes(vehicle.id)).map(vehicle =>
        <button type="button" key={vehicle.id} disabled={!connected || current === vehicle.id} aria-pressed={current === vehicle.id}
          onClick={() => { onSelect(vehicle); setOpen(false); }}>
          <i>{vehicle.icon}</i><span><b>{vehicle.name}</b><small>{current === vehicle.id ? 'Đang sử dụng' : vehicle.id === 'walk' ? 'Xuống xe' : `Tốc độ ${vehicle.speed}`}</small></span>
          <em>{current === vehicle.id ? '✓' : 'Lên'}</em>
        </button>)}
      {!connected && <small role="status">Đang chờ kết nối server…</small>}
    </section>}
    <button type="button" className="vehicle-quick-trigger" aria-expanded={open} aria-label="Gọi phương tiện đã sở hữu" onClick={() => setOpen(value => !value)}>
      <span aria-hidden="true"><Icon3dBike size={25} /></span><b>{current === 'walk' ? 'Gọi xe' : 'Đổi xe'}</b>
    </button>
  </div>;
}
