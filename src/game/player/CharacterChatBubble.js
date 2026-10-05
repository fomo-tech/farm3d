import { Matrix, Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import './CharacterChatBubble.css';

/**
 * Bản đồ ánh xạ mã emote thành emoji chuẩn TeaMobi Avatar siêu sống động
 */
const EMOTE_MAP = {
  smile: '😄',
  happy: '😄',
  ':)': '😄',
  ':d': '😄',
  heart: '💖',
  love: '💖',
  '<3': '💖',
  like: '👍',
  thumbsup: '👍',
  '(y)': '👍',
  party: '🎉',
  celebrate: '🎉',
  trophy: '🏆',
  top1: '🏆',
  sad: '😭',
  cry: '😭',
  ':(': '😭',
  't_t': '😭',
  wheat: '🌾',
  nongsan: '🌾',
  farm: '🌾',
  fish: '🐟',
  cauca: '🐟',
  wave: '👋',
  hello: '👋',
  hi: '👋',
};

function resolveEmoteIcon(emote) {
  if (!emote) return null;
  const key = String(emote).trim().toLowerCase();
  return EMOTE_MAP[key] || emote;
}

/**
 * Hiển thị Bong bóng thoại Chat trên đầu nhân vật phong cách game Avatar (TeaMobi).
 * 
 * Ưu điểm vượt trội:
 * - 100% chữ native vector siêu nét, tuyệt đối không bị mờ hay răng cưa (Zero Blur).
 * - Khung thoại chuẩn Avatar: nền trắng tinh, viền đen than đậm, đuôi nhọn chỉ thẳng đỉnh đầu.
 * - Triệt tiêu Double Chat: tự động khử lặp tin nhắn và dọn sạch bóng thoại cũ.
 * - Chuyển động mượt mà 60fps (GPU Translate3D, không trễ frame so với nhân vật).
 * 
 * @param {import('@babylonjs/core').Scene} scene 
 * @param {import('@babylonjs/core').TransformNode} targetRoot Node gốc của nhân vật
 * @param {object} options
 * @param {string} [options.text] Nội dung trò chuyện
 * @param {string} [options.emote] Mã biểu cảm (heart, smile, wheat, fish, like...)
 * @param {boolean} [options.isLocal] Là chính người chơi hay người chơi khác
 */
export function showCharacterChatBubble(scene, targetRoot, { text = '', emote = null, isLocal = false, senderName = '' }) {
  if (!scene || !targetRoot || (!text && !emote)) return;

  const cleanText = String(text || '').trim();
  const emoteIcon = resolveEmoteIcon(emote);
  if (!cleanText && !emoteIcon) return;

  // 1. KHỬ DOUBLE CHAT & CHẶN SPAM LẶP TIN NHẮN (Anti-Echo / Anti-Duplicate)
  const chatKey = `${cleanText}__${emoteIcon || ''}`;
  const now = Date.now();
  if (targetRoot._lastChatKey === chatKey && (now - (targetRoot._lastChatTime || 0)) < 1200) {
    return; // Bỏ qua nếu vừa hiển thị chính tin nhắn này trong 1.2 giây
  }
  targetRoot._lastChatKey = chatKey;
  targetRoot._lastChatTime = now;

  // Dọn dẹp bong bóng chat đang mở trước đó của nhân vật này
  if (targetRoot._activeChatBubble) {
    try {
      targetRoot._activeChatBubble.dispose();
    } catch (_) {}
    targetRoot._activeChatBubble = null;
  }

  // 2. Kiểm tra môi trường DOM để vẽ Screen-Projected HTML/CSS Bubble
  const canvas = scene.getEngine()?.getRenderingCanvas();
  const container = canvas?.parentElement;
  if (!container || typeof document === 'undefined') {
    return;
  }

  // 3. Tạo các phần tử DOM cho Khung Thoại Play Together Chuẩn Đẹp
  const anchorEl = document.createElement('div');
  anchorEl.className = 'avatar-speech-bubble-anchor';

  const scalerEl = document.createElement('div');
  scalerEl.className = 'avatar-speech-bubble-scaler';

  const bubbleEl = document.createElement('div');
  const isEmoteOnly = !cleanText && Boolean(emoteIcon);
  bubbleEl.className = `avatar-speech-bubble ${isLocal ? 'avatar-speech-bubble--local' : 'avatar-speech-bubble--remote'} ${isEmoteOnly ? 'avatar-speech-bubble--emote-only' : ''}`;

  if (!isLocal && senderName && !isEmoteOnly) {
    const senderBadge = document.createElement('div');
    senderBadge.className = 'avatar-bubble-sender';
    senderBadge.textContent = senderName;
    bubbleEl.appendChild(senderBadge);
  }

  // Thân nội dung chat
  const bodyEl = document.createElement('div');
  bodyEl.className = 'avatar-bubble-body';

  if (isEmoteOnly) {
    const emoteSpan = document.createElement('span');
    emoteSpan.className = 'avatar-bubble-big-emote';
    emoteSpan.textContent = emoteIcon;
    bodyEl.appendChild(emoteSpan);
  } else {
    if (emoteIcon) {
      const emoteSpan = document.createElement('span');
      emoteSpan.className = 'avatar-bubble-emote';
      emoteSpan.textContent = emoteIcon;
      bodyEl.appendChild(emoteSpan);
    }
    const textSpan = document.createElement('span');
    textSpan.className = 'avatar-bubble-text';
    textSpan.textContent = cleanText;
    bodyEl.appendChild(textSpan);
  }
  bubbleEl.appendChild(bodyEl);
  scalerEl.appendChild(bubbleEl);
  anchorEl.appendChild(scalerEl);
  container.appendChild(anchorEl);

  // 4. Theo dõi toạ độ 3D và chiếu lên màn hình 2D mượt mà
  const anchorOffset = new Vector3(0, 2.75, 0); // Khoảng cách chuẩn, nằm phía trên tên nhân vật, không che mặt
  let isDisposed = false;
  let currentScale = 1.0;

  const updateScreenPosition = () => {
    if (isDisposed) return;
    const camera = scene.activeCamera;
    if (!camera || !targetRoot || (targetRoot.isDisposed && targetRoot.isDisposed())) {
      cleanUp();
      return;
    }

    // Kiểm tra nhân vật có đang hiển thị không
    if (targetRoot.isEnabled && !targetRoot.isEnabled()) {
      anchorEl.hidden = true;
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const worldMatrix = targetRoot.computeWorldMatrix ? targetRoot.computeWorldMatrix(true) : Matrix.Identity();
    const worldPos = Vector3.TransformCoordinates(anchorOffset, worldMatrix);

    // Culling: Nếu nhân vật quá xa (> 75m), ẩn bong bóng
    if (!isLocal && Vector3.DistanceSquared(camera.globalPosition, worldPos) > 75 * 75) {
      anchorEl.hidden = true;
      return;
    }

    // Chiếu toạ độ 3D thành toạ độ màn hình 2D
    const point = Vector3.Project(
      worldPos,
      Matrix.Identity(),
      scene.getTransformMatrix(),
      camera.viewport.toGlobal(rect.width, rect.height)
    );

    // Kiểm tra nằm ngoài màn hình hoặc ở phía sau camera
    const isOffScreen = !Number.isFinite(point.x) || point.z < 0 || point.z > 1
      || point.x < -160 || point.x > rect.width + 160
      || point.y < -160 || point.y > rect.height + 160;

    if (isOffScreen) {
      anchorEl.hidden = true;
      return;
    }

    anchorEl.hidden = false;

    // Tính toán độ co giãn scale tự nhiên theo khoảng cách camera (3D depth perception)
    const depth = Math.abs(Vector3.TransformCoordinates(worldPos, camera.getViewMatrix()).z);
    const targetScale = Math.max(0.78, Math.min(1.22, 12.5 / Math.max(3.5, depth)));
    currentScale = targetScale;

    const screenX = Math.round(rect.left + point.x);
    const screenY = Math.round(rect.top + point.y);

    anchorEl.style.left = `${screenX}px`;
    anchorEl.style.top = `${screenY}px`;
    scalerEl.style.transform = `scale(${currentScale.toFixed(3)})`;
  };

  // Cập nhật vị trí ngay lập tức ở frame đầu tiên
  updateScreenPosition();

  // Đăng ký render observable: đồng bộ khung hình hoàn hảo trước khi vẽ
  const observer = scene.onBeforeRenderObservable.add(updateScreenPosition);

  // 5. Quản lý vòng đời (Thời gian hiển thị & Mờ dần thoát)
  const displayDuration = Math.max(4000, Math.min(7500, 3500 + cleanText.length * 75));
  const fadeTimeout = setTimeout(() => {
    if (!isDisposed && bubbleEl) {
      bubbleEl.classList.add('fade-out');
    }
  }, displayDuration - 380);

  const cleanUp = () => {
    if (isDisposed) return;
    isDisposed = true;
    clearTimeout(fadeTimeout);
    clearTimeout(removeTimeout);
    scene.onAfterRenderObservable.remove(observer);
    if (targetRoot._activeChatBubble === bubbleHandle) {
      targetRoot._activeChatBubble = null;
    }
    anchorEl.remove();
  };

  const removeTimeout = setTimeout(cleanUp, displayDuration);

  const bubbleHandle = {
    dispose: cleanUp,
  };

  targetRoot._activeChatBubble = bubbleHandle;
  scene.onDisposeObservable.addOnce(cleanUp);
}
