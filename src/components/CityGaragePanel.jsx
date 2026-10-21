import React from 'react';
import {CITY_CARS,CITY_PAINTS,CITY_PAINT_PRICE,cityRepairCost,cityRecoveryQuote} from '../../shared/cityGarage.js';
export function CityGaragePanel({garage,coins,disabled,onAction}){
 const recovery=cityRecoveryQuote(garage,coins);
 return <section className="city-garage" aria-label="Garage cá nhân"><h3>GARAGE CÁ NHÂN</h3><p>Đỗ xe và xuống xe để mua, lấy hoặc sơn xe. Không đổi thông số động cơ.</p>
 {CITY_CARS.map(car=>{const owned=garage.owned.includes(car.id),selected=garage.selected===car.id;return <div key={car.id}><strong>{car.name}{selected?' · Đang dùng':''}</strong><p>{car.description}</p><button disabled={disabled||(!owned&&coins<car.price)||selected} onClick={()=>onAction(owned?'city_garage_select':'city_garage_buy',{id:car.id})}>{selected?'Đã chọn':owned?'Lấy xe':`Mua · $${car.price}`}</button></div>;})}
 <h4>Sơn xe · ${CITY_PAINT_PRICE}</h4><div className="city-paints">{CITY_PAINTS.map(color=><button key={color} aria-label={`Sơn màu ${color}`} aria-pressed={garage.paints[garage.selected]===color} disabled={disabled||coins<CITY_PAINT_PRICE||garage.paints[garage.selected]===color} onClick={()=>onAction('city_garage_paint',{color})}><i style={{background:color}}/>{garage.paints[garage.selected]===color?'Đang dùng':'Sơn'}</button>)}</div>
 <button disabled={disabled||coins<recovery.cost} onClick={()=>onAction('city_garage_recover')}>{recovery.emergency?'Cứu hộ khẩn cấp · chạy tạm 20%':'Đưa xe bỏ lại về garage'} · ${recovery.cost}</button>
 <p>Độ bền xe đang chọn: {garage.health[garage.selected]}%</p>
 <button disabled={disabled||garage.health[garage.selected]>=100||coins<cityRepairCost(garage.health[garage.selected])} onClick={()=>onAction('city_garage_repair')}>Sửa xe · ${cityRepairCost(garage.health[garage.selected])}</button>
 </section>;
}
