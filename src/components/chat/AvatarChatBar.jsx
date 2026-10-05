import React, { useState, useRef, useEffect } from 'react';
import './AvatarChatBar.css';

const QUICK_CHAT_CATEGORIES = [
  {
    category: '🌾 Nông Trại & Chợ Quê',
    items: [
      { text: 'Chào cả nhà Làng Bình Minh!', emote: 'smile' },
      { text: 'Vườn mình vừa chín, qua chơi nhé!', emote: 'wheat' },
      { text: 'Ai mua nông sản sạch không nè?', emote: 'wheat' },
      { text: 'Mùa màng bội thu quá bà con ơi!', emote: 'party' },
      { text: 'Đang chăm chỉ tưới nước cho cây 💧', emote: 'wheat' },
    ],
  },
  {
    category: '🎣 Giao Lưu & Dạo Phố',
    items: [
      { text: 'Ai đi câu cá Hồ Pha Lê không?', emote: 'fish' },
      { text: 'Vào Hội Quán làm ván cờ đi!', emote: 'party' },
      { text: 'Cho mình làm quen kết bạn với!', emote: 'heart' },
      { text: 'Thời tiết hôm nay đẹp thật!', emote: 'smile' },
      { text: 'Đi dạo biển ngắm hoàng hôn không?', emote: 'smile' },
    ],
  },
  {
    category: '💬 Cảm Xúc Avatar',
    items: [
      { text: 'Haha vui quá xá!', emote: 'smile' },
      { text: 'Cảm ơn bạn nhiều nha! <3', emote: 'heart' },
      { text: 'Đỉnh của chóp luôn!', emote: 'like' },
      { text: 'Chờ mình một chút nhé!', emote: 'smile' },
      { text: 'Hẹn gặp lại cả nhà sau nha!', emote: 'smile' },
    ],
  },
];

const AVATAR_EMOJIS = [
  { id: 'smile', label: 'Cười tươi', icon: '😄' },
  { id: 'heart', label: 'Thả tim', icon: '💖' },
  { id: 'like', label: 'Thích (Like)', icon: '👍' },
  { id: 'party', label: 'Ăn mừng', icon: '🎉' },
  { id: 'trophy', label: 'Cúp vàng', icon: '🏆' },
  { id: 'sad', label: 'Khóc ròng', icon: '😭' },
  { id: 'wheat', label: 'Bông lúa', icon: '🌾' },
  { id: 'fish', label: 'Con cá', icon: '🐟' },
];

export function AvatarChatBar({ onSendChat, disabled = false }) {
  const [inputText, setInputText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);
  const [emojiMenuOpen, setEmojiMenuOpen] = useState(false);
  const inputRef = useRef(null);

  // Phím tắt bàn phím [Enter] để mở chat và gõ ngay lập tức
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (disabled) return;
      // Tránh cướp focus nếu đang gõ ở input khác
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.key === 'Enter') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsFocused(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    const clean = inputText.trim();
    if (!clean) return;

    onSendChat?.(clean, null);
    setInputText('');
    setQuickMenuOpen(false);
    setEmojiMenuOpen(false);
    inputRef.current?.blur();
    setIsFocused(false);
  };

  const handleSelectQuickChat = (item) => {
    onSendChat?.(item.text, item.emote);
    setQuickMenuOpen(false);
    setEmojiMenuOpen(false);
    inputRef.current?.blur();
    setIsFocused(false);
  };

  const handleSelectEmoji = (emoji) => {
    onSendChat?.('', emoji.id);
    setQuickMenuOpen(false);
    setEmojiMenuOpen(false);
    inputRef.current?.blur();
    setIsFocused(false);
  };

  return (
    <div className={`avatar-chat-bar-container ${isFocused ? 'focused' : ''}`}>
      {/* 1. Popover Bảng Chat Nhanh Phong Cách Avatar */}
      {quickMenuOpen && (
        <div className="avatar-quick-chat-popover" role="dialog" aria-label="Bảng câu nói nhanh">
          <div className="popover-header">
            <span>💬 CÂU NÓI NHANH AVATAR</span>
            <button type="button" className="close-btn" onClick={() => setQuickMenuOpen(false)}>✕</button>
          </div>
          <div className="popover-scroll-body">
            {QUICK_CHAT_CATEGORIES.map((cat, cIdx) => (
              <div key={cIdx} className="chat-cat-group">
                <div className="cat-title">{cat.category}</div>
                <div className="cat-items-list">
                  {cat.items.map((item, iIdx) => (
                    <button
                      key={iIdx}
                      type="button"
                      className="quick-chat-item-btn"
                      onClick={() => handleSelectQuickChat(item)}
                    >
                      {item.text}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Popover Bảng Biểu Cảm Emoji Chibi Avatar */}
      {emojiMenuOpen && (
        <div className="avatar-emoji-popover" role="dialog" aria-label="Bảng biểu cảm Chibi">
          <div className="popover-header">
            <span>😄 BIỂU CẢM CHIBI</span>
            <button type="button" className="close-btn" onClick={() => setEmojiMenuOpen(false)}>✕</button>
          </div>
          <div className="emoji-grid">
            {AVATAR_EMOJIS.map((emo) => (
              <button
                key={emo.id}
                type="button"
                className="emoji-btn"
                title={emo.label}
                onClick={() => handleSelectEmoji(emo)}
              >
                <span className="emoji-icon">{emo.icon}</span>
                <span className="emoji-label">{emo.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Thanh nhập Chat Pill chính */}
      <form className="avatar-chat-form" onSubmit={handleSubmit}>
        {/* Nút mở Chat Nhanh */}
        <button
          type="button"
          className={`chat-addon-btn ${quickMenuOpen ? 'active' : ''}`}
          title="Chọn câu chat nhanh (Avatar)"
          onClick={() => {
            setQuickMenuOpen(v => !v);
            setEmojiMenuOpen(false);
          }}
        >
          💬
        </button>

        {/* Nút mở Emoji Chibi */}
        <button
          type="button"
          className={`chat-addon-btn ${emojiMenuOpen ? 'active' : ''}`}
          title="Thả biểu cảm (Emoji Chibi)"
          onClick={() => {
            setEmojiMenuOpen(v => !v);
            setQuickMenuOpen(false);
          }}
        >
          😄
        </button>

        {/* Ô nhập văn bản */}
        <input
          ref={inputRef}
          type="text"
          className="avatar-chat-input"
          placeholder="Nhấn Enter để chat hoặc chọn câu nói..."
          maxLength={60}
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            setQuickMenuOpen(false);
            setEmojiMenuOpen(false);
          }}
          onBlur={() => {
            // Delay nhỏ để tránh đóng popover khi bấm các nút
            setTimeout(() => setIsFocused(false), 200);
          }}
        />

        {/* Nút Gửi */}
        <button
          type="submit"
          className="chat-send-btn"
          title="Gửi tin nhắn"
          disabled={!inputText.trim()}
        >
          <span>Gửi</span>
          <i>➤</i>
        </button>
      </form>
    </div>
  );
}
