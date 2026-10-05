import React, { useState, useMemo } from 'react';
import './PlayTogetherInventoryModal.css';
import {
  Icon3dWateringCanDaisy,
  Icon3dHoeGarden,
  Icon3dSeedBagKraft,
  Icon3dMilkBottle,
  Icon3dRedApple,
  Icon3dBlueFish,
  Icon3dWoodenChair,
  Icon3dTableLamp,
  Icon3dBlueBackpack,
  Icon3dStrawHat,
  Icon3dGiftBox,
  Icon3dWoodPlanks,
  Icon3dCarrotPlump,
  Icon3dStoneRock,
  Icon3dPottedFlower,
  Icon3dCategoryAll,
  Icon3dCategoryTools,
  Icon3dCategorySeeds,
  Icon3dCategoryFurniture,
  Icon3dCategoryClothing,
  Icon3dCategoryItems,
  Icon3dTrashCan,
  Icon3dCloseButton,
  Icon3dHeaderBackpack,
  Icon3dDuckFloatie,
  Icon3dFrogBackpack,
  Icon3dCatHeadphones,
  Icon3dRoundGlasses,
  Icon3dAngelWings,
  Icon3dSuitVest,
  Icon3dCatHoodie,
  Icon3dFoxTail,
  Icon3dToastMouth,
} from './icons3d/Inventory3DIcons.jsx';
import { Icon3dFashionLogo } from './icons3d/Fashion3DIcons.jsx';

const DEFAULT_ITEMS = [
  {
    id: 'watering_can',
    name: 'Bình Tưới Nước',
    category: 'tools',
    categoryLabel: 'Công Cụ',
    count: 12,
    desc: 'Dùng để tưới nước cho cây trồng. Giúp cây phát triển nhanh hơn.',
    actionLabel: 'SỬ DỤNG',
    IconComponent: Icon3dWateringCanDaisy,
    actionColor: '#facc15',
  },
  {
    id: 'hoe',
    name: 'Cuốc Làm Đất',
    category: 'tools',
    categoryLabel: 'Công Cụ',
    count: 1,
    desc: 'Dùng để xới các luống đất màu mỡ chuẩn bị gieo trồng vụ mùa mới.',
    actionLabel: 'SỬ DỤNG',
    IconComponent: Icon3dHoeGarden,
    actionColor: '#facc15',
  },
  {
    id: 'seeds_pack',
    name: 'Bao Hạt Giống',
    category: 'seeds',
    categoryLabel: 'Hạt Giống',
    count: 24,
    desc: 'Hạt giống nông sản tuyển chọn cao cấp giúp tăng tỉ lệ bội thu.',
    actionLabel: 'GIEO TRỒNG',
    IconComponent: Icon3dSeedBagKraft,
    actionColor: '#4ade80',
  },
  {
    id: 'milk',
    name: 'Bình Sữa Bò',
    category: 'items',
    categoryLabel: 'Vật Phẩm',
    count: 8,
    desc: 'Sữa bò tươi nguyên chất vừa vắt tại chuồng, dùng chế biến thực phẩm.',
    actionLabel: 'SỬ DỤNG',
    IconComponent: Icon3dMilkBottle,
    actionColor: '#38bdf8',
  },
  {
    id: 'apple',
    name: 'Quả Táo Đỏ',
    category: 'items',
    categoryLabel: 'Vật Phẩm',
    count: 15,
    desc: 'Táo đỏ giòn ngọt mọng nước hái từ vườn cây ăn trái quanh thung lũng.',
    actionLabel: 'THƯỞNG THỨC',
    IconComponent: Icon3dRedApple,
    actionColor: '#ef4444',
  },
  {
    id: 'blue_fish',
    name: 'Cá Xanh Biển',
    category: 'items',
    categoryLabel: 'Vật Phẩm',
    count: 6,
    desc: 'Cá biển sọc xanh bóng bẩy vừa câu được từ Hồ Pha Lê trung tâm.',
    actionLabel: 'BÁN',
    IconComponent: Icon3dBlueFish,
    actionColor: '#38bdf8',
  },
  {
    id: 'wood_chair',
    name: 'Ghế Gỗ',
    category: 'furniture',
    categoryLabel: 'Nội Thất',
    count: 4,
    desc: 'Ghế gỗ sồi thanh lịch trang trí cho khuôn viên và nội thất nhà ở.',
    actionLabel: 'BỐ TRÍ',
    IconComponent: Icon3dWoodenChair,
    actionColor: '#fbbf24',
  },
  {
    id: 'table_lamp',
    name: 'Đèn Bàn',
    category: 'furniture',
    categoryLabel: 'Nội Thất',
    count: 3,
    desc: 'Đèn để bàn chụp nón vàng ấm cúng thắp sáng không gian phòng ngủ.',
    actionLabel: 'BỐ TRÍ',
    IconComponent: Icon3dTableLamp,
    actionColor: '#fbbf24',
  },
  {
    id: 'blue_backpack',
    name: 'Ba Lô Xanh',
    category: 'clothing',
    categoryLabel: 'Trang Phục',
    count: 1,
    desc: 'Chiếc ba lô du lịch tiện dụng có huy hiệu ngôi sao may mắn Kaia.',
    actionLabel: 'TRANG BỊ',
    IconComponent: Icon3dBlueBackpack,
    actionColor: '#38bdf8',
  },
  {
    id: 'straw_hat',
    name: 'Mũ Rơm',
    category: 'clothing',
    categoryLabel: 'Trang Phục',
    count: 1,
    desc: 'Mũ rơm thắt nơ đỏ che mát cho người nông dân những ngày nắng rực.',
    actionLabel: 'TRANG BỊ',
    IconComponent: Icon3dStrawHat,
    actionColor: '#fbbf24',
  },
  {
    id: 'duck_floatie',
    name: 'Phao Vịt Vàng',
    category: 'clothing',
    categoryLabel: 'Trang Phục',
    count: 1,
    desc: 'Phao bơi hình vịt vàng quấn quanh eo lắc lư siêu cưng Play Together.',
    actionLabel: 'TRANG BỊ',
    IconComponent: Icon3dDuckFloatie,
    actionColor: '#facc15',
  },
  {
    id: 'frog_backpack',
    name: 'Ba Lô Ếch Xanh',
    category: 'clothing',
    categoryLabel: 'Trang Phục',
    count: 1,
    desc: 'Ba lô ếch mắt lồi xanh lá ngộ nghĩnh đung đưa sau lưng.',
    actionLabel: 'TRANG BỊ',
    IconComponent: Icon3dFrogBackpack,
    actionColor: '#22c55e',
  },
  {
    id: 'cat_headphones',
    name: 'Tai Nghe Mèo RGB',
    category: 'clothing',
    categoryLabel: 'Trang Phục',
    count: 1,
    desc: 'Tai nghe gaming chụp tai phát sáng cá tính chuẩn idol Kaia.',
    actionLabel: 'TRANG BỊ',
    IconComponent: Icon3dCatHeadphones,
    actionColor: '#ec4899',
  },
  {
    id: 'round_glasses',
    name: 'Kính Cận Nobita',
    category: 'clothing',
    categoryLabel: 'Trang Phục',
    count: 1,
    desc: 'Kính tròn trí thức học đường siêu ngố và dễ thương.',
    actionLabel: 'TRANG BỊ',
    IconComponent: Icon3dRoundGlasses,
    actionColor: '#38bdf8',
  },
  {
    id: 'angel_wings',
    name: 'Cánh Thiên Thần',
    category: 'clothing',
    categoryLabel: 'Trang Phục',
    count: 1,
    desc: 'Đôi cánh thiên sứ trắng muốt tự động vỗ cánh lơ lửng.',
    actionLabel: 'TRANG BỊ',
    IconComponent: Icon3dAngelWings,
    actionColor: '#facc15',
  },
  {
    id: 'top_suit_vest_luxury',
    name: 'Vest Tuxedo Dạ Hội',
    category: 'clothing',
    categoryLabel: 'Trang Phục',
    count: 1,
    desc: 'Áo gile đen ôm dáng, sơ mi trắng nơ đỏ quý phái chuẩn tiệc quý tộc Play Together.',
    actionLabel: 'TRANG BỊ',
    IconComponent: Icon3dSuitVest,
    actionColor: '#3b82f6',
  },
  {
    id: 'top_cat_ear_hoodie',
    name: 'Hoodie Mèo Đen',
    category: 'clothing',
    categoryLabel: 'Trang Phục',
    count: 1,
    desc: 'Áo hoodie phồng form rộng túi kangaroo cá tính bồng bềnh sau lưng.',
    actionLabel: 'TRANG BỊ',
    IconComponent: Icon3dCatHoodie,
    actionColor: '#ec4899',
  },
  {
    id: 'fox_tail',
    name: 'Đuôi Cáo Lắc Lư',
    category: 'clothing',
    categoryLabel: 'Trang Phục',
    count: 1,
    desc: 'Chiếc đuôi cáo cam chóp trắng đung đưa sống động theo từng bước chạy.',
    actionLabel: 'TRANG BỊ',
    IconComponent: Icon3dFoxTail,
    actionColor: '#ea580c',
  },
  {
    id: 'toast_mouth',
    name: 'Bánh Mì Ngậm Miệng',
    category: 'clothing',
    categoryLabel: 'Trang Phục',
    count: 1,
    desc: 'Lát bánh mì nướng bơ vàng ruộm ngậm vội khi chạy đến trường chuẩn anime.',
    actionLabel: 'TRANG BỊ',
    IconComponent: Icon3dToastMouth,
    actionColor: '#f59e0b',
  },
  {
    id: 'gift_box',
    name: 'Hộp Quà May Mắn',
    category: 'items',
    categoryLabel: 'Vật Phẩm',
    count: 5,
    desc: 'Hộp quà bí ẩn chứa các phần thưởng xu, vật phẩm và trang phục quý.',
    actionLabel: 'MỞ QUÀ',
    IconComponent: Icon3dGiftBox,
    actionColor: '#f43f5e',
  },
  {
    id: 'wood_planks',
    name: 'Khúc Gỗ Xẻ',
    category: 'items',
    categoryLabel: 'Vật Phẩm',
    count: 32,
    desc: 'Thanh gỗ tự nhiên thu được từ rừng dùng để xây dựng và nâng cấp nông trại.',
    actionLabel: 'CHẾ TẠO',
    IconComponent: Icon3dWoodPlanks,
    actionColor: '#f59e0b',
  },
  {
    id: 'carrot',
    name: 'Củ Cà Rốt',
    category: 'items',
    categoryLabel: 'Vật Phẩm',
    count: 18,
    desc: 'Cà rốt tươi ngon thu hoạch từ vườn đất, chứa hàm lượng dinh dưỡng cao.',
    actionLabel: 'BÁN',
    IconComponent: Icon3dCarrotPlump,
    actionColor: '#ea580c',
  },
  {
    id: 'stone_rock',
    name: 'Khối Đá Cuội',
    category: 'items',
    categoryLabel: 'Vật Phẩm',
    count: 27,
    desc: 'Đá cuội rắn chắc thu nhặt từ lòng suối phục vụ xây dựng chuồng trại.',
    actionLabel: 'CHẾ TẠO',
    IconComponent: Icon3dStoneRock,
    actionColor: '#64748b',
  },
  {
    id: 'potted_flower',
    name: 'Chậu Hoa Cúc',
    category: 'furniture',
    categoryLabel: 'Nội Thất',
    count: 9,
    desc: 'Chậu hoa cúc trắng thơm ngát làm đẹp cho lối vào và ban công nông trại.',
    actionLabel: 'BỐ TRÍ',
    IconComponent: Icon3dPottedFlower,
    actionColor: '#10b981',
  },
];

export function PlayTogetherInventoryModal({
  isOpen = false,
  onClose,
  onOpenFashion,
  progress,
  onUseItem,
  onDropItem,
  farmAudio,
}) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedItemId, setSelectedItemId] = useState('watering_can');

  // Hợp nhất dữ liệu item: Dùng giá trị kho đồ thực tế của người chơi nếu có
  const items = useMemo(() => {
    return DEFAULT_ITEMS.map(item => {
      let liveCount = item.count;
      if (progress?.inventory && item.id in progress.inventory) {
        liveCount = progress.inventory[item.id] || 0;
      } else if (item.id === 'carrot' && progress?.inventory?.carrot !== undefined) {
        liveCount = progress.inventory.carrot;
      } else if (item.id === 'milk' && progress?.inventory?.milk !== undefined) {
        liveCount = progress.inventory.milk;
      }
      return {
        ...item,
        count: liveCount,
      };
    });
  }, [progress]);

  // Bộ lọc danh mục & tìm kiếm
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return item.name.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q);
      }
      return true;
    });
  }, [items, activeCategory, searchQuery]);

  // Item đang được chọn để hiển thị chi tiết bên phải
  const selectedItem = useMemo(() => {
    return items.find(it => it.id === selectedItemId) || filteredItems[0] || items[0];
  }, [items, selectedItemId, filteredItems]);

  if (!isOpen) return null;

  return (
    <div className="pt-inv-overlay" onClick={onClose}>
      <div className="pt-inv-modal" onClick={e => e.stopPropagation()}>
        {/* === HEADER NÔNG TRẠI GHIBLI / PLAY TOGETHER === */}
        <div className="pt-inv-header">
          {/* Nền phong cảnh hoạt họa vector */}
          <div className="pt-inv-header-bg">
            <svg viewBox="0 0 880 140" preserveAspectRatio="none" className="pt-inv-scenery-svg">
              <defs>
                <linearGradient id="pt_sky_grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#0284c7" />
                </linearGradient>
                <linearGradient id="pt_hill_back" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#6ee7b7" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
                <linearGradient id="pt_hill_front" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#86efac" />
                  <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
              </defs>

              {/* Bầu trời xanh */}
              <rect width="880" height="140" fill="url(#pt_sky_grad)" />

              {/* Các đám mây trắng bồng bềnh */}
              <g fill="#ffffff" opacity="0.88">
                <ellipse cx="280" cy="50" rx="35" ry="16" />
                <ellipse cx="305" cy="42" rx="26" ry="18" />
                <ellipse cx="260" cy="54" rx="20" ry="12" />

                <ellipse cx="440" cy="38" rx="28" ry="14" />
                <ellipse cx="460" cy="32" rx="22" ry="15" />

                <ellipse cx="680" cy="48" rx="32" ry="15" />
                <ellipse cx="700" cy="40" rx="24" ry="16" />
              </g>

              {/* Đồi xanh hậu cảnh */}
              <path d="M 460 140 Q 560 55 680 140 Z" fill="url(#pt_hill_back)" />
              <path d="M 640 140 Q 740 65 840 140 Z" fill="url(#pt_hill_back)" />

              {/* Đồi xanh tiền cảnh */}
              <path d="M 520 140 Q 640 70 780 140 Z" fill="url(#pt_hill_front)" />
              <path d="M 720 140 Q 820 80 880 140 Z" fill="url(#pt_hill_front)" />

              {/* Hàng rào gỗ nông thôn */}
              <g stroke="#ffffff" strokeWidth="2.5" opacity="0.9">
                <line x1="680" y1="125" x2="740" y2="125" />
                <line x1="680" y1="132" x2="740" y2="132" />
                <line x1="690" y1="120" x2="690" y2="138" />
                <line x1="710" y1="120" x2="710" y2="138" />
                <line x1="730" y1="120" x2="730" y2="138" />
              </g>

              {/* Cối xay gió gỗ */}
              <g transform="translate(745, 68)">
                {/* Thân tháp cối xay */}
                <polygon points="6,65 14,25 24,25 32,65" fill="#fef3c7" stroke="#78350f" strokeWidth="1.5" />
                <polygon points="12,25 19,14 26,25" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
                {/* Trục & 4 cánh quạt quay */}
                <circle cx="19" cy="28" r="3" fill="#78350f" />
                <line x1="19" y1="28" x2="2" y2="10" stroke="#78350f" strokeWidth="2" />
                <line x1="19" y1="28" x2="36" y2="46" stroke="#78350f" strokeWidth="2" />
                <line x1="19" y1="28" x2="36" y2="10" stroke="#78350f" strokeWidth="2" />
                <line x1="19" y1="28" x2="2" y2="46" stroke="#78350f" strokeWidth="2" />
              </g>

              {/* Ngôi nhà nông trại mái đỏ (Classic Red Barn) */}
              <g transform="translate(615, 68)">
                <rect x="0" y="24" width="46" height="42" rx="3" fill="#dc2626" stroke="#7f1d1d" strokeWidth="2" />
                {/* Mái ngói đỏ viền trắng */}
                <polygon points="-6,24 23,2 52,24" fill="#ef4444" stroke="#ffffff" strokeWidth="3" />
                {/* Cửa chữ X trắng nông trại */}
                <rect x="13" y="38" width="20" height="28" fill="#ffffff" stroke="#7f1d1d" strokeWidth="1.5" />
                <rect x="15" y="40" width="16" height="24" fill="#dc2626" />
                <line x1="15" y1="40" x2="31" y2="64" stroke="#ffffff" strokeWidth="2.5" />
                <line x1="31" y1="40" x2="15" y2="64" stroke="#ffffff" strokeWidth="2.5" />
                {/* Cửa sổ gác mái vuông */}
                <rect x="18" y="14" width="10" height="10" fill="#ffffff" stroke="#7f1d1d" strokeWidth="1.2" />
                <line x1="23" y1="14" x2="23" y2="24" stroke="#7f1d1d" strokeWidth="1.2" />
                <line x1="18" y1="19" x2="28" y2="19" stroke="#7f1d1d" strokeWidth="1.2" />
              </g>

              {/* Các khóm cây xanh tán tròn Ghibli */}
              <g>
                <circle cx="585" cy="115" r="18" fill="#15803d" />
                <circle cx="575" cy="120" r="14" fill="#22c55e" />
                <circle cx="675" cy="118" r="14" fill="#16a34a" />
                <circle cx="780" cy="115" r="16" fill="#15803d" />
              </g>
            </svg>
          </div>

          {/* Tiêu đề & Logo Ba Lô */}
          <div className="pt-inv-header-content">
            <div className="pt-inv-header-title-wrap">
              <div className="pt-inv-header-icon">
                <Icon3dHeaderBackpack size={62} />
              </div>
              <div className="pt-inv-header-text">
                <h1 className="pt-inv-title">TÚI ĐỒ</h1>
                <p className="pt-inv-subtitle">Quản lý các vật phẩm bạn đang sở hữu</p>
              </div>
            </div>

            {/* Nút Đóng X Tròn Xanh Glossy */}
            <button
              type="button"
              className="pt-inv-close-btn"
              onClick={() => {
                farmAudio?.playPop?.();
                onClose?.();
              }}
              aria-label="Đóng"
            >
              <Icon3dCloseButton size={38} />
            </button>
          </div>
        </div>

        {/* === THANH CÔNG CỤ: TABS DANH MỤC + SEARCH + SORT === */}
        <div className="pt-inv-toolbar">
          <div className="pt-inv-tabs">
            <button
              type="button"
              className={`pt-tab-btn ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => {
                farmAudio?.playPop?.();
                setActiveCategory('all');
              }}
            >
              <Icon3dCategoryAll size={18} active={activeCategory === 'all'} />
              <span>Tất Cả</span>
            </button>

            <button
              type="button"
              className={`pt-tab-btn ${activeCategory === 'tools' ? 'active' : ''}`}
              onClick={() => {
                farmAudio?.playPop?.();
                setActiveCategory('tools');
              }}
            >
              <Icon3dCategoryTools size={18} />
              <span>Công Cụ</span>
            </button>

            <button
              type="button"
              className={`pt-tab-btn ${activeCategory === 'seeds' ? 'active' : ''}`}
              onClick={() => {
                farmAudio?.playPop?.();
                setActiveCategory('seeds');
              }}
            >
              <Icon3dCategorySeeds size={18} />
              <span>Hạt Giống</span>
            </button>

            <button
              type="button"
              className={`pt-tab-btn ${activeCategory === 'furniture' ? 'active' : ''}`}
              onClick={() => {
                farmAudio?.playPop?.();
                setActiveCategory('furniture');
              }}
            >
              <Icon3dCategoryFurniture size={18} />
              <span>Nội Thất</span>
            </button>

            <button
              type="button"
              className={`pt-tab-btn ${activeCategory === 'clothing' ? 'active' : ''}`}
              onClick={() => {
                farmAudio?.playPop?.();
                setActiveCategory('clothing');
              }}
            >
              <Icon3dCategoryClothing size={18} />
              <span>Trang Phục</span>
            </button>

            <button
              type="button"
              className={`pt-tab-btn ${activeCategory === 'items' ? 'active' : ''}`}
              onClick={() => {
                farmAudio?.playPop?.();
                setActiveCategory('items');
              }}
            >
              <Icon3dCategoryItems size={18} />
              <span>Vật Phẩm</span>
            </button>
          </div>

          {/* Ô Tìm kiếm & Bộ sắp xếp */}
          <div className="pt-inv-actions-bar">
            <div className="pt-inv-search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Tìm kiếm vật phẩm..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="pt-inv-sort">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.5" strokeLinecap="round">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="8" y1="12" x2="20" y2="12" />
                <line x1="12" y1="18" x2="20" y2="18" />
              </svg>
              <span>Mới nhất</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
        </div>

        {/* === THÂN KHO ĐỒ: CHIA 2 CỘT (LƯỚI ITEM + BẢNG CHI TIẾT) === */}
        <div className="pt-inv-body">
          {/* Cột Trái: Lưới 5 cột x 3 hàng các ô vật phẩm */}
          <div className="pt-inv-grid-container">
            <div className="pt-inv-grid">
              {filteredItems.map(item => {
                const isSelected = item.id === selectedItem?.id;
                const ItemIcon = item.IconComponent;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`pt-inv-slot ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      farmAudio?.playPop?.();
                      setSelectedItemId(item.id);
                    }}
                  >
                    <div className="pt-slot-icon">
                      <ItemIcon size={58} />
                    </div>
                    {item.count > 0 && (
                      <span className="pt-slot-badge">{item.count}</span>
                    )}
                  </button>
                );
              })}
              {/* Nếu danh sách ít hơn 15 ô, thêm các slot rỗng để giữ khung lưới đẹp mắt */}
              {Array.from({ length: Math.max(0, 15 - filteredItems.length) }).map((_, i) => (
                <div key={`empty-${i}`} className="pt-inv-slot empty" />
              ))}
            </div>
          </div>

          {/* Cột Phải: Thẻ Chi Tiết Vật Phẩm (Detail Card) */}
          <div className="pt-inv-detail-card">
            {selectedItem ? (
              <>
                {/* Hộp xem trước 3D lớn nền xanh ngọc pastel */}
                <div className="pt-detail-preview">
                  <selectedItem.IconComponent size={120} />
                </div>

                {/* Tiêu đề & Danh mục */}
                <div className="pt-detail-info">
                  <h2 className="pt-detail-title">{selectedItem.name}</h2>
                  <div className="pt-detail-category-badge">
                    <Icon3dCategoryTools size={14} />
                    <span>{selectedItem.categoryLabel}</span>
                  </div>
                  <p className="pt-detail-desc">{selectedItem.desc}</p>
                </div>

                {/* Số lượng hiện có */}
                <div className="pt-detail-count-row">
                  <div className="pt-detail-count-label">
                    <Icon3dCategoryItems size={18} />
                    <span>Số lượng hiện có</span>
                  </div>
                  <div className="pt-detail-count-badge">
                    {selectedItem.count}
                  </div>
                </div>

                {/* Cặp nút hành động: SỬ DỤNG (Vàng Golden) + BỎ (Xám nhạt) */}
                <div className="pt-detail-actions">
                  <button
                    type="button"
                    className="pt-btn-use"
                    onClick={() => {
                      farmAudio?.playSuccess?.();
                      onUseItem?.(selectedItem);
                    }}
                  >
                    <div className="pt-btn-icon">
                      <selectedItem.IconComponent size={24} />
                    </div>
                    <span>{selectedItem.actionLabel}</span>
                  </button>

                  <button
                    type="button"
                    className="pt-btn-drop"
                    onClick={() => {
                      farmAudio?.playPop?.();
                      onDropItem?.(selectedItem);
                    }}
                  >
                    <Icon3dTrashCan size={20} />
                    <span>BỎ</span>
                  </button>
                </div>

                {/* Mở Tiệm Thời Trang & Tủ Đồ Play Together */}
                {selectedItem.category === 'clothing' && (
                  <button
                    type="button"
                    className="pt-btn-open-fashion"
                    onClick={() => {
                      farmAudio?.playPop?.();
                      onClose?.();
                      onOpenFashion?.();
                    }}
                    title="Mở Tiệm & Tủ Đồ Thời Trang Play Together với thử đồ 3D trực tiếp"
                  >
                    <Icon3dFashionLogo size={24} />
                    <span>Mở Tủ Đồ Thời Trang 3D</span>
                  </button>
                )}
              </>
            ) : (
              <div className="pt-detail-empty">
                <p>Chọn vật phẩm để xem chi tiết</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
