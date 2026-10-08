import React, { useEffect, useRef, useState } from 'react';
import { ATTENDANCE_REWARDS } from '../../shared/dailyAttendance.js';
import { HudIcon } from './icons3d/HudIcon.jsx';
import './FarmNotice.css';
import { useDailyAttendance } from '../hooks/useDailyAttendance.js';
import { DailyRewardBadge } from './DailyRewardBadge.jsx';

const TABS = [
  ['daily', 'Điểm danh', 'coin'], ['events', 'Hoạt động', 'quest'],
  ['giftcode', 'Giftcode', 'basket'], ['ads', 'Đối tác', 'shop'],
];
const ACTIVITIES = [
  { id: 'fishing', asset: 'fish', title: 'Câu cá tại Hồ Pha Lê', desc: 'Chuẩn bị cần câu, tìm bến nước và bổ sung bộ sưu tập cá của bạn.', badge: 'Khám phá', venue: 'fishing' },
  { id: 'fashion', asset: 'wardrobe', title: 'Phối đồ tại tiệm Sophie', desc: 'Thử tóc, trang phục và phụ kiện trên avatar trước khi chọn mua.', badge: 'Thời trang', venue: 'fashion' },
  { id: 'casino', asset: 'gem', title: 'Hội quán trò chơi', desc: 'Ghé hội quán để xem các bàn chơi và luật của từng trò.', badge: 'Gặp gỡ', venue: 'casino' },
  { id: 'supplies', asset: 'seeds', title: 'Chuẩn bị mùa vụ mới', desc: 'Ghé tiệm nông nghiệp để tìm hạt giống và vật dụng cho nông trại.', badge: 'Nông trại', venue: 'supplies' },
];
const PACKAGES = [
  ['led_diamond', 'Màn hình quảng trường', 'Giới thiệu thương hiệu trên bảng tin.', 'phone'],
  ['gold_sponsor', 'Tài trợ hoạt động', 'Đề xuất quà tặng và hoạt động cho cư dân.', 'basket'],
  ['exclusive_npc', 'Nhân vật đại diện', 'Đề xuất nhân vật 3D và nội dung tương tác.', 'emote'],
];

export function PlazaEventNoticeModal({ connected = false, serverOffset = 0, rewardState = {}, rewardNotice = '', onClaimDailyReward = null, onRedeemCode = null, onNavigateVenue = null, onClose }) {
  const [activeTab, setActiveTab] = useState('daily');
  const [giftCode, setGiftCode] = useState('');
  const [submittedCode, setSubmittedCode] = useState('');
  const [codeMessage, setCodeMessage] = useState('');
  const [bookingForm, setBookingForm] = useState({ brand: '', contact: '', package: 'led_diamond' });
  const [showDraft, setShowDraft] = useState(false);
  const dialogRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const attendance = useDailyAttendance(rewardState?.daily, serverOffset);
  const claimedDay = attendance.claimedToday;
  const cleanCode = giftCode.trim().toUpperCase();
  const redeemed = Boolean(submittedCode && rewardState?.codes?.includes(submittedCode));

  useEffect(() => {
    const previous = document.activeElement;
    const dialog = dialogRef.current;
    dialog?.querySelector('[aria-label="Đóng bản tin"]')?.focus();
    const keydown = event => {
      if (event.key === 'Escape') { event.preventDefault(); closeRef.current?.(); }
      if (event.key !== 'Tab') return;
      const nodes = [...dialog.querySelectorAll('button:not(:disabled),input,textarea')];
      const first = nodes[0], last = nodes.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', keydown);
    return () => { document.removeEventListener('keydown', keydown); previous?.focus?.(); };
  }, []);

  const handleApplyCode = event => {
    event.preventDefault();
    if (!connected || !onRedeemCode || !cleanCode) return;
    setSubmittedCode(cleanCode);
    if (rewardState?.codes?.includes(cleanCode)) { setCodeMessage('Bạn đã sử dụng mã này.'); return; }
    setCodeMessage('Đang xác thực mã quà tặng…');
    onRedeemCode(cleanCode);
  };

  return <div className="farm-notice-overlay" onClick={onClose}>
    <section ref={dialogRef} className="farm-notice" onClick={event => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="farm-notice-title">
      <header className="farm-notice-header">
        <HudIcon asset="quest" size={46}/>
        <div><h2 id="farm-notice-title">Bảng tin Bình Minh</h2><p>Quà mỗi ngày · Hoạt động trong thị trấn</p></div>
        <button type="button" className="farm-notice-close" onClick={onClose} aria-label="Đóng bản tin"><span aria-hidden="true">×</span></button>
      </header>
      <nav className="farm-notice-tabs" aria-label="Danh mục bảng tin">
        {TABS.map(([id, label, asset]) => <button type="button" key={id} aria-pressed={activeTab === id} onClick={() => setActiveTab(id)}><HudIcon asset={asset} size={30}/><span>{label}</span>{id === 'daily' && !claimedDay && <DailyRewardBadge/>}</button>)}
      </nav>
      <div className="farm-notice-content">
        {activeTab === 'daily' && <div className="farm-attendance">
          <div className="farm-attendance-banner"><div className="farm-attendance-art"><HudIcon asset="basket" size={82}/></div><div><span className="farm-notice-eyebrow">HẸN BẠN MỖI NGÀY</span><h3>7 ngày, 7 phần quà</h3><p>Ghé thị trấn mỗi ngày để nhận xu. Giữ chuỗi điểm danh để mở quà ngày 7.</p></div><div className="farm-attendance-streak"><strong>{attendance.streak}</strong><span>ngày liên tiếp</span></div></div>
          <div className="farm-attendance-grid" aria-label="Quà điểm danh 7 ngày">{ATTENDANCE_REWARDS.map((coins, index) => {
            const day = index + 1;
            const completed = claimedDay ? day <= attendance.day : day < attendance.day;
            const today = day === attendance.day;
            return <div key={day} className={`farm-day ${completed ? 'received' : today ? 'today' : 'upcoming'} ${day === 7 ? 'milestone' : ''}`} aria-label={`Ngày ${day}: ${coins} xu, ${completed ? 'đã nhận' : today ? 'hôm nay' : 'chưa mở'}`}>
              <span className="farm-day-label">Ngày {day}</span><HudIcon asset={day === 7 ? 'basket' : 'coin'} size={day === 7 ? 66 : 48}/><strong>{coins.toLocaleString('vi-VN')} <small>xu</small></strong><span className="farm-day-state">{completed ? '✓ Đã nhận' : today ? 'Hôm nay' : 'Chưa mở'}</span>
            </div>;
          })}</div>
          <div className="farm-attendance-footer"><div><h4>{claimedDay ? 'Hẹn bạn vào ngày mai!' : `Quà hôm nay: ${attendance.coins} xu`}</h4><p>{claimedDay ? 'Bạn đã nhận phần quà của hôm nay.' : 'Bỏ lỡ một ngày, chuỗi điểm danh sẽ bắt đầu lại.'}</p></div><button type="button" className="farm-notice-primary" disabled={!connected || claimedDay || !onClaimDailyReward} onClick={() => { if (connected && !claimedDay) onClaimDailyReward?.(); }}><HudIcon asset="coin" size={24}/>{claimedDay ? 'Đã nhận hôm nay' : `Nhận ${attendance.coins} xu`}</button></div>
          {!connected && <p className="farm-notice-status" role="status">Đang mất kết nối. Kết nối lại để nhận quà.</p>}
          <p className="farm-notice-footnote">Ngày điểm danh đổi lúc 07:00, giờ Việt Nam.</p>
        </div>}

        {activeTab === 'events' && <div className="farm-notice-activities"><div className="farm-notice-section-heading"><h3>Hôm nay đi đâu?</h3><p>Chọn một hoạt động để bắt đầu khám phá.</p></div><div className="farm-activity-grid">{ACTIVITIES.map(activity => <article key={activity.id} className="farm-activity"><div className="farm-activity-art"><HudIcon asset={activity.asset} size={78}/></div><span className="farm-notice-tag">{activity.badge}</span><h4>{activity.title}</h4><p>{activity.desc}</p>{onNavigateVenue && <button type="button" className="farm-notice-secondary" onClick={() => { onNavigateVenue(activity.venue); onClose?.(); }}>Ghé thăm <span aria-hidden="true">→</span></button>}</article>)}</div></div>}

        {activeTab === 'giftcode' && <div className="farm-giftcode"><div className="farm-giftcode-art"><HudIcon asset="basket" size={110}/></div><span className="farm-notice-eyebrow">QUÀ TẶNG CƯ DÂN</span><h3>Bạn có một mã quà tặng?</h3><p>Nhập mã từ thông báo chính thức của game.<br/>Mỗi mã chỉ được sử dụng một lần.</p><form onSubmit={handleApplyCode}><label htmlFor="farm-giftcode-input">Mã quà tặng</label><div className="farm-giftcode-input-row"><input id="farm-giftcode-input" value={giftCode} maxLength={64} autoCapitalize="characters" autoComplete="off" spellCheck={false} placeholder="Nhập mã quà tặng" onChange={event => { setGiftCode(event.target.value); setSubmittedCode(''); setCodeMessage(''); }}/><button type="submit" className="farm-notice-primary" disabled={!connected || !cleanCode || !onRedeemCode}>Nhận quà</button></div></form>{codeMessage && <p role="status" className={`farm-notice-status ${redeemed ? 'success' : ''}`}>{redeemed ? 'Đã nhận quà từ mã này.' : rewardNotice || codeMessage}</p>}{!connected && <p role="status" className="farm-notice-status">Kết nối lại để kiểm tra và nhận quà.</p>}</div>}

        {activeTab === 'ads' && <div className="farm-notice-partners"><div className="farm-notice-section-heading"><h3>Cùng xây dựng thị trấn</h3><p>Chuẩn bị ý tưởng quảng cáo hoặc tài trợ cho hoạt động của cư dân.</p></div><div className="farm-partner-packages" aria-label="Hình thức hợp tác">{PACKAGES.map(([id, title, desc, asset]) => <button type="button" key={id} aria-pressed={bookingForm.package === id} onClick={() => { setBookingForm(prev => ({ ...prev, package: id })); setShowDraft(false); }}><HudIcon asset={asset} size={40}/><strong>{title}</strong><span>{desc}</span></button>)}</div><form className="farm-partner-form" onSubmit={event => { event.preventDefault(); setShowDraft(true); }}><label>Tên thương hiệu<input value={bookingForm.brand} maxLength={100} placeholder="Tên thương hiệu hoặc dự án" required onChange={event => { setBookingForm(prev => ({ ...prev, brand: event.target.value })); setShowDraft(false); }}/></label><label>Thông tin liên hệ<input value={bookingForm.contact} maxLength={150} placeholder="Email hoặc số điện thoại" required onChange={event => { setBookingForm(prev => ({ ...prev, contact: event.target.value })); setShowDraft(false); }}/></label><p>Thông tin chỉ nằm trong bản nháp này. Chức năng gửi yêu cầu chưa được mở.</p><button type="submit" className="farm-notice-secondary">Xem bản nháp</button></form>{showDraft && <div className="farm-partner-draft" role="status"><strong>Bản nháp của {bookingForm.brand}</strong><p>{PACKAGES.find(([id]) => id === bookingForm.package)?.[1]} · {bookingForm.contact}</p><small>Chưa gửi yêu cầu.</small></div>}</div>}
      </div>
    </section>
  </div>;
}
