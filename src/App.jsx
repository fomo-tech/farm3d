import { useEffect, useRef, useState } from 'react';
import { FarmWorld } from './game/world/FarmWorld.js';
import { loadWorldSession, saveWorldSession } from './game/network/WorldSession.js';
import { GameClient } from './game/network/GameClient.js';
import { DEFAULT_VILLAGES, keepAvailableVillages } from './game/data/villages.js';
import { initialLivestockState, livestockSummary } from './game/livestock/LivestockStore.js';
import {
  barnCapacity,
  canFillOrder,
  CROPS,
  EXPANSIONS,
  inventoryCount,
  isFeatureLocked,
  levelCeiling,
  levelFloor,
  loadProgress,
  ONBOARDING_STEPS,
  ORDERS,
  QUESTS,
  RECIPES,
} from './game/economy/GameProgress.js';
import { WORLD_LAYOUT } from './game/world/worldLayout.js';
import { WORLD_VILLAGES } from '../shared/villageLayout.js';
import { CharacterCreationModal } from './components/CharacterArrivalModal.jsx';
import { LandMarket } from './components/LandMarket.jsx';
import { ElderDialogueModal } from './components/ElderDialogueModal.jsx';
import { OnboardingHUD } from './components/OnboardingHUD.jsx';
import { FarmGuideModal } from './components/FarmGuideModal.jsx';
import { GraduationModal } from './components/GraduationModal.jsx';
import { RoadsideShopModal } from './components/RoadsideShopModal.jsx';
import { FloatingPlotBubble } from './components/FloatingPlotBubble.jsx';
import { OrderBulletinBoard } from './components/OrderBulletinBoard.jsx';
import { FloatingRewards, emitReward } from './components/FloatingRewards.jsx';
import { farmAudio } from './game/audio/FarmAudioSystem.js';
import {
  Icon3dHand,
  Icon3dHoe,
  Icon3dSeeds,
  Icon3dWateringCan,
  Icon3dBasket,
  Icon3dGoldCoin,
  Icon3dGem,
  Icon3dCarrot,
  Icon3dMap,
  Icon3dBackpack,
  Icon3dOrdersBox,
  Icon3dMarketStall,
  Icon3dQuestBook,
  Icon3dMill,
  Icon3dHammer,
  Icon3dShopCart,
  Icon3dWardrobe,
  Icon3dBike,
  Icon3dFriends,
  Icon3dGuideBook,
  Icon3dLock,
  Icon3dBell,
  Icon3dChicken,
  Icon3dCow,
  Icon3dCorn,
  Icon3dNonLa,
  Icon3dRiceSpike,
  Icon3dLotus,
  Icon3dCoast,
  Icon3dJump,
  Icon3dSprint,
  Icon3dDismount,
  Icon3dAudioOn,
  Icon3dAudioOff,
  Icon3dCrown,
  Icon3dShirt,
  Icon3dCap,
  Icon3dFlower,
  Icon3dWalk,
  Icon3dCub50,
  Icon3dTractor,
  Icon3dDawn,
  Icon3dSun,
  Icon3dSunset,
  Icon3dMoon,
  Icon3dSpring,
  Icon3dSummer,
  Icon3dAutumn,
  Icon3dWinter,
  Icon3dEgg,
  Icon3dMilk,
  Icon3dFlourBowl,
  Icon3dCheese,
  Icon3dJamJar,
  Icon3dCheck,
  Icon3dStar,
  Icon3dSprout,
  Icon3dBarn,
  Icon3dHouseCabin,
  Icon3dDice,
  Icon3dModernCity,
} from './components/icons3d/GameIcons3D.jsx';

const destinations = [
  ...WORLD_LAYOUT.villages.map(village => ({ id: village.id, label: village.name, icon: <Icon3dHouseCabin size={34} />, x: village.gate.x, z: village.gate.z - 4, description: '24 lô đất · cổng làng trên bản đồ chung' })),
  { id: 'farm', label: 'Nông trại', icon: <Icon3dRiceSpike size={34} />, x: WORLD_LAYOUT.spawn.x, z: WORLD_LAYOUT.spawn.z, description: 'Ruộng, chuồng và xưởng' },
  { id: 'town', label: 'Trung tâm', icon: <Icon3dModernCity size={34} />, x: WORLD_LAYOUT.zones.city.x, z: WORLD_LAYOUT.zones.city.z + 18, description: 'Cửa hàng và quảng trường' },
  { id: 'lake', label: 'Đầm Sen', icon: <Icon3dLotus size={34} />, x: WORLD_LAYOUT.zones.lake.x - 39, z: WORLD_LAYOUT.zones.lake.z, description: 'Cầu tre và bến câu' },
  { id: 'beach', label: 'Làng chài', icon: <Icon3dCoast size={34} />, x: WORLD_LAYOUT.zones.beach.x, z: WORLD_LAYOUT.zones.beach.z - 20, description: 'Bãi biển và hải đăng' },
];
const cityDistrictIcons = {
  shopping: <Icon3dShopCart size={20} />, entertainment: <Icon3dDice size={20} />,
  services: <Icon3dModernCity size={20} />, community: <Icon3dNonLa size={20} />,
};
const cityDestinations = WORLD_LAYOUT.cityDistricts.filter(district => district.id !== 'civic');
const outfits = [
  { id: 'starter', name: 'Áo phông mộc mạc', icon: <Icon3dShirt />, color: '#f8fafc', cost: 0 },
  { id: 'farmer', name: 'Nông dân Bình Minh', icon: <Icon3dNonLa />, color: '#f1b445', cost: 100 },
  { id: 'rose', name: 'Hoa Hồng Dịu Dàng', icon: <Icon3dFlower />, color: '#e87994', cost: 180 },
  { id: 'lake', name: 'Hồ Pha Lê', icon: <Icon3dCap />, color: '#5f91c8', cost: 260 },
  { id: 'royal', name: 'Hoàng Gia', icon: <Icon3dCrown />, color: '#8a72b8', cost: 420 },
];
const vehicles = [
  { id: 'walk', name: 'Đi bộ', icon: <Icon3dWalk />, speed: 7, cost: 0 },
  { id: 'bike', name: 'Xe đạp', icon: <Icon3dBike size={28} />, speed: 10, cost: 350 },
  { id: 'scooter', name: 'Xe máy điện', icon: <Icon3dCub50 />, speed: 14, cost: 900 },
  { id: 'tractor', name: 'Máy kéo', icon: <Icon3dTractor />, speed: 18, cost: 2200 },
];
const timeIcons = [<Icon3dDawn key="dawn" />, <Icon3dSun key="sun" />, <Icon3dSunset key="sunset" />, <Icon3dMoon key="moon" />];
const seasonIcons = [<Icon3dSpring key="spring" />, <Icon3dSummer key="summer" />, <Icon3dAutumn key="autumn" />, <Icon3dWinter key="winter" />];
const cropIcons = { carrot: <Icon3dCarrot />, wheat: <Icon3dRiceSpike />, tomato: <Icon3dSprout />, strawberry: <Icon3dFlower /> };
const recipeIcons = { flour: <Icon3dFlourBowl />, cheese: <Icon3dCheese />, jam: <Icon3dJamJar /> };

function playerFarmTarget(farmId) {
  const farm = WORLD_LAYOUT.farms.find(item => item.id === farmId) || WORLD_LAYOUT.farms[0];
  return { x: farm.x + 6, z: farm.z - 4 };
}

export default function App() {
  const canvasRef = useRef(null);
  const worldRef = useRef(null);
  const joystickKnobRef = useRef(null);
  const progressRef = useRef(null);
  const gameClientRef = useRef(null);
  const pendingCharacterRef = useRef(null);
  const [status, setStatus] = useState('Đang khởi tạo thế giới…');
  const [session, setSession] = useState(loadWorldSession);
  const sessionRef = useRef(session);
  sessionRef.current = session;
  const initialLocationRef = useRef(null);
  const [animals, setAnimals] = useState(initialLivestockState);
  const [progress, setProgress] = useState(loadProgress);
  const [panel, setPanel] = useState(null);
  const [activeTool, setActiveTool] = useState('hand');
  const [boot, setBoot] = useState({ phase: 'loading', error: '' });
  const [debugEnabled, setDebugEnabled] = useState(() => new URLSearchParams(window.location.search).get('debug') === '1');
  const [debug, setDebug] = useState(null);
  const [clock, setClock] = useState(() => Math.floor(Date.now() / 1000));
  const [network, setNetwork] = useState({ connected: false, phase: 'connecting', online: 1, queued: 0, attempt: 0 });
  const [casinoResult, setCasinoResult] = useState('Chọn mức cược và thử vận may');
  const [venueMode, setVenueMode] = useState(null);
  const [worldRegion, setWorldRegion] = useState(null);
  const [villages, setVillages] = useState(DEFAULT_VILLAGES);
  const [villageRequired, setVillageRequired] = useState(false);
  const [landLots, setLandLots] = useState([]);
  const [landPending, setLandPending] = useState(false);
  const [focusedLand, setFocusedLand] = useState(null);

  // Onboarding, Guide & Social states
  const [dialogueOpen, setDialogueOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [celebrationOpen, setCelebrationOpen] = useState(false);
  const [roadsideOpen, setRoadsideOpen] = useState(false);
  const [graphicsQuality, setGraphicsQuality] = useState('ultra');
  const [cameraViewMode, setCameraViewMode] = useState('explore');
  const [targetDistance, setTargetDistance] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [currentFarmZone, setCurrentFarmZone] = useState(null);

  progressRef.current = progress;

  useEffect(() => {
    if (!canvasRef.current) return undefined;
    let world;
    try {
      window.__farmDebug?.mark('Creating Babylon world');
      setBoot({ phase: 'loading', error: '' });
      world = new FarmWorld(canvasRef.current, setStatus, {
        initialLocation: initialLocationRef.current,
        onReady: () => {
          window.__farmDebug?.ready();
          setBoot({ phase: 'ready', error: '' });
          if (worldRef.current) { worldRef.current.cameraViewMode = cameraViewMode; worldRef.current.resetCameraView(); }
          const outfit = outfits.find(item => item.id === progressRef.current?.outfit) || outfits[0];
          worldRef.current?.setPlayerOutfit(outfit.id, outfit.color);
          worldRef.current?.setPlayerVehicle(progressRef.current?.vehicle || 'walk');
          worldRef.current?.setPlayerHomeTier(progressRef.current?.homeTier || 1);
          worldRef.current?.setClock(clock);
          gameClientRef.current?.send({ type: 'resync' });
        },
        onFatalError: message => setBoot({ phase: 'error', error: message || 'WebGL không thể dựng thế giới 3D' }),
        getPlayerName: () => sessionRef.current.name,
        getVillageName: () => session.farmAddress?.villageName || 'Làng Hoa Mai',
        getPlayerFarmId: () => sessionRef.current.farmId,
        onLandInteract: farmId => { setFocusedLand(farmId); setPanel('land'); gameClientRef.current?.send({ type: 'resync' }); },
        getHomeTier: () => progressRef.current?.homeTier || 1,
        onFarmZoneChange: zone => setCurrentFarmZone(zone),
        onHelpNeighbor: neighborFarmId => {
          setStatus(`Đang gửi xác nhận tưới giúp ${neighborFarmId} tới server…`);
        },
        onMailbox: mailbox => {
          gameClientRef.current?.sendMailboxHeart(mailbox.id);
          emitReward({ text: '+1 Tim Khen Vườn', icon: '', color: '#ef4444' });
          farmAudio.playFanfare();
          setStatus(`Đã gửi lời khen đến nông trại của ${mailbox.owner}!`);
        },
        onNetworkAction: data => gameClientRef.current?.sendFarmAction(data),
        getCrop: () => progressRef.current?.selectedCrop || 'carrot',
        getUnlockedPlots: () => progressRef.current?.unlockedPlots ?? 0,
        getOutfitId: () => progressRef.current?.outfit || 'starter',
        getOutfitColor: () => (outfits.find(item => item.id === progressRef.current?.outfit) || outfits[0]).color,
        getVehicle: () => progressRef.current?.vehicle || 'walk',
        getPlayerSpeed: () => vehicles.find(vehicle => vehicle.id === progressRef.current?.vehicle)?.speed || 7,
        onVenue: venue => setPanel(venue === 'supplies' ? 'shop' : venue),
        onVenueState: (venue, label) => setVenueMode(venue ? { venue, label } : null),
        onRegionChange: setWorldRegion,
        onQualityChange: setGraphicsQuality,
        onNpcInteract: npcId => {
          if (npcId === 'village_elder') {
            setDialogueOpen(true);
          }
        },
        isTutorialCrop: () => progressRef.current?.onboarding?.step === ONBOARDING_STEPS.FIRST_PLANT,
        getFreeSeeds: () => progressRef.current?.freeSeeds || 0,
        onFarmAction: action => {
          const current = progressRef.current;
          if (action.type === 'plant' && current.coins < action.cost && !action.usedFreeSeed) return false;
          if (action.type === 'harvest' && inventoryCount(current) + action.amount > barnCapacity(current)) return false;
          return true;
        },
      });
      worldRef.current = world;
    } catch (error) {
      console.error('World initialization failed', error);
      window.__farmDebug?.report(error, 'WORLD INITIALIZATION');
      setBoot({ phase: 'error', error: error instanceof Error ? error.message : 'Không thể khởi tạo WebGL' });
    }
    return () => {
      world?.dispose();
      worldRef.current = null;
    };
  }, [session.channelId]);

  useEffect(() => {
    const client = new GameClient({
      onStatus: state => {
        if (state.connected === false) setLandPending(false);
        setNetwork(previous => ({ ...previous, ...state }));
        const phaseText = {
          connecting: 'Đang kết nối server…',
          syncing: 'Đã kết nối · đang đồng bộ dữ liệu MongoDB…',
          connected: state.queued ? `Đã kết nối · còn ${state.queued} thao tác chờ xác nhận` : `Đã kết nối ${session.channelId || 'thế giới'}`,
          reconnecting: `Mất kết nối · đang thử lại${state.attempt ? ` lần ${state.attempt}` : ''}`,
          offline: `Thiết bị đang offline · ${state.queued || 0} thao tác đang chờ`,
        };
        setStatus(phaseText[state.phase] || 'Đang kiểm tra kết nối…');
      },
      onState: (players, serverTime) => {
        setNetwork(previous => ({ ...previous, online: players.length + 1 }));
        worldRef.current?.syncRemotePlayers(players, serverTime);
      },
      onMoveAck: state => worldRef.current?.correctPlayerPosition(state),
      onFarmSync: farms => {
        worldRef.current?.applyRemoteFarmSync(farms);
      },
      onFarmScope: scope => {
        if (scope.lots) { setLandLots(scope.lots); worldRef.current?.setLandListings(scope.lots); }
        worldRef.current?.applyPublicFarmScope(scope.farms || [], scope.crops || {});
      },
      onFarmUpdate: update => {
        worldRef.current?.applyRemoteFarmAction(update);
        if (update.byPlayer) {
          setStatus(`${update.byPlayer} vừa thực hiện hành động tại nông trại ${update.farmId}!`);
        }
      },
      onMailboxNotice: notice => {
        if (notice.farmId === session.farmId) {
          emitReward({ text: `${notice.fromName} khen nông trại!`, icon: '', color: '#ec4899' });
          farmAudio.playFanfare();
          setStatus(`${notice.fromName} vừa ghé thăm và khen vườn của bạn!`);
        } else {
          setStatus(`${notice.fromName} vừa khen nông trại ${notice.farmId}`);
        }
      },
      onEmote: msg => {
        worldRef.current?.showEmote(msg.playerId, msg.emote);
        if (msg.fromName) {
          setStatus(`${msg.fromName} vừa gửi một biểu cảm!`);
        }
      },
      onVillages: list => setVillages(keepAvailableVillages(list)),
      onVillageRequired: () => setVillageRequired(true),
      onVillageError: message => {
        setVillageRequired(true);
        setStatus(`Lỗi: ${message}`);
      },
      onActionError: message => {
        setLandPending(false);
        worldRef.current?.farming?.clearPendingActions?.();
        setStatus(`Lỗi: ${message}`);
      },
      onAccountState: state => {
        if (state.result?.landPurchase) {
          const land = state.result.landPurchase;
          setLandPending(false);
          setSession(prev => { const next = { ...prev, farmId: land.farmId, villageId: land.villageId, channelId: 'world:main', farmAddress: { villageId: land.villageId, villageName: land.villageName, lot: land.lot } }; saveWorldSession(next); return next; });
          worldRef.current?.setPlayerFarmId(land.farmId);
          setPanel(null);
          setStatus(`Đã mua ${land.villageName} · Lô ${land.lot}. Đất đứng tên ${sessionRef.current.name}.`);
        }
        if (state.progress) {
          const previousStep = progressRef.current?.onboarding?.step;
          setProgress(state.progress);
          progressRef.current = state.progress;
          worldRef.current?.setPlayerVehicle(state.progress.vehicle || 'walk');
          worldRef.current?.setPlayerHomeTier(state.progress.homeTier || 1);
          const serverOutfit = outfits.find(item => item.id === state.progress.outfit) || outfits[0];
          worldRef.current?.setPlayerOutfit(serverOutfit.id, serverOutfit.color);
          worldRef.current?.refreshFarm?.();
          if ([ONBOARDING_STEPS.EXPLAIN_SYSTEMS, ONBOARDING_STEPS.CLAIM_REWARD].includes(state.progress.onboarding?.step) && state.progress.onboarding.step !== previousStep) {
            window.setTimeout(() => setDialogueOpen(true), 250);
          }
        }
        if (state.livestock) setAnimals(state.livestock);
        if (state.position?.villageId === session.villageId) worldRef.current?.restorePlayerPosition(state.position);
        if (state.sessionToken && state.sessionToken !== session.sessionToken) {
          setSession(previous => {
            const updated = { ...previous, sessionToken: state.sessionToken };
            saveWorldSession(updated);
            return updated;
          });
        }
        if (state.result?.playerRoll) {
          const { playerRoll, houseRoll, reward, bet } = state.result;
          setCasinoResult(`Bạn ${playerRoll} · Nhà ${houseRoll} · ${reward > bet ? `thắng +${reward - bet} xu` : reward === bet ? 'hòa' : `thua ${bet} xu`}`);
        }
      },
      onWelcome: welcome => {
        if (!welcome.farmId) {
          initialLocationRef.current = welcome.spawn;
          setVillageRequired(false);
          worldRef.current?.setPlayerFarmId(null, welcome.spawn);
          setSession(prev => { const next = { ...prev, farmId: null, villageId: welcome.villageId, channelId: welcome.channelId, farmAddress: null }; saveWorldSession(next); return next; });
          setStatus('Bạn chưa sở hữu đất. Mở Mua đất để chọn lô và xem giá.');
        }
        if (welcome.farmId) {
          initialLocationRef.current = welcome.spawn;
          const isDifferentFarm = welcome.farmId !== session.farmId;
          const profileChanged = isDifferentFarm
            || welcome.villageId !== session.villageId
            || welcome.channelId !== session.channelId
            || welcome.villageName !== session.farmAddress?.villageName
            || welcome.lot !== session.farmAddress?.lot;
          if (profileChanged) {
            setSession(prev => {
              const updated = {
                ...prev,
                farmId: welcome.farmId,
                villageId: welcome.villageId,
                channelId: welcome.channelId,
                farmAddress: {
                  ...prev.farmAddress,
                  villageId: welcome.villageId,
                  villageName: welcome.villageName,
                  lot: welcome.lot,
                },
              };
              saveWorldSession(updated);
              return updated;
            });
          }
          setVillageRequired(false);
          worldRef.current?.setServerFarmLayout(welcome.farmLayout);
          worldRef.current?.setVillageName(welcome.villageName);
          worldRef.current?.setPlayerFarmId(welcome.farmId, welcome.spawn);
          setStatus(`${welcome.villageName} · bạn quản lý Nông trại Lô ${welcome.lot}!`);
          if (pendingCharacterRef.current) {
            const character = pendingCharacterRef.current;
            pendingCharacterRef.current = null;
            client.sendGameAction('character_create', { name: character.name, outfit: character.outfit });
          }
        }
      },
    });
    gameClientRef.current = client;
    client.connect(session);
    const timer = window.setInterval(() => {
      const state = worldRef.current?.getPlayerState();
      if (state) client.sendPosition(state);
    }, 100);
    return () => {
      window.clearInterval(timer);
      client.disconnect();
      gameClientRef.current = null;
    };
  }, [session.playerId, session.villageId]);

  useEffect(() => {
    if (gameClientRef.current) gameClientRef.current.profile = session;
  }, [session]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      setClock(now);
      worldRef.current?.setClock(now);
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Synchronize 3D Objective Marker & Live Distance Counter
  useEffect(() => {
    const syncObjective = () => {
      if (!worldRef.current) return;
      const current = progressRef.current;
      const onboarding = current?.onboarding;

      if (!onboarding || onboarding.completed || !onboarding.characterCreated) {
        worldRef.current.setObjective(null);
        setTargetDistance(null);
        return;
      }

      let target = null;
      if (!session.farmId) { worldRef.current.setObjective(null); setTargetDistance(null); return; }
      if (
        onboarding.step === ONBOARDING_STEPS.MEET_ELDER ||
        onboarding.step === ONBOARDING_STEPS.EXPLAIN_SYSTEMS ||
        onboarding.step === ONBOARDING_STEPS.CLAIM_REWARD
      ) {
        target = WORLD_LAYOUT.villageElder;
      } else if (onboarding.step === ONBOARDING_STEPS.FIRST_PLANT) {
        const myFarm = WORLD_LAYOUT.farms.find(f => f.id === session.farmId) || WORLD_LAYOUT.farms[0];
        target = { x: myFarm.x, y: 0, z: myFarm.z };
      }

      if (target) {
        const dist = worldRef.current.getDistanceTo(target.x, target.z);
        setTargetDistance(Math.round(dist * 10) / 10);
        worldRef.current.setObjective(target);
      } else {
        worldRef.current.setObjective(null);
        setTargetDistance(null);
      }
    };

    syncObjective();
    const interval = window.setInterval(syncObjective, 250);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleGlobalKeys = event => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      if (event.code === 'F3') {
        event.preventDefault();
        setDebugEnabled(value => !value);
      } else if (event.code === 'KeyM') {
        event.preventDefault();
        setPanel(prev => (prev === 'map' ? null : 'map'));
      } else if (event.code === 'KeyB' || event.code === 'KeyI') {
        event.preventDefault();
        setPanel(prev => (prev === 'inventory' ? null : 'inventory'));
      } else if (event.code === 'KeyO') {
        event.preventDefault();
        setPanel(prev => (prev === 'orders' ? null : 'orders'));
      } else if (event.code === 'KeyQ') {
        event.preventDefault();
        setPanel(prev => (prev === 'quests' ? null : 'quests'));
      }
    };
    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, []);

  useEffect(() => {
    if (!debugEnabled) return undefined;
    const refresh = () => setDebug(worldRef.current?.getDebugState() || null);
    refresh();
    const timer = window.setInterval(refresh, 300);
    return () => window.clearInterval(timer);
  }, [debugEnabled, boot.phase]);

  const animalStatus = livestockSummary(animals);
  const chickenCount = animals.filter(animal => animal.species === 'chicken').length;
  const cowCount = animals.filter(animal => animal.species === 'cow').length;
  const feedAnimals = () => {
    gameClientRef.current?.sendGameAction('feed_animals');
    setStatus('Server đang xử lý thức ăn vật nuôi…');
  };
  const collectAnimals = () => {
    gameClientRef.current?.sendGameAction('collect_animals');
    setStatus('Server đang thu sản phẩm vật nuôi…');
  };
  const chooseCrop = crop => {
    if (progress.level < crop.level) { setStatus(`${crop.name} mở khóa ở cấp ${crop.level}`); return; }
    gameClientRef.current?.sendGameAction('select_crop', { crop: crop.id });
    selectTool('seed'); setPanel(null); setStatus(`Đã chọn hạt ${crop.name} · giá ${crop.seedCost} xu`);
  };
  const sellItem = (id, amount = 1) => {
    const crop = CROPS[id];
    if (!crop || progress.inventory[id] < amount) return;
    gameClientRef.current?.sendGameAction('sell_item', { id, amount });
    setStatus(`Server đang bán ${amount} ${crop.name}…`);
  };
  const deliverOrder = order => {
    if (!canFillOrder(progress, order) || progress.completedOrders.includes(order.id)) return;
    gameClientRef.current?.sendGameAction('deliver_order', { id: order.id });
    setStatus(`Server đang giao đơn “${order.title}”…`);
  };
  const claimQuest = quest => {
    if (progress.stats[quest.stat] < quest.goal || progress.claimedQuests.includes(quest.id)) return;
    gameClientRef.current?.sendGameAction('claim_quest', { id: quest.id });
    setStatus('Server đang kiểm tra nhiệm vụ…');
  };

  const handleTriggerEmote = (emoteChar) => {
    gameClientRef.current?.sendEmote(emoteChar);
    worldRef.current?.showEmote(session.playerId, emoteChar);
    farmAudio.playFanfare();
    setStatus(`Bạn thả biểu cảm: ${emoteChar}`);
  };

  const craft = recipe => {
    const ready = Object.entries(recipe.inputs).every(([id, count]) => progress.inventory[id] >= count);
    if (!ready) { setStatus(`Chưa đủ nguyên liệu làm ${recipe.name}`); return; }
    gameClientRef.current?.sendGameAction('craft', { id: recipe.id });
    setStatus(`Server đang chế biến ${recipe.name}…`);
  };
  const sellProduct = (id, price, name) => {
    if (!progress.inventory[id]) return;
    gameClientRef.current?.sendGameAction('sell_product', { id });
    setStatus(`Server đang bán ${name}…`);
  };
  const upgradeLand = () => {
    const expansion = EXPANSIONS.find(item => item.plots > progress.unlockedPlots);
    if (!expansion) { setStatus('Nông trại đã đạt tối đa 48 ô'); return; }
    if (progress.level < expansion.level || progress.coins < expansion.cost) { setStatus(`Cần cấp ${expansion.level} và ${expansion.cost} xu để mở rộng`); return; }
    gameClientRef.current?.sendGameAction('upgrade_land');
    setStatus('Server đang mở rộng đất…');
  };
  const upgradeBarn = () => {
    const cost = progress.barnLevel * 350;
    if (progress.coins < cost) { setStatus(`Cần ${cost} xu để nâng kho`); return; }
    gameClientRef.current?.sendGameAction('upgrade_barn');
    setStatus('Server đang nâng cấp kho…');
  };
  const upgradeHome = () => {
    const cost = 1800;
    const requiredLevel = 4;
    if ((progress.homeTier || 1) >= 2) { setStatus('Nhà của bạn đã đạt cấp hiện có cao nhất'); return; }
    if (progress.level < requiredLevel || progress.coins < cost) { setStatus(`Cần cấp ${requiredLevel} và ${cost} xu để mua Nhà Nông Trại Ấm Cúng`); return; }
    gameClientRef.current?.sendGameAction('upgrade_home');
    setStatus('Server đang nâng cấp nhà…');
  };
  const resetOrders = () => {
    if (progress.completedOrders.length < ORDERS.length || progress.coins < 25) return;
    gameClientRef.current?.sendGameAction('reset_orders');
    setStatus('Server đang làm mới đơn hàng…');
  };
  const travelTo = destination => {
    if (destination.id === 'farm' && !session.farmId) { setPanel('land'); setStatus('Bạn cần mua một lô đất trước.'); return; }
    const target = destination.id === 'farm'
      ? { ...destination, ...playerFarmTarget(session.farmId) }
      : destination;
    worldRef.current?.travelTo(target);
    gameClientRef.current?.sendTravel(target);
    setPanel(null);
    setStatus(`Đã đi xe buýt tới ${destination.label}`);
  };
  const buyOutfit = outfit => {
    const owned = progress.ownedOutfits.includes(outfit.id);
    if (!owned && progress.coins < outfit.cost) { setStatus(`Cần ${outfit.cost} xu để mua trang phục`); return; }
    gameClientRef.current?.sendGameAction('buy_outfit', { id: outfit.id });
    setStatus(`Server đang xử lý trang phục ${outfit.name}…`);
  };
  const buyVehicle = vehicle => {
    const owned = progress.ownedVehicles.includes(vehicle.id);
    if (!owned && progress.coins < vehicle.cost) { setStatus(`Cần ${vehicle.cost} xu để mua ${vehicle.name}`); return; }
    gameClientRef.current?.sendGameAction('buy_vehicle', { id: vehicle.id });
    setStatus(`Server đang xử lý ${vehicle.name}…`);
  };
  const dismountVehicle = () => {
    if (progress.vehicle === 'walk') return;
    gameClientRef.current?.sendGameAction('buy_vehicle', { id: 'walk' });
    setStatus('Đang xuống xe…');
  };
  const playCasino = bet => {
    if (progress.coins < bet) { setCasinoResult('Không đủ xu để đặt cược'); return; }
    gameClientRef.current?.sendGameAction('casino', { bet });
    setCasinoResult('Server đang tung xúc xắc…');
  };
  const selectTool = tool => {
    setActiveTool(tool);
    worldRef.current?.setTool(tool);
  };

  // Onboarding handlers
  const handleCharacterCreation = data => {
    gameClientRef.current?.sendGameAction('character_create', { name: data.name, outfit: 'starter' });
    setSession(prev => {
      const updated = {
        ...prev,
        name: data.name,
        avatarIcon: data.avatarIcon,
      };
      saveWorldSession(updated);
      return updated;
    });
    worldRef.current?.setPlayerOutfit(data.outfit, data.outfitColor);
    setVillageRequired(false);
    setStatus(`Đang tạo nhân vật ${data.name}…`);
    setPanel('land');
  };

  const handleClaimSeeds = () => {
    if (!session.farmId) { setDialogueOpen(false); setPanel('land'); return; }
    gameClientRef.current?.sendGameAction('claim_seeds');
    selectTool('hoe');
    setDialogueOpen(false);
    worldRef.current?.moveToTarget(playerFarmTarget(session.farmId));
    setStatus('Đã nhận 3 hạt cà rốt miễn phí! Hãy dùng Cuốc (phím 2) để xới đất.');
  };

  const handleGoToPlot = () => {
    setDialogueOpen(false);
    worldRef.current?.moveToTarget(playerFarmTarget(session.farmId));
    setStatus('Đang đi tới ô ruộng canh tác…');
  };

  const handleOpenOrders = () => {
    if (progress.onboarding?.step === ONBOARDING_STEPS.EXPLAIN_SYSTEMS) {
      gameClientRef.current?.sendGameAction('advance_onboarding', { step: ONBOARDING_STEPS.DELIVER_ORDER });
    }
    setDialogueOpen(false);
    setPanel('orders');
  };

  const handleClaimBicycle = () => {
    gameClientRef.current?.sendGameAction('complete_onboarding');
    farmAudio.playFanfare();
    setTimeout(() => farmAudio.playBicycleBell(), 600);
    setDialogueOpen(false);
    setCelebrationOpen(true);
    setStatus('Chúc mừng! Bạn đã nhận Xe Đạp Thể Thao và tự do khám phá thung lũng!');
  };

  const handleResetTutorial = () => {
    gameClientRef.current?.sendGameAction('reset_onboarding');
    setGuideOpen(false);
    setDialogueOpen(true);
    setStatus('Đã làm mới lại chuỗi hướng dẫn tân thủ của Quản Gia Oliver.');
  };

  const handleNavigateTarget = () => {
    const step = progress.onboarding?.step;
    if (
      step === ONBOARDING_STEPS.MEET_ELDER ||
      step === ONBOARDING_STEPS.EXPLAIN_SYSTEMS ||
      step === ONBOARDING_STEPS.CLAIM_REWARD
    ) {
      worldRef.current?.moveToTarget(WORLD_LAYOUT.villageElder, () => setDialogueOpen(true));
      setStatus('Đang đi tới Quản Gia Oliver…');
    } else if (step === ONBOARDING_STEPS.FIRST_PLANT) {
      worldRef.current?.moveToTarget(playerFarmTarget(session.farmId));
      setStatus('Đang đi tới ô ruộng…');
    }
  };

  const handleBuyOffer = offer => {
    gameClientRef.current?.sendGameAction('roadside_buy', { crop: offer.crop, amount: offer.amount, price: offer.price });
    setStatus('Server đang xử lý giao dịch ven đường…');
  };

  const handleApplyQuickTool = (tile, data) => {
    if (!worldRef.current?.farming) return;
    if (data.state === 'empty') {
      selectTool('hoe');
    } else if (data.state === 'tilled') {
      selectTool('seed');
    } else if (data.state === 'planted') {
      selectTool('water');
    } else if (data.state === 'watered') {
      selectTool('harvest');
    }
    worldRef.current.farming.applyTool(tile);
  };

  const handleMenuClick = panelId => {
    if (isFeatureLocked(progress, panelId)) {
      setStatus('Tính năng này sẽ mở sau khi hoàn thành hướng dẫn của Quản Gia Oliver!');
      return;
    }
    setPanel(panelId);
  };

  const showCharacterCreation = !progress.onboarding?.characterCreated || villageRequired;
  const updateJoystick = event => {
    const pad = event.currentTarget;
    const rect = pad.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    const radius = rect.width * 0.32;
    const length = Math.hypot(dx, dy) || 1;
    const scale = Math.min(1, radius / length);
    const x = dx * scale;
    const y = dy * scale;
    if (joystickKnobRef.current) joystickKnobRef.current.style.transform = `translate(${x}px, ${y}px)`;
    worldRef.current?.setVirtualInput(x / radius, -y / radius);
  };
  const startJoystick = event => {
    event.currentTarget.setPointerCapture(event.pointerId);
    updateJoystick(event);
  };
  const stopJoystick = () => {
    if (joystickKnobRef.current) joystickKnobRef.current.style.transform = 'translate(0, 0)';
    worldRef.current?.setVirtualInput(0, 0);
  };

  return (
    <main className={`game-shell${venueMode ? ' in-venue' : ''}`}>
      <canvas ref={canvasRef} className="game-canvas" aria-label="Thế giới nông trại 3D" />
      {boot.phase === 'loading' && <div className="boot-screen"><div className="boot-spinner"/><b>Đang dựng Thung Lũng Bình Minh</b><span>Đang tải địa hình, nông trại và phương tiện…</span></div>}
      {boot.phase === 'error' && <div className="boot-screen error"><b>Không thể mở thế giới 3D</b><span>{boot.error}</span><button type="button" onClick={() => window.location.reload()}>Thử lại</button></div>}
      {debugEnabled && debug && <aside className="debug-panel"><b>WORLD DEBUG · F3</b><span>FPS {debug.fps}</span><span>POS {debug.x}, {debug.z}</span><span>CHUNK {debug.chunk}</span><span>MESHES {debug.meshes}</span><span>{debug.worldId}</span></aside>}
      {venueMode && <section className="venue-banner"><b>{venueMode.label}</b><span>Bấm vào quầy để giao dịch · đi vào cửa ra để trở lại thành phố</span></section>}

      <header className="topbar">
        <div className="player-avatar" onClick={() => setGuideOpen(true)} title="Bấm để mở Cẩm Nang Nông Trại" style={{ cursor: 'pointer' }}>
          <Icon3dNonLa size={42} />
        </div>
        <div className="player-copy">
          <strong>{session.name}</strong>
          <span className="vehicle-status-icon">{vehicles.find(vehicle => vehicle.id === progress.vehicle)?.icon || <Icon3dWalk />} {progress.vehicle === 'walk' ? 'Nông Dân Bình Minh' : vehicles.find(vehicle => vehicle.id === progress.vehicle)?.name}</span>
        </div>
        <div className="level-wrap">
          <span className="level-label">CẤP {progress.level}</span>
          <div className="level" title={`Kinh nghiệm: ${progress.xp} XP`}>
            <i style={{ width: `${Math.round(((progress.xp - levelFloor(progress.level)) / Math.max(1, levelCeiling(progress.level) - levelFloor(progress.level))) * 100)}%` }} />
          </div>
        </div>
        <div className="currency">
          <span className="currency-badge coin-pill" title="Đồng vàng nông trại">
            <Icon3dGoldCoin size={26} />
            <b>{progress.coins.toLocaleString('vi-VN')}</b>
          </span>
          {progress.freeSeeds > 0 && (
            <span className="currency-badge seed-pill" title="Hạt giống cà rốt miễn phí">
              <Icon3dCarrot size={24} />
              <b>{progress.freeSeeds}</b>
            </span>
          )}
          <span className="currency-badge gem-pill" title="Đá quý xanh">
            <Icon3dGem size={24} />
            <b>{progress.gems}</b>
          </span>
          {progress.vehicle === 'bike' && (
            <button
              type="button"
              className="topbar-btn bell-btn"
              onClick={() => {
                farmAudio.playBicycleBell();
                setStatus('Kính coong! Đường nông trại thênh thang!');
              }}
              title="Bấm chuông xe đạp (Kính coong!)"
            >
              <Icon3dBell size={18} />
              <span>Chuông</span>
            </button>
          )}
          <button
            type="button"
            className="topbar-btn audio-toggle-btn"
            onClick={() => {
              const muted = farmAudio.toggleMute();
              setIsMuted(muted);
              setStatus(muted ? 'Đã tắt âm thanh' : 'Đã bật âm thanh thế giới');
            }}
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}
          >
            {isMuted ? <Icon3dAudioOff size={23} /> : <Icon3dAudioOn size={23} />}
          </button>
          <button
            type="button"
            className="topbar-btn graphics-toggle-btn"
            onClick={() => {
              const nextPreset = graphicsQuality === 'ultra' ? 'balanced' : graphicsQuality === 'balanced' ? 'eco' : 'ultra';
              setGraphicsQuality(nextPreset);
              worldRef.current?.setGraphicsQuality(nextPreset);
              setStatus(nextPreset === 'ultra' ? '🌟 Đồ họa Siêu Nét (Ultra Retina HD)' : nextPreset === 'balanced' ? '⚡ Đồ họa Cân Bằng (Balanced HD)' : '🔋 Đồ họa Tiết Kiệm Pin (Eco)');
            }}
            title={`Chất lượng hiển thị: ${graphicsQuality.toUpperCase()} (Bấm để chuyển đổi giữa Siêu Nét / Cân Bằng / Tiết Kiệm)`}
            style={{
              background: graphicsQuality === 'ultra' ? 'linear-gradient(135deg, #0284c7, #06b6d4)' : 'rgba(255,255,255,0.88)',
              color: graphicsQuality === 'ultra' ? '#ffffff' : '#0f172a',
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: '16px',
              padding: '0 10px',
              height: '32px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 800,
              gap: '4px',
              boxShadow: graphicsQuality === 'ultra' ? '0 2px 8px rgba(6,182,212,0.45)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <span>{graphicsQuality === 'ultra' ? '🌟 SIÊU NÉT' : graphicsQuality === 'balanced' ? '⚡ CÂN BẰNG' : '🔋 TIẾT KIỆM'}</span>
          </button>
        </div>
      </header>

      {progress.vehicle !== 'walk' && !venueMode && (
        <button type="button" className="dismount-vehicle-btn" onClick={dismountVehicle} aria-label="Xuống xe" title="Xuống xe và chuyển sang đi bộ">
          <span className="dismount-icon"><Icon3dDismount size={28} /></span>
          <b>Xuống xe</b>
        </button>
      )}

      {!venueMode && !showCharacterCreation && (
        <>
          <div className="virtual-joystick" role="group" aria-label="Điều khiển di chuyển" onPointerDown={startJoystick} onPointerMove={event => event.currentTarget.hasPointerCapture(event.pointerId) && updateJoystick(event)} onPointerUp={stopJoystick} onPointerCancel={stopJoystick}>
            <span ref={joystickKnobRef}>●</span>
          </div>
          <div className="world-action-controls">
            <button type="button" className="jump-action-btn" onClick={() => worldRef.current?.jumpPlayer()}><i><Icon3dJump size={30} /></i><b>Nhảy</b></button>
            <button type="button" className="run-action-btn" onPointerDown={() => worldRef.current?.setSprinting(true)} onPointerUp={() => worldRef.current?.setSprinting(false)} onPointerCancel={() => worldRef.current?.setSprinting(false)} onPointerLeave={() => worldRef.current?.setSprinting(false)}><i><Icon3dSprint size={30} /></i><b>Chạy</b></button>
          </div>
        </>
      )}

      {/* Floating Indicator when walking inside a Farm Estate */}
      {currentFarmZone && (
        <aside className={`farm-zone-badge ${currentFarmZone.isOwner ? 'owner' : 'visitor'}`}>
          <span className="zone-icon">{currentFarmZone.isOwner ? <Icon3dCrown size={24} /> : <Icon3dHouseCabin size={24} />}</span>
          <span className="zone-text">
            {currentFarmZone.isOwner
              ? `NÔNG TRẠI CỦA BẠN (LÔ ${currentFarmZone.lotNumber})`
              : `NÔNG TRẠI CỦA ${currentFarmZone.ownerName.toUpperCase()} (LÔ ${currentFarmZone.lotNumber})`}
          </span>
          <span className="zone-tag">{currentFarmZone.isOwner ? 'Khu vực canh tác của bạn' : 'Đang ghé thăm bạn bè'}</span>
        </aside>
      )}

      <section className="world-title">
        <span className="world-clock-icons">{timeIcons[Math.floor((clock % 240) / 60)]} {String(Math.floor((clock % 240) / 10) + 6).padStart(2,'0')}:{String((clock % 10) * 6).padStart(2,'0')} · {seasonIcons[Math.floor(clock / 240) % 4]} {['Mùa Xuân','Mùa Hạ','Mùa Thu','Mùa Đông'][Math.floor(clock / 240) % 4]}</span>
        <strong>{session.farmAddress?.villageName?.toUpperCase() || worldRegion?.village?.name?.toUpperCase() || (worldRegion ? `VÙNG ${worldRegion.chunk.x}:${worldRegion.chunk.z}` : 'THUNG LŨNG BÌNH MINH')}</strong>
        <small>Thế giới mở · {network.online} nông dân đang online</small>
      </section>

      <div className="quick-travel-bar">
        <button
          type="button"
          className="quick-travel-btn town-btn"
          onClick={() => travelTo({ id: 'town', label: 'Trung tâm thành phố', x: 0, z: 20 })}
          title="Dịch chuyển tức thì đến Quảng Trường Trung Tâm"
        >
          <Icon3dModernCity size={20} />
          <span>Đến Trung Tâm</span>
        </button>
        <button
          type="button"
          className="quick-travel-btn farm-btn"
          onClick={() => travelTo({ id: 'farm', label: 'Nông trại', ...playerFarmTarget(session.farmId) })}
          title="Dịch chuyển tức thì về Nông Trại của bạn"
        >
          <Icon3dRiceSpike size={20} />
          <span>Về Nông Trại</span>
        </button>
      </div>

      <section className="livestock-card">
        <div className="livestock-info">
          <span className="animal-tag" title={`${chickenCount} Gà mái`}><Icon3dChicken size={22} /> <b>{chickenCount}</b></span>
          <span className="animal-tag" title={`${cowCount} Bò sữa`}><Icon3dCow size={22} /> <b>{cowCount}</b></span>
          <b>{animals.length === 0 ? 'Chưa có vật nuôi' : animalStatus.ready ? `${animalStatus.ready} sản phẩm sẵn sàng` : animalStatus.hungry ? `${animalStatus.hungry} con đang đói` : 'Đang sản xuất'}</b>
        </div>
        {animals.length > 0 && (
          <button type="button" className="livestock-action-btn" onClick={animalStatus.ready ? collectAnimals : feedAnimals}>
            {animalStatus.ready ? <><Icon3dBasket size={18} /> Thu hoạch</> : <><Icon3dCorn size={18} /> Cho ăn</>}
          </button>
        )}
      </section>

      <button type="button" className="minimap" aria-label="Mở bản đồ" onClick={() => setPanel('map')} title="Bấm phím M hoặc chạm để mở bản đồ thế giới">
        <span className="map-town"><Icon3dModernCity size={24} /></span><span className="map-lake"><Icon3dLotus size={22} /></span><span className="map-farm"><Icon3dRiceSpike size={22} /></span><span className="map-beach"><Icon3dCoast size={22} /></span><i className="minimap-direction" />
      </button>

      <footer className="hotbar">
        {[
          { id: 'hand', label: 'Bàn tay', icon: <Icon3dHand size={46} /> },
          { id: 'hoe', label: 'Cuốc đất', icon: <Icon3dHoe size={46} /> },
          { id: 'seed', label: 'Gieo hạt', icon: <Icon3dSeeds size={46} /> },
          { id: 'water', label: 'Tưới nước', icon: <Icon3dWateringCan size={46} /> },
          { id: 'harvest', label: 'Thu hoạch', icon: <Icon3dBasket size={46} /> },
        ].map((item, index) => {
          const tool = item.id;
          const isRecommended =
            progress.onboarding?.step === ONBOARDING_STEPS.FIRST_PLANT &&
            ((tool === 'hoe' && progress.stats.planted === 0) ||
             (tool === 'seed' && progress.stats.planted === 0 && activeTool === 'seed') ||
             (tool === 'water' && progress.stats.planted > 0 && progress.stats.watered === 0) ||
             (tool === 'harvest' && progress.stats.watered > 0 && progress.stats.harvested === 0));

          return (
            <button
              className={`hotbar-slot ${activeTool === tool ? 'selected' : ''} ${isRecommended ? 'recommended-tool' : ''}`}
              key={tool}
              type="button"
              onClick={() => selectTool(tool)}
              aria-label={item.label}
              title={`${item.label} (Phím [${index + 1}])`}
            >
              <span className="slot-key">{index + 1}</span>
              <div className="slot-icon-wrap">{item.icon}</div>
              {isRecommended && <i className="tool-glow" />}
            </button>
          );
        })}
      </footer>

      <nav className="game-menu">
        <button type="button" className="menu-badge-btn" onClick={() => { const mode = worldRef.current?.toggleCameraView(); if (mode) setCameraViewMode(mode); }} title="Chuyển giữa nhìn xa khám phá và nhìn từ trên cao để canh tác"><div className="badge-icon" aria-hidden="true">{cameraViewMode === 'explore' ? '◎' : '▦'}</div><span>{cameraViewMode === 'explore' ? 'Nhìn xa' : 'Canh tác'}</span></button>
        <button type="button" className="menu-badge-btn" onClick={() => setPanel('land')}><div className="badge-icon"><Icon3dHouseCabin size={38} /></div><span>{session.farmId ? 'Đất đai' : 'Mua đất'}</span></button>
        <button type="button" className="menu-badge-btn" onClick={() => worldRef.current?.resetCameraView()} title="Đưa camera về góc nhìn ban đầu. Kéo chuột trái hoặc phải để xoay; trên điện thoại vuốt để xoay, chụm hai ngón để zoom." aria-label="Đặt lại góc nhìn camera">
          <div className="badge-icon" aria-hidden="true">↺</div>
          <span>Góc nhìn</span>
        </button>
        <button type="button" className="menu-badge-btn" onClick={() => handleMenuClick('map')} title="Bản đồ thế giới (Phím M)">
          <div className="badge-icon"><Icon3dMap size={38} /></div>
          <span>Bản đồ</span>
        </button>
        <button type="button" className="menu-badge-btn" onClick={() => handleMenuClick('inventory')} title="Kho nông sản (Phím B / I)">
          <div className="badge-icon"><Icon3dBackpack size={38} /></div>
          <span>Kho đồ</span>
        </button>
        <button
          type="button"
          className={`menu-badge-btn ${isFeatureLocked(progress, 'orders') ? 'menu-locked' : ''}`}
          onClick={() => handleMenuClick('orders')}
          title="Bảng đơn hàng (Phím O)"
        >
          <div className="badge-icon">
            {isFeatureLocked(progress, 'orders') ? <Icon3dLock size={26} /> : <Icon3dOrdersBox size={38} />}
          </div>
          <span>Đơn hàng</span>
        </button>
        <button
          type="button"
          className="menu-badge-btn"
          onClick={() => setRoadsideOpen(true)}
          title="Chợ nông sản ven đường"
        >
          <div className="badge-icon"><Icon3dMarketStall size={38} /></div>
          <span>Chợ</span>
        </button>
        <button type="button" className="menu-badge-btn" onClick={() => handleMenuClick('quests')} title="Nhiệm vụ hàng ngày (Phím Q)">
          <div className="badge-icon"><Icon3dQuestBook size={38} /></div>
          <span>Nhiệm vụ</span>
        </button>
        <button
          type="button"
          className={`menu-badge-btn ${isFeatureLocked(progress, 'factory') ? 'menu-locked' : ''}`}
          onClick={() => handleMenuClick('factory')}
          title="Xưởng chế biến"
        >
          <div className="badge-icon">
            {isFeatureLocked(progress, 'factory') ? <Icon3dLock size={26} /> : <Icon3dMill size={38} />}
          </div>
          <span>Chế biến</span>
        </button>
        <button
          type="button"
          className={`menu-badge-btn ${isFeatureLocked(progress, 'upgrade') ? 'menu-locked' : ''}`}
          onClick={() => handleMenuClick('upgrade')}
          title="Nâng cấp nông trại"
        >
          <div className="badge-icon">
            {isFeatureLocked(progress, 'upgrade') ? <Icon3dLock size={26} /> : <Icon3dHammer size={38} />}
          </div>
          <span>Nâng cấp</span>
        </button>
      </nav>

      {/* Modern Onboarding HUD with Distance Tracker and Navigation */}
      {!session.farmId && progress.onboarding?.characterCreated && <button type="button" className="land-start-prompt" onClick={() => setPanel('land')}>Chọn mua lô đất để bắt đầu nông trại →</button>}
      {session.farmId && <OnboardingHUD
        progress={progress}
        targetDistance={targetDistance}
        onNavigateTarget={handleNavigateTarget}
        onTalkToElder={() => setDialogueOpen(true)}
        onOpenGuide={() => setGuideOpen(true)}
        onOpenOrders={handleOpenOrders}
      />}

      {/* Rustic Order Bulletin Board */}
      {panel === 'orders' && (
        <OrderBulletinBoard
          orders={ORDERS}
          progress={progress}
          canFillOrder={canFillOrder}
          onDeliverOrder={deliverOrder}
          onResetOrders={resetOrders}
          onClose={() => setPanel(null)}
        />
      )}

      {/* Panels */}
      {panel && panel !== 'orders' && <div className="panel-backdrop" onClick={() => setPanel(null)}><section className="game-panel" onClick={event => event.stopPropagation()}>
        <header><div><small>TRUNG TÂM NÔNG TRẠI</small><h2>{{ land: 'Mua đất · Quyền sở hữu', shop: 'Cửa hàng vật tư nông nghiệp', inventory: 'Kho nông sản', quests: 'Nhiệm vụ', factory: 'Xưởng chế biến', upgrade: 'Nâng cấp nông trại', map: 'Bản đồ Thung Lũng', city: 'Trung tâm thị trấn Ghibli', fashion: 'Cửa hàng thời trang Sophie', vehicles: 'Đại lý phương tiện & xưởng bay', casino: 'Casino & Giải Trí May Mắn', fishing: 'Cửa hàng đồ câu Lão Ngư' }[panel]}</h2></div><button type="button" onClick={() => setPanel(null)}>×</button></header>
        {panel === 'land' && <LandMarket lots={landLots} focusFarmId={focusedLand} playerId={session.playerId} ownsLand={Boolean(session.farmId)} coins={progress.coins} pending={landPending} onVisit={lot => { const gate = WORLD_VILLAGES.find(v => v.id === lot.villageId)?.gate; if (gate) travelTo({ id: lot.villageId, label: lot.villageName, ...gate }); }} onBuy={lot => { if (!network.connected) { setStatus('Chưa kết nối server.'); return; } setLandPending(true); gameClientRef.current?.sendGameAction('buy_land', { farmId: lot.farmId }); }} />}
        {panel === 'shop' && <div className="item-list">{Object.values(CROPS).map(crop => <button key={crop.id} disabled={progress.level < crop.level} onClick={() => chooseCrop(crop)}><i>{cropIcons[crop.id]}</i><span><b>{crop.name}</b><small>{Math.ceil(crop.growMs / 60000)} phút · mở cấp {crop.level}</small></span><em>{crop.seedCost} xu</em></button>)}</div>}
        {panel === 'inventory' && <div className="item-list"><div className="capacity">Kho cấp {progress.barnLevel} · {inventoryCount(progress)}/{barnCapacity(progress)} chỗ</div>{Object.values(CROPS).map(crop => <button key={crop.id} disabled={!progress.inventory[crop.id]} onClick={() => sellItem(crop.id)}><i>{cropIcons[crop.id]}</i><span><b>{crop.name} × {progress.inventory[crop.id]}</b><small>Chạm để bán từng sản phẩm</small></span><em>+{crop.sellPrice} xu</em></button>)}<div className="animal-stock"><Icon3dEgg size={20} /> Trứng × {progress.inventory.egg}　<Icon3dMilk size={20} /> Sữa × {progress.inventory.milk}</div>{RECIPES.map(recipe => <button key={recipe.id} disabled={!progress.inventory[recipe.id]} onClick={() => sellProduct(recipe.id, recipe.coins, recipe.name)}><i>{recipeIcons[recipe.id]}</i><span><b>{recipe.name} × {progress.inventory[recipe.id]}</b><small>Sản phẩm đã chế biến</small></span><em>+{recipe.coins} xu</em></button>)}</div>}
        {panel === 'quests' && <div className="item-list">{QUESTS.map(quest => { const current = Math.min(quest.goal, progress.stats[quest.stat]); const claimed = progress.claimedQuests.includes(quest.id); return <button key={quest.id} disabled={claimed || current < quest.goal} onClick={() => claimQuest(quest)}><i>{claimed ? <Icon3dCheck /> : <Icon3dStar />}</i><span><b>{quest.title}</b><small>{current}/{quest.goal} · thưởng {quest.xp} XP</small></span><em>{claimed ? 'Đã nhận' : `+${quest.coins} xu`}</em></button>; })}</div>}
        {panel === 'factory' && <div className="item-list">{RECIPES.map(recipe => <button key={recipe.id} onClick={() => craft(recipe)}><i>{recipeIcons[recipe.id]}</i><span><b>{recipe.name}</b><small>{Object.entries(recipe.inputs).map(([id,count]) => `${CROPS[id]?.name || id} ${count}`).join(' · ')} · +{recipe.xp} XP</small></span><em>Chế biến</em></button>)}</div>}
        {panel === 'upgrade' && <div className="item-list"><button onClick={upgradeLand}><i><Icon3dSprout /></i><span><b>Mở rộng đất · {progress.unlockedPlots}/48 ô</b><small>{EXPANSIONS.find(item => item.plots > progress.unlockedPlots) ? `Yêu cầu cấp ${EXPANSIONS.find(item => item.plots > progress.unlockedPlots).level}` : 'Đã đạt tối đa'}</small></span><em>{EXPANSIONS.find(item => item.plots > progress.unlockedPlots)?.cost || 'MAX'} xu</em></button><button onClick={upgradeBarn}><i><Icon3dBarn /></i><span><b>Nâng kho lên cấp {progress.barnLevel + 1}</b><small>Tăng thêm 20 chỗ chứa</small></span><em>{progress.barnLevel * 350} xu</em></button><button onClick={upgradeHome}><i><Icon3dHouseCabin /></i><span><b>{(progress.homeTier || 1) >= 2 ? 'Nhà Nông Trại Ấm Cúng' : 'Nâng cấp căn nhà gỗ'}</b><small>{(progress.homeTier || 1) >= 2 ? 'Đã sở hữu · cấp nhà 2' : 'Mở ở cấp 4 · thay căn nhà khởi đầu đơn giản'}</small></span><em>{(progress.homeTier || 1) >= 2 ? 'Đã mua' : '1800 xu'}</em></button></div>}
        {panel === 'map' && <><div className="destination-grid">{destinations.map(destination => <button key={destination.id} onClick={() => travelTo(destination)}><i>{destination.icon}</i><b>{destination.label}</b><small>{destination.description}</small><em>Đi xe buýt →</em></button>)}</div><div className="city-district-strip"><strong>PHÂN KHU TRUNG TÂM</strong>{cityDestinations.map(district => <button key={district.id} type="button" onClick={() => travelTo({ ...district, description: district.label })}><span>{cityDistrictIcons[district.id]}</span>{district.label}</button>)}</div></>}
        {panel === 'city' && <div className="destination-grid"><button onClick={() => setPanel('shop')}><i><Icon3dSprout /></i><b>Vật tư</b><small>Mua hạt giống theo cấp</small><em>Mở cửa hàng</em></button><button onClick={() => isFeatureLocked(progress, 'casino') ? setStatus('Casino mở sau khi hoàn thành hướng dẫn!') : setPanel('casino')}><i><Icon3dDice /></i><b>Casino giải trí</b><small>{isFeatureLocked(progress, 'casino') ? 'Khóa tân thủ' : 'Trò chơi xúc xắc may mắn'}</small><em>Vào chơi</em></button><button onClick={() => setPanel('fashion')}><i><Icon3dWardrobe /></i><b>Thời trang</b><small>Mua và thay trang phục Sophie</small><em>Xem đồ</em></button><button onClick={() => isFeatureLocked(progress, 'vehicles') ? setStatus('Đại lý xe mở sau khi hoàn thành hướng dẫn!') : setPanel('vehicles')}><i><Icon3dCub50 /></i><b>Đại lý xe</b><small>{isFeatureLocked(progress, 'vehicles') ? 'Khóa tân thủ' : 'Xe đạp cổ & chổi bay'}</small><em>Xem xe</em></button><button onClick={() => setPanel('fishing')}><i>🎣</i><b>Đồ câu cá</b><small>Cần câu trúc, cước & mồi câu</small><em>Mở tiệm</em></button></div>}
        {panel === 'fashion' && <div className="item-list">{outfits.map(outfit => { const owned = progress.ownedOutfits.includes(outfit.id); return <button key={outfit.id} onClick={() => buyOutfit(outfit)}><i>{outfit.icon}</i><span><b>{outfit.name}</b><small>{progress.outfit === outfit.id ? 'Đang mặc' : owned ? 'Đã sở hữu' : 'Trang phục mới'}</small></span><em>{owned ? 'Mặc' : `${outfit.cost} xu`}</em></button>; })}</div>}
        {panel === 'vehicles' && <div className="item-list">{vehicles.map(vehicle => { const owned = progress.ownedVehicles.includes(vehicle.id); return <button key={vehicle.id} onClick={() => buyVehicle(vehicle)}><i>{vehicle.icon}</i><span><b>{vehicle.name}</b><small>Tốc độ {vehicle.speed} · {progress.vehicle === vehicle.id ? 'đang dùng' : owned ? 'đã sở hữu' : 'chưa mua'}</small></span><em>{owned ? 'Chọn' : `${vehicle.cost} xu`}</em></button>; })}</div>}
        {panel === 'casino' && <div className="casino-game"><div className="casino-result"><Icon3dDice /> {casinoResult}</div><p>Tung xúc xắc đấu với nhà cái. Thắng nhận gấp đôi tiền cược, hòa được hoàn tiền.</p><div>{[10, 50, 100].map(bet => <button key={bet} onClick={() => playCasino(bet)}>Cược {bet} xu</button>)}</div><small>Đã chơi {progress.casinoPlays} ván · chỉ dùng tiền trong game</small></div>}
        {panel === 'fishing' && (
          <div className="item-list">
            <div className="capacity" style={{ background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: '#fff', padding: '10px 14px', borderRadius: '12px', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold' }}>
              🎣 Tiệm Đồ Câu Lão Ngư · Trang bị cần câu & mồi câu ven hồ
            </div>
            {[
              { id: 'rod_bamboo', name: 'Cần câu trúc mộc', desc: 'Cần câu dẻo dai làm thủ công từ tre làng', cost: 150, icon: '🎋' },
              { id: 'rod_carbon', name: 'Cần máy Carbon Pro', desc: 'Cần câu máy quay săn cá lớn hồ sâu', cost: 650, icon: '🎣' },
              { id: 'bait_worm', name: 'Mồi trùn quế (x10)', desc: 'Mồi sống nhạy bén thu hút cá chép, cá rô', cost: 50, icon: '🪱' },
              { id: 'bait_lure', name: 'Mồi ruồi lông vũ (x5)', desc: 'Mồi giả óng ánh săn cá hồi biển hồ', cost: 120, icon: '🪶' },
              { id: 'fish_chum', name: 'Thính thơm dụ cá (x3)', desc: 'Rải xuống nước tụ cá thành đàn lớn', cost: 80, icon: '🌾' },
              { id: 'cooler_box', name: 'Thùng ướp lạnh ngư dân', desc: 'Bảo quản cá tươi ngon sau mỗi chuyến câu', cost: 400, icon: '🧊' },
            ].map(item => (
              <button key={item.id} onClick={() => {
                if (progress.coins < item.cost) {
                  setStatus(`Bạn cần thêm ${item.cost - progress.coins} xu để mua ${item.name}!`);
                  return;
                }
                setProgress(p => ({ ...p, coins: p.coins - item.cost }));
                emitReward({ text: `+1 ${item.name}`, icon: item.icon, color: '#0284c7' });
                farmAudio.playFanfare();
                setStatus(`Đã mua ${item.name} thành công!`);
              }}>
                <i>{item.icon}</i>
                <span>
                  <b>{item.name}</b>
                  <small>{item.desc}</small>
                </span>
                <em>{item.cost} xu</em>
              </button>
            ))}
          </div>
        )}
      </section></div>}

      {/* Onboarding Modals */}
      {showCharacterCreation && (
        <CharacterCreationModal
          defaultName={session.name}
          villages={villages}
          defaultVillageId={session.villageId || ''}
          onSubmit={handleCharacterCreation}
        />
      )}

      {dialogueOpen && (
        <ElderDialogueModal
          step={progress.onboarding?.step ?? ONBOARDING_STEPS.MEET_ELDER}
          villageName={session.farmAddress?.villageName || 'Làng Bình Minh'}
          onClose={() => setDialogueOpen(false)}
          onClaimSeeds={handleClaimSeeds}
          onGoToPlot={handleGoToPlot}
          onOpenOrders={handleOpenOrders}
          onClaimBicycle={handleClaimBicycle}
          onOpenGuide={() => {
            setDialogueOpen(false);
            setGuideOpen(true);
          }}
        />
      )}

      {guideOpen && (
        <FarmGuideModal
          onClose={() => setGuideOpen(false)}
          onResetTutorial={handleResetTutorial}
        />
      )}

      {/* Floating 3D Action Bubble for Plots */}
      <FloatingPlotBubble
        world={worldRef.current}
        activeTool={activeTool}
        onApplyQuickTool={handleApplyQuickTool}
      />

      {/* Roadside Shop Modal */}
      {roadsideOpen && (
        <RoadsideShopModal
          progress={progress}
          onBuyOffer={handleBuyOffer}
          onClose={() => setRoadsideOpen(false)}
        />
      )}

      {/* Floating Rewards Pop Effect (Juicy Harvest Pop VFX) */}
      <FloatingRewards />

      <div className="status"><i className={network.phase === 'connected' ? '' : 'offline'} /> {status}</div>
    </main>
  );
}
