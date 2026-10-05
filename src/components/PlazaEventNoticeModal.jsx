import React, { useState } from 'react';

/**
 * BẢN TIN QUẢNG TRƯỜNG & SỰ KIỆN KAIA (PLAZA EVENT NOTICE MODAL)
 * Thiết kế phong cách Play Together Cute-Core
 */
export function PlazaEventNoticeModal({
  onClaimDailyReward = null,
  onRedeemCode = null,
  onNavigateVenue = null,
  onClose,
}) {
  const [activeTab, setActiveTab] = useState('ads'); // 'ads' | 'events' | 'daily' | 'giftcode'
  const [giftCode, setGiftCode] = useState('');
  const [codeMessage, setCodeMessage] = useState(null);
  const [claimedDay, setClaimedDay] = useState(false);
  const [bookingForm, setBookingForm] = useState({ brand: '', contact: '', package: 'led_diamond' });
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const events = [
    {
      id: 'fishing',
      title: '🎣 Đại Hội Câu Cá Hồ Pha Lê',
      tag: 'HOT EVENT',
      tagColor: '#ef4444',
      venue: 'fishing',
      desc: 'Săn các loài cá Thủy Quái khổng lồ tại Hồ Pha Lê để giành Cần Câu Vàng và hàng ngàn Xu thưởng danh giá!',
      reward: 'Cần câu Titan & 2,000 Xu',
      period: 'Diễn ra suốt tuần này',
      bgGrad: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    },
    {
      id: 'fashion',
      title: '👗 Tuần Lễ Thời Trang Sophie',
      tag: 'FASHION WEEK',
      tagColor: '#ec4899',
      venue: 'fashion',
      desc: 'Tiệm thời trang Sophie giảm giá 20% toàn bộ mẫu cánh thiên thần, mũ gấu Chibi và các set đồ mùa thu thanh lịch!',
      reward: 'Giảm giá 20% trang phục',
      period: 'Đến hết Chủ Nhật',
      bgGrad: 'linear-gradient(135deg, #db2777 0%, #be185d 100%)',
    },
    {
      id: 'casino',
      title: '🎰 Vòng Quay May Mắn Casino Kaia',
      tag: 'JACKPOT',
      tagColor: '#f59e0b',
      venue: 'casino',
      desc: 'Hội quán trò chơi mở hũ thưởng Jackpot tích lũy 50,000 Xu! Thử sức với Bài Cào, Bầu Cua Tôm Cá và Tài Xỉu.',
      reward: 'Hũ Jackpot 50,000 Xu',
      period: 'Mở cửa 24/7',
      bgGrad: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
    },
    {
      id: 'supplies',
      title: '🌱 Lễ Hội Mùa Màng Bội Thu',
      tag: 'FARM BOOST',
      tagColor: '#22c55e',
      venue: 'supplies',
      desc: 'Siêu thị Nông nghiệp cung cấp các giống hạt cà rốt, dâu tây, dưa hấu siêu cấp kèm phân bón tăng tốc sinh trưởng!',
      reward: 'Nhân đôi năng suất cây trồng',
      period: 'Sự kiện nông trại mùa vàng',
      bgGrad: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
    },
  ];

  const dailyDays = [
    { day: 1, reward: '100 Xu', icon: '🪙', done: true },
    { day: 2, reward: '5 Hạt Cà Rốt', icon: '🥕', done: true },
    { day: 3, reward: '200 Xu', icon: '🪙', done: claimedDay },
    { day: 4, reward: 'Phân Bón x2', icon: '🧪', done: false },
    { day: 5, reward: '500 Xu', icon: '💰', done: false },
    { day: 6, reward: '5 Hạt Dâu Tây', icon: '🍓', done: false },
    { day: 7, reward: 'Cúp Vàng Kaia', icon: '🏆', done: false },
  ];

  const handleClaim = () => {
    setClaimedDay(true);
    onClaimDailyReward?.({ day: 3, reward: '200 Xu' });
  };

  const handleApplyCode = (e) => {
    e.preventDefault();
    const clean = giftCode.trim().toUpperCase();
    if (!clean) return;

    const validCodes = {
      KAIAFARM: { text: 'Nhận thành công 500 Xu + 10 Hạt Cà Chua!', coins: 500 },
      PLAYTOGETHER: { text: 'Nhận thành công Cần Câu VIP + 1000 Xu!', coins: 1000 },
      CHAOCUDAN: { text: 'Nhận thành công 300 Xu chào đón cư dân mới!', coins: 300 },
    };

    if (validCodes[clean]) {
      setCodeMessage({ success: true, text: validCodes[clean].text });
      onRedeemCode?.(clean, validCodes[clean]);
      setGiftCode('');
    } else {
      setCodeMessage({ success: false, text: 'Mã Giftcode không đúng hoặc đã hết hạn.' });
    }
  };

  return (
    <div className="pt-notice-modal-backdrop" onClick={onClose}>
      <section
        className="pt-notice-modal-card pt-billboard-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Bản tin sự kiện thị trấn Kaia"
      >
        {/* Header */}
        <header className="pt-modal-header bb-header">
          <div className="bb-title-group">
            <span className="bb-megaphone-icon">📢</span>
            <div>
              <h2 className="pt-modal-title bb-title">BẢN TIN SỰ KIỆN QUẢNG TRƯỜNG</h2>
              <p className="bb-subtitle">Thông báo hoạt động, giải đấu & quà tặng cư dân</p>
            </div>
          </div>
          <button className="pt-modal-close" onClick={onClose} aria-label="Đóng bản tin">✕</button>
        </header>

        {/* Navigation Tabs */}
        <div className="bb-tabs">
          <button
            className={`bb-tab-btn ${activeTab === 'ads' ? 'active' : ''}`}
            onClick={() => setActiveTab('ads')}
          >
            📢 Đặt Quảng Cáo VIP
          </button>
          <button
            className={`bb-tab-btn ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            🔥 Sự Kiện Hot
          </button>
          <button
            className={`bb-tab-btn ${activeTab === 'daily' ? 'active' : ''}`}
            onClick={() => setActiveTab('daily')}
          >
            🎁 Quà Đăng Nhập
          </button>
          <button
            className={`bb-tab-btn ${activeTab === 'giftcode' ? 'active' : ''}`}
            onClick={() => setActiveTab('giftcode')}
          >
            🎟️ Nhập Giftcode
          </button>
        </div>

        {/* Tab 1: Events List */}
        {activeTab === 'events' && (
          <div className="bb-events-scroll">
            {events.map((ev) => (
              <article key={ev.id} className="bb-event-card" style={{ background: ev.bgGrad }}>
                <div className="bb-card-badge" style={{ backgroundColor: ev.tagColor }}>
                  {ev.tag}
                </div>
                <h3 className="bb-card-title">{ev.title}</h3>
                <p className="bb-card-desc">{ev.desc}</p>
                <div className="bb-card-footer">
                  <div className="bb-card-reward">
                    <span className="bb-reward-label">Phần thưởng:</span>
                    <strong className="bb-reward-value">{ev.reward}</strong>
                  </div>
                  {onNavigateVenue && ev.venue && (
                    <button
                      className="bb-card-btn"
                      onClick={() => {
                        onNavigateVenue(ev.venue);
                        onClose();
                      }}
                    >
                      Đến ngay ➜
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Tab 2: Daily Attendance */}
        {activeTab === 'daily' && (
          <div className="bb-daily-container">
            <div className="bb-daily-banner">
              <h4>Điểm Danh 7 Ngày Nhận Thưởng Lớn!</h4>
              <p>Mỗi ngày online nhận thưởng xu, phân bón và hạt giống hiếm.</p>
            </div>

            <div className="bb-daily-grid">
              {dailyDays.map((d) => (
                <div key={d.day} className={`bb-day-card ${d.done ? 'claimed' : d.day === 3 && !claimedDay ? 'today' : ''}`}>
                  <div className="bb-day-num">Ngày {d.day}</div>
                  <div className="bb-day-icon">{d.icon}</div>
                  <div className="bb-day-reward">{d.reward}</div>
                  {d.done && <div className="bb-day-check">✓ Đã nhận</div>}
                </div>
              ))}
            </div>

            <div className="bb-daily-action">
              <button
                className={`bb-claim-btn ${claimedDay ? 'claimed' : ''}`}
                onClick={handleClaim}
                disabled={claimedDay}
              >
                {claimedDay ? '✓ Bạn đã nhận thưởng hôm nay' : '🎁 Nhận Thưởng Ngày 3 (+200 Xu)'}
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Giftcode */}
        {activeTab === 'giftcode' && (
          <div className="bb-giftcode-container">
            <div className="bb-giftcode-box">
              <div className="bb-giftcode-icon">🎟️</div>
              <h4>Nhập Giftcode Kaia Nhận Quà Tân Thủ</h4>
              <p>Nhập các mã quà tặng để nhận hàng trăm Xu, hạt giống và vật phẩm VIP!</p>

              <form onSubmit={handleApplyCode} className="bb-giftcode-form">
                <input
                  type="text"
                  placeholder="Nhập mã (VD: KAIAFARM, PLAYTOGETHER)"
                  value={giftCode}
                  onChange={(e) => setGiftCode(e.target.value)}
                  className="bb-giftcode-input"
                />
                <button type="submit" className="bb-giftcode-submit">
                  Kích hoạt
                </button>
              </form>

              {codeMessage && (
                <div className={`bb-code-alert ${codeMessage.success ? 'success' : 'error'}`}>
                  {codeMessage.text}
                </div>
              )}

              <div className="bb-code-hints">
                <strong>Gợi ý mã đang hoạt động:</strong>
                <div className="bb-hint-chips">
                  <span onClick={() => setGiftCode('KAIAFARM')}>KAIAFARM</span>
                  <span onClick={() => setGiftCode('PLAYTOGETHER')}>PLAYTOGETHER</span>
                  <span onClick={() => setGiftCode('CHAOCUDAN')}>CHAOCUDAN</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Commercial Advertising Booking (Dành cho đối tác đặt quảng cáo) */}
        {activeTab === 'ads' && (
          <div className="bb-ads-scroll">
            <div className="bb-ads-hero-card">
              <div className="bb-ads-hero-badge">PRIME METROPOLIS LED 15M</div>
              <h3 className="bb-ads-hero-title">Vị Trí Đặt Quảng Cáo VIP Trung Tâm</h3>
              <p className="bb-ads-hero-desc">
                Cơ hội vàng tiếp cận hàng vạn cư dân và khách du lịch thị trấn Kaia mỗi ngày. Phát sóng 24/7 trực tiếp trên màn hình LED 15m × 8.5m độ phân giải 2K siêu nét!
              </p>
              <div className="bb-ads-stats-row">
                <div className="bb-stat-item">
                  <strong>100,000+</strong>
                  <span>Lượt tiếp cận/tuần</span>
                </div>
                <div className="bb-stat-item">
                  <strong>24/7</strong>
                  <span>Phát sóng liên tục</span>
                </div>
                <div className="bb-stat-item">
                  <strong>GIẢM 30%</strong>
                  <span>Ưu đãi đối tác mới</span>
                </div>
              </div>
            </div>

            <h4 className="bb-ads-packages-title">💎 Các Gói Quảng Cáo & Tài Trợ Doanh Nghiệp</h4>
            <div className="bb-packages-grid">
              <div className={`bb-package-card ${bookingForm.package === 'led_diamond' ? 'selected' : ''}`} onClick={() => setBookingForm(prev => ({ ...prev, package: 'led_diamond' }))}>
                <div className="bb-pkg-header">
                  <span className="bb-pkg-icon">👑</span>
                  <div>
                    <h5>Gói Kim Cương (Màn LED 15m)</h5>
                    <span className="bb-pkg-badge hot">ĐẮC ĐỊA NHẤT</span>
                  </div>
                </div>
                <ul className="bb-pkg-perks">
                  <li>✔ Hiển thị Banner động & Slogan 24/7 trên màn hình LED 15m trung tâm</li>
                  <li>✔ Tích hợp QR Code quét trực tiếp chuyển hướng Web / Zalo / Fanpage</li>
                  <li>✔ Tặng kèm 1 thông báo toàn server mỗi 6 tiếng</li>
                </ul>
              </div>

              <div className={`bb-package-card ${bookingForm.package === 'gold_sponsor' ? 'selected' : ''}`} onClick={() => setBookingForm(prev => ({ ...prev, package: 'gold_sponsor' }))}>
                <div className="bb-pkg-header">
                  <span className="bb-pkg-icon">⭐</span>
                  <div>
                    <h5>Gói Nhà Tài Trợ Vàng</h5>
                    <span className="bb-pkg-badge best">TƯƠNG TÁC CAO</span>
                  </div>
                </div>
                <ul className="bb-pkg-perks">
                  <li>✔ Bao gồm toàn bộ quyền lợi Gói Kim Cương</li>
                  <li>✔ Tạo mã Giftcode riêng mang tên thương hiệu để cư dân nhập nhận quà</li>
                  <li>✔ Phát loa hệ thống tự động chúc mừng đối tác 2 lần/ngày</li>
                </ul>
              </div>

              <div className={`bb-package-card ${bookingForm.package === 'exclusive_npc' ? 'selected' : ''}`} onClick={() => setBookingForm(prev => ({ ...prev, package: 'exclusive_npc' }))}>
                <div className="bb-pkg-header">
                  <span className="bb-pkg-icon">🤖</span>
                  <div>
                    <h5>Gói Đại Sứ Thương Hiệu 3D</h5>
                    <span className="bb-pkg-badge vip">ĐỘC QUYỀN</span>
                  </div>
                </div>
                <ul className="bb-pkg-perks">
                  <li>✔ Bao gồm toàn bộ quyền lợi Màn LED + Giftcode thương hiệu</li>
                  <li>✔ Thiết kế riêng 01 NPC Mascot 3D đại sứ đứng chào đón khách tại quảng trường</li>
                  <li>✔ Hộp thoại tương tác riêng giới thiệu chi tiết sản phẩm / dịch vụ</li>
                </ul>
              </div>
            </div>

            <div className="bb-ads-contact-card">
              <div className="bb-contact-header">
                <span className="bb-contact-icon">☎</span>
                <div>
                  <h4>Liên Hệ Booking & Hợp Đồng Tài Trợ</h4>
                  <p>Hỗ trợ thiết kế hình ảnh 3D miễn phí cho mọi doanh nghiệp & cá nhân</p>
                </div>
              </div>

              <div className="bb-hotline-pills">
                <div className="bb-hotline-pill">
                  <span className="bb-h-label">Hotline / Zalo:</span>
                  <strong className="bb-h-val">0988.888.XXX</strong>
                </div>
                <div className="bb-hotline-pill">
                  <span className="bb-h-label">Telegram:</span>
                  <strong className="bb-h-val">@KaiaAdsMedia</strong>
                </div>
                <div className="bb-hotline-pill">
                  <span className="bb-h-label">Email BQT:</span>
                  <strong className="bb-h-val">ads@kaiatown.online</strong>
                </div>
              </div>

              {bookingSuccess ? (
                <div className="bb-booking-success-msg">
                  🎉 Cảm ơn quý khách! Ban Quản Trị Kaia đã tiếp nhận yêu cầu và sẽ liên hệ tư vấn qua Zalo / Số điện thoại trong vòng 15 phút.
                </div>
              ) : (
                <form
                  className="bb-ads-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!bookingForm.contact.trim()) return;
                    setBookingSuccess(true);
                  }}
                >
                  <div className="bb-form-inputs">
                    <input
                      type="text"
                      placeholder="Tên thương hiệu / Shop / Sản phẩm của bạn..."
                      value={bookingForm.brand}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, brand: e.target.value }))}
                      className="bb-ads-input"
                    />
                    <input
                      type="text"
                      placeholder="Số điện thoại / Zalo để nhận báo giá chi tiết..."
                      value={bookingForm.contact}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, contact: e.target.value }))}
                      className="bb-ads-input"
                      required
                    />
                  </div>
                  <button type="submit" className="bb-ads-submit-btn">
                    📩 Gửi Yêu Cầu Tư Vấn & Nhận Ưu Đãi 30%
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
