import { useState } from 'react';

const GAMES = {
  'tai-xiu': { title: 'Tài Xỉu', choices: [['tai', 'Tài · 11–18'], ['xiu', 'Xỉu · 3–10']], rule: 'Ba xúc xắc. Đúng cửa nhận 2 lần tiền cược.' },
  'bau-cua': { title: 'Lắc Bầu Cua', choices: [['bau', 'Bầu'], ['cua', 'Cua'], ['tom', 'Tôm'], ['ca', 'Cá'], ['ga', 'Gà'], ['nai', 'Nai']], rule: 'Ba mặt hình. Trúng 1, 2 hoặc 3 mặt nhận lần lượt 2, 3 hoặc 4 lần tiền cược.' },
};

export function CasinoGames({ state, now, coins, connected, inside, pending, message, onBet }) {
  const [game, setGame] = useState('tai-xiu');
  const [choice, setChoice] = useState('tai');
  const [amount, setAmount] = useState(10);
  const room = state?.[game];
  const activeBet = pending?.[room?.id];
  const seconds = Math.max(0, Math.ceil(((room?.closesAt || 0) - now * 1000) / 1000));
  const canBet = connected && inside && room?.phase === 'open' && seconds > 0 && !activeBet && coins >= amount;
  const result = room?.result;
  return <div className="casino-online">
    <div className="casino-tabs">{Object.entries(GAMES).map(([id, item]) => <button type="button" key={id} className={game === id ? 'active' : ''} onClick={() => { setGame(id); setChoice(GAMES[id].choices[0][0]); }}>{item.title}</button>)}</div>
    <div className="casino-round"><strong>{GAMES[game].title}</strong><span>{room?.phase === 'open' ? `Còn ${seconds} giây đặt cược` : room?.phase === 'settling' ? 'Đang công bố kết quả…' : room?.phase === 'result' ? 'Kết quả ván vừa rồi' : 'Đang kết nối bàn chơi…'}</span><small>{room?.playerCount || 0} người tham gia ván</small></div>
    {result && <div className="casino-dice-result">{game === 'tai-xiu' ? `${result.dice.join(' · ')} = ${result.total} · ${result.winner === 'tai' ? 'Tài' : 'Xỉu'}` : result.symbols.map(symbol => GAMES['bau-cua'].choices.find(([id]) => id === symbol)?.[1] || symbol).join(' · ')}</div>}
    <p>{GAMES[game].rule}</p>
    <div className="casino-choices">{GAMES[game].choices.map(([id, label]) => <button type="button" key={id} className={choice === id ? 'active' : ''} onClick={() => setChoice(id)} aria-pressed={choice === id}>{label}</button>)}</div>
    <div className="casino-stakes">{[10, 50, 100].map(value => <button type="button" key={value} className={amount === value ? 'active' : ''} onClick={() => setAmount(value)} aria-pressed={amount === value}>{value} xu</button>)}</div>
    <button type="button" className="casino-place-bet" disabled={!canBet} onClick={() => onBet(game, choice, amount, room.id)}>{!inside ? 'Vào hội quán để chơi' : activeBet ? `Đã cược ${activeBet.amount} xu · chờ kết quả` : !connected ? 'Chờ kết nối server' : coins < amount ? 'Không đủ xu' : 'Đặt cược online'}</button>
    {message && <div className="casino-message" role="status">{message}</div>}
    <small>Chỉ dùng xu kiếm trong game. Không nạp, rút hoặc quy đổi tiền thật.</small>
  </div>;
}
