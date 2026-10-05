import { useCallback, useEffect, useRef, useState } from 'react';
import { FARM_CONFIG, farmBarnUpgradeCost } from '../shared/farmConfig.js';
import {
  FISHING_CONFIG,
  FISHING_GEAR,
  FISHING_GEAR_ORDER,
  LAKE_FISH,
  FISHING_WATER_NAMES,
  fishingWaterAt,
  fishingInventoryCount,
  fishingCapacity,
} from '../shared/fishing.js';
import { FarmWorld } from './game/world/FarmWorld.js';
import { zoneAtPosition } from './game/world/worldLayout.js';
import { TOWN_SPAWN } from '../shared/playerSpawn.js';
import { LivestockRefresh } from './components/LivestockRefresh.jsx';
import { FishingHUD } from './components/FishingHUD.jsx';
import { VehicleQuickMenu } from './components/VehicleQuickMenu.jsx';
import { VEHICLE_LIST } from '../shared/vehicleConfig.js';
import { VehicleShowroom } from './components/VehicleShowroom.jsx';
import './components/CompactGameHud.css';
import { fishingMissionProgress } from '../shared/fishingSession.js';
import { readGraphicsQuality } from './game/rendering/GraphicsSettings.js';
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
import { GameStartScreen } from './components/GameStartScreen.jsx';
import { LandMarket } from './components/LandMarket.jsx';
import { GameClock, LiveCasinoGames, LiveBusHud, LiveWorldDebug } from './components/LiveHud.jsx';
import { recordAppRender, transitHudSnapshot } from './game/rendering/HudRuntime.js';
import { ElderDialogueModal } from './components/ElderDialogueModal.jsx';
import { OnboardingHUD } from './components/OnboardingHUD.jsx';
import { HudContextAction } from './components/HudContextAction.jsx';
import { FarmGuideModal } from './components/FarmGuideModal.jsx';
import { GraduationModal } from './components/GraduationModal.jsx';
import { RoadsideShopModal } from './components/RoadsideShopModal.jsx';
import { FashionBoutiqueModal } from './components/FashionBoutiqueModal.jsx';
import { LeaderboardModal } from './components/LeaderboardModal.jsx';
import PlayTogetherWorldMapModal from './components/PlayTogetherWorldMapModal.jsx';
import { PlayTogetherInventoryModal } from './components/PlayTogetherInventoryModal.jsx';
import { Icon3dFashionLogo } from './components/icons3d/Fashion3DIcons.jsx';
import { getDefaultCustomization } from './game/data/fashionCatalog.js';
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
  Icon3dSheep,
  Icon3dCorn,
  Icon3dNonLa,
  Icon3dRiceSpike,
  Icon3dLotus,
  Icon3dCoast,
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
  Icon3dSparkleStar,
  Icon3dLightningBolt,
  Icon3dBatteryEco,
  Icon3dFishingRodBamboo,
  Icon3dFishingRodPro,
  Icon3dBaitWorm,
  Icon3dBaitLure,
  Icon3dCoolerBox,
  Icon3dFishChum,
  Icon3dTomato,
  Icon3dStrawberry,
  Icon3dFertilizerBag,
  Icon3dPesticideBottle,
  Icon3dHeartReaction,
  Icon3dWaveHand,
  Icon3dPartyPopper,
  Icon3dTrophyCup,
  Icon3dWarningAlert,
  Icon3dDrinkCoconut,
  Icon3dPlus,
  Icon3dSmartPhone,
  Icon3dVillageGate,
  Icon3dGoldCoin,
  Icon3dGiftBoxRibbon,
  Icon3dNoticeBoard,
} from './components/icons3d/GameIcons3D.jsx';

const destinations = [
  ...WORLD_LAYOUT.villages.map(village => ({ id: village.id, label: village.name, icon: <Icon3dHouseCabin size={34} />, x: village.gate.x, z: village.gate.z - 4, description: '24 lô đất · cổng làng trên bản đồ chung' })),
  { id: 'farm', label: 'Nông trại', icon: <Icon3dRiceSpike size={34} />, x: WORLD_LAYOUT.spawn.x, z: WORLD_LAYOUT.spawn.z, description: 'Ruộng, chuồng và xưởng' },
  { id: 'town', label: 'Trung tâm', icon: <Icon3dModernCity size={34} />, x: WORLD_LAYOUT.zones.city.x, z: WORLD_LAYOUT.zones.city.z + 18, description: 'Cửa hàng và quảng trường' },
  { id: 'lake', label: 'Hồ Pha Lê', icon: <Icon3dLotus size={34} />, x: WORLD_LAYOUT.zones.lake.x - 39, z: WORLD_LAYOUT.zones.lake.z - 10, description: 'Đường dạo, cầu gỗ và bến câu' },
  { id: 'beach', label: 'Làng chài', icon: <Icon3dCoast size={34} />, x: WORLD_LAYOUT.zones.beach.x, z: WORLD_LAYOUT.zones.beach.z - 20, description: 'Bãi biển và hải đăng' },
];
const cityDistrictIcons = {
  shopping: <Icon3dShopCart size={20} />, entertainment: <Icon3dDice size={20} />,
  services: <Icon3dModernCity size={20} />, community: <Icon3dNonLa size={20} />,
};
const cityDestinations = WORLD_LAYOUT.cityDistricts.filter(district => district.id !== 'civic');
const fishingGearIcons = {
  'rod-bamboo': Icon3dFishingRodBamboo,
  'rod-pro': Icon3dFishingRodPro,
  'bait-worm': Icon3dBaitWorm,
  'bait-lure': Icon3dBaitLure,
  'fish-chum': Icon3dFishChum,
  'cooler-box': Icon3dCoolerBox,
};
const outfits = [
  { id: 'starter', name: 'Áo phông mộc mạc', icon: <Icon3dShirt />, color: '#f8fafc', cost: 0 },
  { id: 'farmer', name: 'Nông dân Bình Minh', icon: <Icon3dNonLa />, color: '#f1b445', cost: 100 },
  { id: 'rose', name: 'Hoa Hồng Dịu Dàng', icon: <Icon3dFlower />, color: '#e87994', cost: 180 },
  { id: 'lake', name: 'Hồ Pha Lê', icon: <Icon3dCap />, color: '#5f91c8', cost: 260 },
  { id: 'royal', name: 'Hoàng Gia', icon: <Icon3dCrown />, color: '#8a72b8', cost: 420 },
];
const vehicleIcons = { walk: <Icon3dWalk />, bike: <Icon3dBike size={28} />, scooter: <Icon3dCub50 />, tractor: <Icon3dTractor /> };
const vehicles = VEHICLE_LIST.map(vehicle => ({ ...vehicle, icon: vehicleIcons[vehicle.id] || vehicle.icon }));
const timeIcons = [<Icon3dDawn key="dawn" size={24} />, <Icon3dSun key="sun" size={24} />, <Icon3dSunset key="sunset" size={24} />, <Icon3dMoon key="moon" size={24} />];
const seasonIcons = [<Icon3dSpring key="spring" size={20} />, <Icon3dSummer key="summer" size={20} />, <Icon3dAutumn key="autumn" size={20} />, <Icon3dWinter key="winter" size={20} />];
const cropIcons = {
  carrot: <Icon3dCarrot size={24} />,
  wheat: <Icon3dRiceSpike size={24} />,
  tomato: <Icon3dTomato size={24} />,
  strawberry: <Icon3dStrawberry size={24} />,
  pumpkin: <Icon3dFlower size={24} />,
  melon: <Icon3dSprout size={24} />,
  turnip: <Icon3dCarrot size={24} />,
};
const recipeIcons = { flour: <Icon3dFlourBowl size={24} />, cheese: <Icon3dCheese size={24} />, jam: <Icon3dJamJar size={24} /> };

const PANEL_INFO = {
  land: { badge: 'Bất Động Sản', title: 'Mua Đất & Quyền Sở Hữu' },
  livestock: { badge: 'Nông Trại Vui Vẻ', title: 'Chuồng Trại & Thú Nuôi' },
  shop: { badge: 'Nông Cụ & Hạt Giống', title: 'Cửa Hàng Nông Nghiệp' },
  inventory: { badge: 'Ba Lô & Kho Chứa', title: 'Kho Nông Sản' },
  quests: { badge: 'Thành Tích Mỗi Ngày', title: 'Bảng Nhiệm Vụ' },
  factory: { badge: 'Xưởng Chế Biến', title: 'Chế Biến Nông Sản' },
  upgrade: { badge: 'Mở Rộng & Nâng Cấp', title: 'Nâng Cấp Nông Trại' },
  city: { badge: 'Khu Trung Tâm', title: 'Thị Trấn Thung Lũng' },
  vehicles: { badge: 'Phương Tiện & Di Chuyển', title: 'Đại Lý Xe & Chổi Bay' },
  fishing: { badge: 'Câu Cá Ven Hồ', title: 'Cửa Hàng Lão Ngư' },
};

function HudImageIcon({ asset, className = '', alt = '' }) {
  return (
    <img
      className={`pt-hud-img-icon ${className}`}
      src={`/assets/hud/${asset}.webp`}
      alt={alt}
      loading="eager"
      decoding="async"
      draggable="false"
    />
  );
}

function playerFarmTarget(farmId) {
  const farm = WORLD_LAYOUT.farms.find(item => item.id === farmId) || WORLD_LAYOUT.farms[0];
  return { x: farm.x + 6, z: farm.z - 4 };
}

function createMeasuredWorld(...args) {
  const create = () => new FarmWorld(...args);
  return window.__farmDebug ? window.__farmDebug.measure('initial world construction', create) : create();
}

export default function App() {
  recordAppRender();
  const canvasRef = useRef(null);
  const worldRef = useRef(null);
  const joystickKnobRef = useRef(null);
  const progressRef = useRef(null);
  const gameClientRef = useRef(null);
  const pendingCharacterRef = useRef(null);
  const characterCreationRef = useRef(null);
  const [characterCreationPending, setCharacterCreationPending] = useState(false);
  const [characterCreationError, setCharacterCreationError] = useState('');
  const [status, setStatus] = useState('Đang khởi tạo thế giới…');
  const [statusVisible, setStatusVisible] = useState(true);
  useEffect(() => {
    setStatusVisible(true);
    const timer = setTimeout(() => setStatusVisible(false), 4500);
    return () => clearTimeout(timer);
  }, [status]);
  const [session, setSession] = useState(loadWorldSession);
  const sessionRef = useRef(session);
  sessionRef.current = session;
  const initialLocationRef = useRef(null);
  const [animals, setAnimals] = useState(initialLivestockState);
  const [progress, setProgress] = useState(loadProgress);
  const [panel, setPanel] = useState(null);
  const [activeTool, setActiveTool] = useState('hand');
  const [boot, setBoot] = useState({ phase: 'idle', error: '' });
  const [startRequested, setStartRequested] = useState(false);
  const [bootProgress, setBootProgress] = useState({ phase: 'init', percentage: 0, message: 'Đang khởi động thế giới 3D…', current: 0, total: 40 });
  const [debugEnabled, setDebugEnabled] = useState(() => new URLSearchParams(window.location.search).get('debug') === '1');
  const clockRef = useRef(Math.floor(Date.now() / 1000));
  const [timeMode, setTimeMode] = useState('auto');
  const [fishingWater, setFishingWater] = useState(null);
  const [fishingTick, setFishingTick] = useState(0);
  const [caughtFish, setCaughtFish] = useState(null);
  const fishingServerOffset = useRef(0);
  const fishingSessionId = useRef(null);
  const [network, setNetwork] = useState({ connected: false, phase: 'connecting', online: 1, queued: 0, attempt: 0 });
  const [casinoResult, setCasinoResult] = useState('');
  const [casinoState, setCasinoState] = useState(null);
  const [venueMode, setVenueMode] = useState(null);
  const [nearbyCasinoTable, setNearbyCasinoTable] = useState(null);
  const [chosenCasinoGame, setChosenCasinoGame] = useState('tai-xiu');
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
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [plazaNoticeOpen, setPlazaNoticeOpen] = useState(false);
  const [socialState, setSocialState] = useState({ friends: [], leaderboard: [] });
  const [gameStarted, setGameStarted] = useState(false);
  const [graphicsQuality, setGraphicsQuality] = useState(readGraphicsQuality);
  const [cameraViewMode, setCameraViewMode] = useState('explore');
  const [cameraCleanMode, setCameraCleanMode] = useState(false);
  const [targetDistance, setTargetDistance] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [currentFarmZone, setCurrentFarmZone] = useState(null);
  const [nearbyFarmGate, setNearbyFarmGate] = useState(null);
  const [theftProgress, setTheftProgress] = useState(null);
  const busTransitRef = useRef(null);

  const hasPendingNotifications =
    ORDERS.some(order => canFillOrder(progress, order)) ||
    QUESTS.some(quest => !progress.claimedQuests.includes(quest.id) && (progress.stats[quest.stat] || 0) >= quest.goal);

  progressRef.current = progress;

  useEffect(() => {
    worldRef.current?.setCasinoScreenActive?.(panel === 'casino');
    return () => worldRef.current?.setCasinoScreenActive?.(false);
  }, [panel]);

  useEffect(() => {
    if (!startRequested || !canvasRef.current) return undefined;
    let world;
    try {
      window.__farmDebug?.mark('Creating Babylon world');
      setBoot({ phase: 'loading', error: '' });
      world = createMeasuredWorld(canvasRef.current, setStatus, {
        initialLocation: initialLocationRef.current,
        onBootProgress: progressInfo => {
          setBootProgress(progressInfo);
          if (progressInfo.message) setStatus(progressInfo.message);
        },
        onReady: () => {
          window.__farmDebug?.ready();
          worldRef.current?.setLocalPlayerName(sessionRef.current.name);
          setBoot({ phase: 'ready', error: '' });
          setBootProgress(prev => ({ ...prev, percentage: 100, phase: 'ready', message: 'Thế giới đã sẵn sàng!' }));
          if (worldRef.current) { worldRef.current.cameraViewMode = cameraViewMode; worldRef.current.resetCameraView(); }
          if (progressRef.current?.customization) {
            worldRef.current?.setPlayerCustomization(progressRef.current.customization);
          } else {
            const outfit = outfits.find(item => item.id === progressRef.current?.outfit) || outfits[0];
            worldRef.current?.setPlayerOutfit(outfit.id, outfit.color);
          }
          worldRef.current?.setPlayerVehicle(progressRef.current?.vehicle || 'walk');
          worldRef.current?.setPlayerHomeTier(progressRef.current?.homeTier || 1);
          worldRef.current?.setClock(clockRef.current);
          gameClientRef.current?.send({ type: 'resync' });
        },
        onFatalError: message => {
          window.__farmDebug?.report(message || 'WebGL không thể dựng thế giới 3D', 'FATAL GAME ERROR');
          setBoot({ phase: 'error', error: message || 'WebGL không thể dựng thế giới 3D' });
        },
        getPlayerName: () => sessionRef.current.name,
        getVillageName: () => sessionRef.current.farmAddress?.villageName || 'Làng Hoa Mai',
        getPlayerFarmId: () => sessionRef.current.farmId,
        onLandInteract: farmId => { setFocusedLand(farmId); setPanel('land'); gameClientRef.current?.send({ type: 'resync' }); },
        getHomeTier: () => progressRef.current?.homeTier || 1,
        onFarmZoneChange: zone => setCurrentFarmZone(zone),
        onNearbyFarmGate: setNearbyFarmGate,
        onTheftProgress: setTheftProgress,
        onFarmGateAction: payload => gameClientRef.current?.sendGameAction('farm_gate', payload),
        onBusBoard: busId => gameClientRef.current?.joined ? gameClientRef.current.send({type:'bus_board',busId}) : false,
        onToolChange: tool => setActiveTool(tool),
        onHelpNeighbor: neighborFarmId => {
          setStatus(`Đang gửi xác nhận tưới giúp ${neighborFarmId} tới server…`);
        },
        onMailbox: mailbox => {
          gameClientRef.current?.sendMailboxHeart(mailbox.id);
          emitReward({ text: '+1 Tim Khen Vườn', icon: <Icon3dHeartReaction size={20} />, color: '#ef4444' });
          farmAudio.playFanfare();
          setStatus(`Đã gửi lời khen đến nông trại của ${mailbox.owner}!`);
        },
        onNetworkAction: data => gameClientRef.current?.sendFarmAction(data),
        getCrop: () => progressRef.current?.selectedCrop || 'carrot',
        getUnlockedPlots: () => progressRef.current?.unlockedPlots ?? 0,
        getOutfitId: () => progressRef.current?.outfit || 'starter',
        getOutfitColor: () => (outfits.find(item => item.id === progressRef.current?.outfit) || outfits[0]).color,
        getCustomization: () => progressRef.current?.customization || null,
        getVehicle: () => progressRef.current?.vehicle || 'walk',
        getPlayerSpeed: () => vehicles.find(vehicle => vehicle.id === progressRef.current?.vehicle)?.speed || 7,
        onVenue: venue => setPanel(venue === 'supplies' ? 'shop' : venue),
        onLeaderboard: () => {
          gameClientRef.current?.send({ type: 'get_social_state' });
          setLeaderboardOpen(true);
        },
        onPlazaNotice: () => setPlazaNoticeOpen(true),
        onVenueState: (venue, label) => {
          setVenueMode(venue ? { venue, label } : null);
          if (venue !== 'casino') setNearbyCasinoTable(null);
        },
        onCasinoTable: tableGame => {
          setChosenCasinoGame(tableGame);
          setPanel('casino');
        },
        onNearbyCasinoTable: (tableGame, label) => {
          setNearbyCasinoTable(tableGame ? { game: tableGame, label } : null);
        },
        onRegionChange: setWorldRegion,
        onQualityChange: setGraphicsQuality,
        onBusTransitChange: status => { busTransitRef.current = transitHudSnapshot(status); },
        onNpcInteract: npcId => {
          if (npcId === 'beach_fisher') { setPanel('fishing'); return; }
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
  }, [startRequested]);

  useEffect(() => {
    worldRef.current?.setLocalPlayerName(session.name);
  }, [session.name]);

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
        setNetwork(previous => previous.online === players.length + 1 ? previous : ({ ...previous, online: players.length + 1 }));
        worldRef.current?.syncRemotePlayers(players, serverTime);
      },
      onMoveAck: state => { if(state.busRejected)worldRef.current?.alightBus();worldRef.current?.correctPlayerPosition(state); },
      onCasinoState: state => {
        setCasinoState(state);
        if (worldRef.current) worldRef.current.casinoStateReceivedAt = Date.now();
        worldRef.current?.setCasinoRoom(state.mine || null);
      },
      onSocialState: state => {
        setSocialState(state);
      },
      onFarmSync: farms => {
        worldRef.current?.applyRemoteFarmSync(farms);
      },
      onFarmGate: update => {
        worldRef.current?.applyFarmGate(update);
        if (update.farmId === sessionRef.current?.farmId) setStatus(update.open ? 'Cổng đã mở. Người khác có thể vào vườn.' : 'Cổng đã đóng. Vườn được bảo vệ.');
      },
      onTheftPending: pending => worldRef.current?.farming?.beginTheftCountdown(pending),
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
          emitReward({ text: `${notice.fromName} khen nông trại!`, icon: <Icon3dHeartReaction size={20} />, color: '#ec4899' });
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
        if (characterCreationRef.current) {
          characterCreationRef.current = null;
          setCharacterCreationPending(false);
          setCharacterCreationError(message);
        }
        setLandPending(false);
        worldRef.current?.farming?.clearPendingActions?.();
        setStatus(`Lỗi: ${message}`);
        setCasinoResult(message);
        if (worldRef.current) worldRef.current.casinoLastError = message;
      },
      onAccountState: state => {
        if (state.serverNow) fishingServerOffset.current = state.serverNow - Date.now();
        if (state.result?.communityReward) {
          const reward=state.result.communityReward;
          emitReward({text:`+${reward.coins} Xu`,icon:<Icon3dGoldCoin size={20}/>,color:'#f59e0b'});
          farmAudio.playFanfare();setStatus(`Server xác nhận thưởng +${reward.coins} xu.`);
        }
        if (state.result?.fashionUpdated) { setStatus('Server đã lưu và trang bị diện mạo.');setPanel(null); }
        if (characterCreationRef.current && state.progress?.onboarding?.characterCreated) {
          const created = characterCreationRef.current;
          characterCreationRef.current = null;
          setCharacterCreationPending(false);
          setSession(prev => { const next = { ...prev, name: created.name, avatarIcon: 'starter' }; saveWorldSession(next); return next; });
          setVillageRequired(false);
          setStatus(`Chào mừng ${created.name}! Hãy gặp Oliver tại quảng trường.`);
        }
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
          const fishingOnly = state.result?.fishingUpdated;
          setProgress(state.progress);
          progressRef.current = state.progress;
          if (!fishingOnly) worldRef.current?.setPlayerVehicle(state.progress.vehicle || 'walk');
          if (!fishingOnly) worldRef.current?.setPlayerHomeTier(state.progress.homeTier || 1);
          if (!fishingOnly && state.progress.customization) {
            worldRef.current?.setPlayerCustomization(state.progress.customization);
          } else if (!fishingOnly) {
            const serverOutfit = outfits.find(item => item.id === state.progress.outfit) || outfits[0];
            worldRef.current?.setPlayerOutfit(serverOutfit.id, serverOutfit.color);
          }
          if (!fishingOnly) worldRef.current?.refreshFarm?.();
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
        if (state.progress?.fishing?.pending) {
          setPanel(null);
          const pending = state.progress.fishing.pending;
          if (fishingSessionId.current !== pending.id) {
            fishingSessionId.current = pending.id;
            worldRef.current?.startFishingCast({distance:pending.castDistance,animation:FISHING_CONFIG.rods[pending.rodId]?.animation,target:pending.target});
          }
          worldRef.current?.setFishingPhase?.(pending.phase === 'fighting' ? 'reel' : Date.now()+fishingServerOffset.current >= pending.biteAt ? 'bite' : 'waiting');
        } else if (state.result?.fishCaught) {
          fishingSessionId.current = null;
          setCaughtFish(state.result);
          worldRef.current?.finishFishingCatch?.(true, LAKE_FISH[state.result.fishCaught]);
          const fish = LAKE_FISH[state.result.fishCaught];
          const weight = Number(state.result.weight || 0).toFixed(2);
          setStatus(`Câu được ${fish?.name || 'một con cá'} · ${weight} kg · +${state.result.value || fish?.price || 0} xu giá trị`);
        }
        if (!state.progress?.fishing?.pending && !state.result?.fishCaught) { fishingSessionId.current=null;worldRef.current?.clearFishing?.(); }
        if (state.result?.fishEscaped) setStatus(state.result.fishEscaped);
        if (state.result?.fishSold) setStatus(`Đã bán ${state.result.fishSold.count} con cá · +${state.result.fishSold.coins} xu.`);
        if (state.result?.casinoBet) setCasinoResult(state.result.casinoBet.amount ? `Đã giữ ${state.result.casinoBet.amount} xu cho ván.` : 'Đã hủy cược và hoàn xu.');
        if (state.result?.casinoSettlement) {
          const { reward, amount } = state.result.casinoSettlement;
          setCasinoResult(reward === amount ? `Hoàn lại ${reward} xu` : reward > amount ? `Nhận ${reward} xu · lãi ${reward - amount} xu` : `Nhận ${reward} xu · giảm ${amount - reward} xu`);
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

  const handleToggleTime = useCallback(() => {
    const modes = ['auto', 'night', 'dusk', 'day', 'dawn'];
    const nextIdx = (modes.indexOf(timeMode) + 1) % modes.length;
    const nextMode = modes[nextIdx];
    setTimeMode(nextMode);

    let targetClock = Math.floor(Date.now() / 1000);
    if (nextMode === 'night') targetClock = 210;
    else if (nextMode === 'dusk') targetClock = 150;
    else if (nextMode === 'day') targetClock = 80;
    else if (nextMode === 'dawn') targetClock = 25;

    clockRef.current = targetClock;
    worldRef.current?.setClock(targetClock);
    setStatus(
      nextMode === 'night' ? 'Chuyển sang Ban Đêm: Thưởng thức đèn đường lung linh!'
      : nextMode === 'dusk' ? 'Chuyển sang Hoàng Hôn lãng mạn'
      : nextMode === 'day' ? 'Chuyển sang Ban Ngày ngập nắng'
      : nextMode === 'dawn' ? 'Chuyển sang Bình Minh sớm'
      : 'Chuyển sang chu kỳ thời gian tự động'
    );
  }, [timeMode]);

  useEffect(() => {
    const timer = window.setInterval(function updateWorldClock() {
      let now = clockRef.current;
      if (timeMode === 'auto') {
        now = Math.floor(Date.now() / 1000);
        clockRef.current = now;
      }
      if (window.__farmDebug) window.__farmDebug.measure('clock: atmosphere.setTime', () => worldRef.current?.setClock(now));
      else worldRef.current?.setClock(now);
      const position = worldRef.current?.getPlayerState?.();
      const nextFishing = position && !position.venue ? fishingWaterAt(position.x, position.z) : null;
      setFishingWater(prev => (prev === nextFishing ? prev : nextFishing));
      const pending = progressRef.current?.fishing?.pending;
      if (pending) {
        setFishingTick(tick => tick + 1);
        worldRef.current?.setFishingPhase?.(pending.phase === 'fighting' ? 'reel' : Date.now()+fishingServerOffset.current >= pending.biteAt ? 'bite' : 'waiting');
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [timeMode]);

  // Đồng bộ camera và vị trí ngồi 3D khi vào bàn chơi Casino
  useEffect(() => {
    if (venueMode?.venue === 'casino') {
      if (panel === 'casino' && casinoState?.mine?.game) {
        worldRef.current?.focusCasinoTable(casinoState.mine.game);
      } else if (panel === 'casino' || !panel) {
        worldRef.current?.focusCasinoTable(null);
      }
    }
  }, [panel, casinoState?.mine?.game, chosenCasinoGame, venueMode?.venue]);

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
      } else if (event.code === 'KeyP') {
        event.preventDefault();
        setPhoneOpen(prev => !prev);
      } else if (event.code === 'Escape') {
        setPhoneOpen(false);
        setPanel(null);
      }
    };
    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, []);


  const animalStatus = livestockSummary(animals);
  const chickenCount = animals.filter(animal => animal.species === 'chicken').length;
  const cowCount = animals.filter(animal => animal.species === 'cow').length;
  const sheepCount = animals.filter(animal => animal.species === 'sheep').length;
  const feedAnimals = () => {
    farmAudio.playPop();
    gameClientRef.current?.sendGameAction('feed_animals');
    setStatus('Server đang xử lý thức ăn vật nuôi…');
  };
  const collectAnimals = () => {
    farmAudio.playCoins();
    gameClientRef.current?.sendGameAction('collect_animals');
    setStatus('Server đang thu sản phẩm vật nuôi…');
  };
  const chooseCrop = crop => {
    if (progress.level < crop.level) { setStatus(`${crop.name} mở khóa ở cấp ${crop.level}`); return; }
    farmAudio.playPop();
    gameClientRef.current?.sendGameAction('select_crop', { crop: crop.id });
    if (worldRef.current?.canUseFarmTools()) selectTool('seed');
    setPanel(null);
    setStatus(worldRef.current?.canUseFarmTools()
      ? `Đã chọn hạt ${crop.name} · giá ${crop.seedCost} xu`
      : `Đã chọn hạt ${crop.name}. Về nông trại để gieo.`);
  };
  const sellItem = (id, amount = 1) => {
    const crop = CROPS[id];
    if (!crop || progress.inventory[id] < amount) return;
    farmAudio.playCoins();
    gameClientRef.current?.sendGameAction('sell_item', { id, amount });
    setStatus(`Server đang bán ${amount} ${crop.name}…`);
  };
  const deliverOrder = order => {
    if (!canFillOrder(progress, order) || progress.completedOrders.includes(order.id)) return;
    farmAudio.playFanfare();
    gameClientRef.current?.sendGameAction('deliver_order', { id: order.id });
    setStatus(`Server đang giao đơn “${order.title}”…`);
  };
  const claimQuest = quest => {
    if (progress.stats[quest.stat] < quest.goal || progress.claimedQuests.includes(quest.id)) return;
    farmAudio.playFanfare();
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
    farmAudio.playPop();
    gameClientRef.current?.sendGameAction('craft', { id: recipe.id });
    setStatus(`Server đang chế biến ${recipe.name}…`);
  };
  const sellProduct = (id, price, name) => {
    if (!progress.inventory[id]) return;
    farmAudio.playCoins();
    gameClientRef.current?.sendGameAction('sell_product', { id });
    setStatus(`Server đang bán ${name}…`);
  };
  const upgradeLand = () => {
    const expansion = EXPANSIONS.find(item => item.plots > progress.unlockedPlots);
    if (!expansion) { setStatus('Nông trại đã đạt tối đa 48 ô'); return; }
    if (progress.level < expansion.level || progress.coins < expansion.cost) { setStatus(`Cần cấp ${expansion.level} và ${expansion.cost} xu để mở rộng`); return; }
    farmAudio.playFanfare();
    gameClientRef.current?.sendGameAction('upgrade_land');
    setStatus('Server đang mở rộng đất…');
  };
  const upgradeBarn = () => {
    const cost = farmBarnUpgradeCost(progress.barnLevel);
    if (progress.coins < cost) { setStatus(`Cần ${cost} xu để nâng kho`); return; }
    farmAudio.playFanfare();
    gameClientRef.current?.sendGameAction('upgrade_barn');
    setStatus('Server đang nâng cấp kho…');
  };
  const upgradeHome = () => {
    const cost = 1800;
    const requiredLevel = 4;
    if ((progress.homeTier || 1) >= 2) { setStatus('Nhà của bạn đã đạt cấp hiện có cao nhất'); return; }
    if (progress.level < requiredLevel || progress.coins < cost) { setStatus(`Cần cấp ${requiredLevel} và ${cost} xu để mua Nhà Nông Trại Ấm Cúng`); return; }
    farmAudio.playFanfare();
    gameClientRef.current?.sendGameAction('upgrade_home');
    setStatus('Server đang nâng cấp nhà…');
  };
  const resetOrders = () => {
    if (progress.completedOrders.length < ORDERS.length || progress.coins < 25) return;
    gameClientRef.current?.sendGameAction('reset_orders');
    setStatus('Server đang làm mới đơn hàng…');
  };
  const travelTo = destination => {
    if (destination.id === 'farm' && !session.farmId) { setFocusedLand(null); setPanel('land'); setStatus('Bạn cần mua một lô đất trước.'); return; }
    const target = destination.id === 'farm'
      ? { ...destination, ...playerFarmTarget(session.farmId) }
      : destination.id === 'town' ? { ...destination, ...TOWN_SPAWN } : destination;
    if (!worldRef.current?.travelTo(target)) return;
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
  const casinoAction = payload => {
    if (worldRef.current) {
      worldRef.current.casinoLastAction = { kind: payload.kind, at: Date.now() };
      worldRef.current.casinoLastError = null;
    }
    if (venueMode?.venue !== 'casino') {
      worldRef.current?.enterVenue('casino', true);
    }
    gameClientRef.current?.sendGameAction('casino', payload);
    setCasinoResult('');
  };
  const fishingCast = () => {
    if (!network.connected || progress.fishing?.pending) return;
    if (!fishingWater) { setStatus('Hãy đứng sát bờ nước để thả câu.'); return; }
    if (!progress.fishing?.equippedRod) { setStatus('Hãy mua và trang bị cần câu trước.'); return; }
    gameClientRef.current?.sendGameAction('fishing_cast');
    setPanel(null);
    setStatus('Đã giăng câu · chờ phao rung…');
  };
  const fishingReel = () => {
    worldRef.current?.playFishingReel?.();
    gameClientRef.current?.sendGameAction('fishing_reel', {sessionId:progress.fishing?.pending?.id});
    setStatus('Đang giật cần…');
  };
  const fishingSellAll = () => {
    if (!fishingInventoryCount(progress.fishing)) return;
    gameClientRef.current?.sendGameAction('fishing_sell_all');
    setStatus('Đang bán toàn bộ cá cho Lão Ngư…');
  };
  const selectTool = tool => {
    if (tool !== 'hand' && !worldRef.current?.canUseFarmTools()) {
      setStatus('Công cụ canh tác chỉ dùng tại nông trại của bạn.');
      return;
    }
    setActiveTool(tool);
    worldRef.current?.setTool(tool);
  };

  // Onboarding handlers
  const handleCharacterCreation = data => {
    if (characterCreationRef.current) return;
    if (!network.connected) { setCharacterCreationError('Chưa kết nối server. Vui lòng thử lại.'); return; }
    characterCreationRef.current = { name: data.name.trim() };
    setCharacterCreationPending(true);
    setCharacterCreationError('');
    gameClientRef.current?.sendGameAction('character_create', { name: data.name.trim(), outfit: 'starter' });
  };

  const handleClaimSeeds = () => {
    if (!session.farmId) { setDialogueOpen(false); setFocusedLand(null); setPanel('land'); return; }
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
    if (!worldRef.current?.farming || !worldRef.current?.canUseFarmTools()) return;
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
    if (panelId === 'land') setFocusedLand(null);
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
  const nearbyLot = !panel && !session.farmId && currentFarmZone
    ? landLots.find(lot => lot.farmId === currentFarmZone.farmId && lot.available)
    : null;
  const contextAction = panel || venueMode || !gameStarted ? null : nearbyFarmGate ? {
    label: nearbyFarmGate.open ? 'Đóng cổng' : 'Mở cổng',
    hint: 'Cổng nông trại · E',
    onClick: () => network.connected && worldRef.current?.interactFarmGate(),
  } : nearbyLot ? {
    label: `Xem lô đất ${currentFarmZone.lotNumber}`,
    hint: 'Kiểm tra giá và mua',
    onClick: () => { setFocusedLand(currentFarmZone.farmId); setPanel('land'); gameClientRef.current?.send({ type: 'resync' }); },
  } : fishingWater ? (progress.fishing?.equippedRod ? null : {
    label: `Câu cá · ${FISHING_WATER_NAMES[fishingWater]}`,
    hint: 'Trang bị cần câu để bắt đầu',
    onClick: () => setPanel('fishing'),
  }) : currentFarmZone?.isOwner ? {
    label: 'Chăm sóc cây',
    hint: 'Tự chọn thao tác phù hợp · E',
    onClick: () => {
      const world = worldRef.current;
      if (network.connected && world?.canUseFarmTools() && world.player) world.farming?.interactNearest(world.player.root.position);
    },
  } : !session.farmId && progress.onboarding?.characterCreated ? {
    label: 'Chọn đất nông trại',
    hint: 'Xem các lô đất đang bán',
    onClick: () => { setFocusedLand(null); setPanel('land'); },
  } : null;

  return (
    <main className={`game-shell pt-game-shell compact-game-hud${venueMode ? ' in-venue' : ''}${panel || phoneOpen || dialogueOpen || guideOpen || celebrationOpen || roadsideOpen || leaderboardOpen || plazaNoticeOpen || showCharacterCreation ? ' hud-modal-open' : ''}`}>
      <canvas ref={canvasRef} className="game-canvas" tabIndex={0} onPointerDown={event => event.currentTarget.focus({ preventScroll: true })} aria-label="Thế giới nông trại 3D" />
      {gameStarted && boot.phase === 'ready' && (!panel || progress.fishing?.pending) && <FishingHUD fishing={progress.fishing} connected={network.connected} water={fishingWater} cast={fishingCast} send={(action,payload)=>gameClientRef.current?.sendGameAction(action,payload)} serverOffset={fishingServerOffset.current} caught={caughtFish} clearCaught={()=>setCaughtFish(null)} />}
      {/* Play Together Title & Start Screen */}
      {!gameStarted && (
        <GameStartScreen
          bootPhase={boot.phase}
          bootError={boot.error}
          bootProgress={bootProgress}
          onRequestStart={() => setStartRequested(true)}
          onBeginExit={() => {
            worldRef.current?.playStartCinematic?.();
          }}
          onStart={() => {
            if (boot.phase !== 'ready' || bootProgress.percentage < 100) return;
            setGameStarted(true);
            farmAudio.playFanfare();
          }}
          isMuted={isMuted}
          onToggleMute={() => {
            const muted = farmAudio.toggleMute();
            setIsMuted(muted);
            setStatus(muted ? 'Đã tắt âm thanh' : 'Đã bật âm thanh thế giới');
          }}
          graphicsQuality={graphicsQuality}
          onToggleGraphics={() => {
            const nextPreset = ({ auto: 'ultra', ultra: 'balanced', balanced: 'eco', eco: 'auto' })[graphicsQuality] || 'auto';
            setGraphicsQuality(nextPreset);
            worldRef.current?.setGraphicsQuality(nextPreset);
            setStatus(nextPreset === 'auto' ? 'Auto: ưu tiên hình nét, tự giảm hiệu ứng khi máy chậm' : nextPreset === 'ultra' ? 'Ultra: độ phân giải cố định, hiệu ứng cao — có thể giảm FPS' : nextPreset === 'balanced' ? 'Cân bằng' : 'Tiết kiệm pin');
          }}
        />
      )}

      {debugEnabled && <LiveWorldDebug worldRef={worldRef} />}
      {venueMode && (
        <section className="venue-banner">
          <div className="venue-banner-content">
            <b>{venueMode.label}</b>
            {nearbyCasinoTable ? (
              <span className="venue-table-badge">Đang đứng trước <strong>{nearbyCasinoTable.label}</strong></span>
            ) : (
              <span>{venueMode.venue === 'casino' ? 'Tiến lại gần 4 bàn 3D hoặc bấm trực tiếp vào bàn để chơi' : 'Chọn thao tác hoặc đến gần quầy rồi nhấn E'}</span>
            )}
          </div>
          <div className="venue-banner-actions">
            {venueMode.venue === 'casino' && nearbyCasinoTable ? (
              <button
                type="button"
                className="venue-play-btn"
                onClick={() => {
                  setChosenCasinoGame(nearbyCasinoTable.game);
                  setPanel('casino');
                }}
              >
                Chơi {nearbyCasinoTable.label} (E)
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setPanel(venueMode.venue === 'supplies' ? 'shop' : venueMode.venue)}
              >
                {venueMode.venue === 'casino' ? 'Danh sách bàn & Đổi thưởng' : 'Nói chuyện với chủ tiệm'}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setPanel(null);
                worldRef.current?.exitVenue();
              }}
            >
              Ra cửa hàng
            </button>
          </div>
        </section>
      )}

      {gameStarted && !cameraCleanMode && (
        <>
          {/* PLAY TOGETHER STANDARD TOPBAR */}
          <header className="topbar pt-topbar">
        {/* Left: Player Profile Card with 3D Level Star & Jelly EXP */}
        <div className="pt-profile-card" onClick={() => setGuideOpen(true)} title="Bấm để mở Cẩm Nang Nông Trại">
          <div className="pt-avatar-ring">
            <HudImageIcon asset="farmer-avatar" className="pt-avatar-img" alt="" />
            <div className="pt-level-star" title={`Cấp độ nông dân: ${progress.level}`}>
              <Icon3dStar size={14} />
              <span>{progress.level}</span>
            </div>
          </div>
          <div className="pt-profile-info">
            <div className="pt-name-row">
              <strong className="pt-player-name">{session.name}</strong>
              <span className="pt-role-pill">
                {vehicles.find(vehicle => vehicle.id === progress.vehicle)?.icon || <Icon3dWalk size={15} />}
                <small>{progress.vehicle === 'walk' ? 'Nông Dân' : vehicles.find(vehicle => vehicle.id === progress.vehicle)?.name}</small>
              </span>
            </div>
            <div className="pt-exp-wrap" title={`Kinh nghiệm: ${progress.xp} XP`}>
              <div className="pt-exp-track">
                <div
                  className="pt-exp-jelly"
                  style={{
                    width: `${Math.min(100, Math.max(5, Math.round(((progress.xp - levelFloor(progress.level)) / Math.max(1, levelCeiling(progress.level) - levelFloor(progress.level))) * 100)))}%`
                  }}
                />
              </div>
              <span className="pt-exp-val">
                {Math.round(((progress.xp - levelFloor(progress.level)) / Math.max(1, levelCeiling(progress.level) - levelFloor(progress.level))) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Center: Floating Weather & Island/Village Capsule */}
        <details className="pt-island-capsule">
          <summary className="pt-island-badge" title="Thông tin khu vực và thời gian">
            <Icon3dVillageGate size={18} />
            <b>{session.farmAddress?.villageName || worldRegion?.village?.name || 'Thung Lũng Bình Minh'}</b>
          </summary>
          <GameClock timeMode={timeMode} onToggleTime={handleToggleTime} />
        </details>

        {/* Right: Candy Currency Dock & System Bubbles */}
        <div className="pt-currency-dock">
          {/* Gold Coin Candy Pill */}
          <div className="pt-candy-pill pt-gold-pill" onClick={() => setPanel('shop')} title="Đồng vàng nông trại (Bấm để mở Cửa Hàng)">
            <div className="pt-pill-icon"><HudImageIcon asset="coin" alt="" /></div>
            <span className="pt-pill-val">{progress.coins.toLocaleString('vi-VN')}</span>
            <button type="button" className="pt-pill-plus" aria-label="Mở cửa hàng vật tư" onClick={e => { e.stopPropagation(); setPanel('shop'); }}>
              <Icon3dPlus size={14} />
            </button>
          </div>

          {/* Free Seeds Pill */}
          {progress.freeSeeds > 0 && (
            <div className="pt-candy-pill pt-seed-pill" title="Hạt giống cà rốt miễn phí">
              <div className="pt-pill-icon"><Icon3dCarrot size={22} /></div>
              <span className="pt-pill-val">{progress.freeSeeds}</span>
            </div>
          )}

          {/* Gems Candy Pill */}
          <div className="pt-candy-pill pt-gem-pill" title="Đá quý xanh">
            <div className="pt-pill-icon"><HudImageIcon asset="gem" alt="" /></div>
            <span className="pt-pill-val">{progress.gems}</span>
          </div>

          {/* Fashion Boutique Quick Button */}
          <button
            type="button"
            className="pt-candy-btn pt-fashion-btn"
            onClick={() => setPanel('fashion')}
            aria-label="Mở tiệm thời trang"
            title="Thời Trang & Tủ Đồ Play Together"
          >
            <Icon3dFashionLogo size={24} />
            <span className="pt-btn-label">Thời Trang</span>
          </button>

          <button type="button" className="pt-candy-btn pt-phone-btn" onClick={() => setPhoneOpen(true)} aria-label="Mở menu" title="Menu (P)">
            <Icon3dSmartPhone size={26} />
            <span className="pt-btn-label">Menu</span>
            {hasPendingNotifications && <i className="pt-menu-ping" />}
          </button>
        </div>
      </header>

      {/* Play Together Authentic Beginner Quest HUD Tracker */}
      {!showCharacterCreation && progress.onboarding && !progress.onboarding.completed && (
        <OnboardingHUD
          progress={progress}
          targetDistance={targetDistance}
          onNavigateTarget={() => {
            const myFarm = WORLD_LAYOUT.farms.find(f => f.id === session.farmId) || WORLD_LAYOUT.farms[0];
            if (myFarm && worldRef.current) {
              worldRef.current.setObjective({ x: myFarm.x, y: 0, z: myFarm.z });
              setStatus('Đang dẫn đường tới ô ruộng của bạn!');
            }
          }}
          onTalkToElder={() => {
            setDialogueOpen(true);
          }}
          onOpenGuide={() => setGuideOpen(true)}
          onOpenOrders={() => setPanel('orders')}
        />
      )}

      {/* Dismount Bubble */}
      {gameStarted && !showCharacterCreation && !venueMode && !panel && (
        <VehicleQuickMenu vehicles={vehicles} owned={progress.ownedVehicles || []} current={progress.vehicle || 'walk'} connected={network.connected} onSelect={buyVehicle} />
      )}

      {/* Action Controls & Virtual Joystick */}
      {!showCharacterCreation && (
        <>
          <div className="virtual-joystick pt-joystick" role="group" aria-label="Điều khiển di chuyển" onPointerDown={startJoystick} onPointerMove={event => event.currentTarget.hasPointerCapture(event.pointerId) && updateJoystick(event)} onPointerUp={stopJoystick} onPointerCancel={stopJoystick}>
            <span ref={joystickKnobRef} className="pt-joystick-knob">●</span>
          </div>
          <div className="world-action-controls pt-action-bubbles">
            <button type="button" className="pt-action-bubble pt-jump-bubble" onClick={() => worldRef.current?.jumpPlayer()} aria-label="Nhảy" title="Nhảy (Phím Cách)">
              <i><HudImageIcon asset="jump" alt="" /></i>
              <b>Nhảy</b>
            </button>
            <button
              type="button"
              className="pt-action-bubble pt-run-bubble"
              onPointerDown={() => worldRef.current?.setSprinting(true)}
              onPointerUp={() => worldRef.current?.setSprinting(false)}
              onPointerCancel={() => worldRef.current?.setSprinting(false)}
              onPointerLeave={() => worldRef.current?.setSprinting(false)}
              aria-label="Chạy nhanh"
              title="Chạy nhanh (Giữ Shift)"
            >
              <i><HudImageIcon asset="sprint" alt="" /></i>
              <b>Chạy</b>
            </button>
          </div>
        </>
      )}

      {/* Floating Indicator when walking inside a Farm Estate */}
      {theftProgress && <aside className="farm-theft-progress" role="status"><b>Đang lấy nông sản</b><small>Đứng yên · di chuyển để hủy</small><div><i style={{ animationDuration: `${theftProgress.durationMs}ms` }} /></div></aside>}
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

      <HudContextAction action={contextAction} />

      {currentFarmZone?.isOwner && !venueMode && <section className="livestock-card">
        <button type="button" className="livestock-action-btn" onClick={() => setPanel('livestock')}>Quản lý chăn nuôi · {animals.length} con</button>
        <div className="livestock-info">
          <span className="animal-tag" title={`${chickenCount} Gà mái`}><Icon3dChicken size={22} /> <b>{chickenCount}</b></span>
          <span className="animal-tag" title={`${cowCount} Bò sữa`}><Icon3dCow size={22} /> <b>{cowCount}</b></span>
          <span className="animal-tag" title={`${sheepCount} Cừu`}><Icon3dSheep size={22} /> <b>{sheepCount}</b></span>
          <b>{animals.length === 0 ? 'Chưa có vật nuôi' : animalStatus.ready ? `${animalStatus.ready} sản phẩm sẵn sàng` : animalStatus.hungry ? `${animalStatus.hungry} con đang đói` : 'Đang sản xuất'}</b>
        </div>
        {animals.length > 0 && (
          <button type="button" className="livestock-action-btn" onClick={animalStatus.ready ? collectAnimals : feedAnimals}>
            {animalStatus.ready ? <><Icon3dBasket size={18} /> Thu hoạch</> : <><Icon3dCorn size={18} /> Cho ăn</>}
          </button>
        )}
      </section>}

      {/* Play Together Chunky 3D Tool Dock (Hotbar) */}
      {currentFarmZone?.isOwner && !venueMode && <footer className="hotbar pt-hotbar">
        <div className="pt-active-tool-banner">
          <span className="pt-banner-name">
            {activeTool === 'hand' && 'Bàn tay · Tương tác'}
            {activeTool === 'hoe' && 'Cuốc đất · Tạo luống'}
            {activeTool === 'seed' && `Gieo hạt · ${CROPS[progress.selectedCrop]?.name || 'Cà rốt'}`}
            {activeTool === 'water' && 'Bình tưới · Cấp ẩm'}
            {activeTool === 'harvest' && 'Giỏ thu hoạch · Hái củ quả'}
          </span>
        </div>
        <div className="pt-tool-slots-container">
          {[
            { id: 'hand', label: 'Bàn tay', icon: <Icon3dHand size={42} /> },
            { id: 'hoe', label: 'Cuốc đất', icon: <Icon3dHoe size={42} /> },
            { id: 'seed', label: 'Gieo hạt', icon: <Icon3dSeeds size={42} /> },
            { id: 'water', label: 'Tưới nước', icon: <Icon3dWateringCan size={42} /> },
            { id: 'harvest', label: 'Thu hoạch', icon: <Icon3dBasket size={42} /> },
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
                className={`hotbar-slot pt-tool-slot ${activeTool === tool ? 'selected pt-active-slot' : ''} ${isRecommended ? 'recommended-tool pt-recommended' : ''}`}
                key={tool}
                type="button"
                onClick={() => selectTool(tool)}
                aria-label={item.label}
                title={`${item.label} (Phím [${index + 1}])`}
              >
                <span className="slot-key pt-key-bubble">{index + 1}</span>
                <div className="slot-icon-wrap pt-tool-icon-frame">{item.icon}</div>
                {isRecommended && <i className="tool-glow pt-tool-glow" />}
              </button>
            );
          })}
        </div>
      </footer>}

      {/* Play Together Real-time 360 GPS Radar Minimap */}
      {!venueMode && !cameraCleanMode && gameStarted && (
        <button type="button" className="hud-map-button" onClick={() => handleMenuClick('map')} aria-label="Mở bản đồ" title="Bản đồ thế giới"><Icon3dMap size={24} /></button>
      )}

      {/* Play Together Photo Mode / Clean View Controller */}
      {cameraCleanMode && (
        <div className="pt-photo-mode-controller">
          <button
            type="button"
            className="pt-photo-shutter-btn"
            onClick={() => {
              farmAudio.playFanfare();
              setStatus('Đã chụp ảnh kỷ niệm góc nhìn điện ảnh!');
              const flash = document.createElement('div');
              flash.className = 'pt-screen-flash';
              document.body.appendChild(flash);
              setTimeout(() => flash.remove(), 600);
            }}
          >
            <i><Icon3dSparkleStar size={20} /></i>
            <span>Chụp Ảnh</span>
          </button>
          <button
            type="button"
            className="pt-photo-exit-btn"
            onClick={() => setCameraCleanMode(false)}
            title="Thoát chế độ chụp ảnh"
          >
            <span>✕ Thoát Chụp Ảnh</span>
          </button>
        </div>
      )}

      {/* Play Together Kaia Smartphone OS Device Modal */}
      {phoneOpen && (
        <div className="pt-phone-backdrop" onClick={() => setPhoneOpen(false)}>
          <div className="pt-phone-device" onClick={event => event.stopPropagation()}>
            <div className="pt-phone-notch" />

            <div className="pt-phone-status-bar">
              <span className="pt-phone-clock">
                <GameClock compact timeMode={timeMode} onToggleTime={handleToggleTime} />
              </span>
              <div className="pt-phone-status-right">
                <span className="pt-phone-signal">5G ●●●●</span>
                <span className="pt-phone-battery"><Icon3dBatteryEco size={16} /> 100%</span>
                <button type="button" className="pt-phone-close" onClick={() => setPhoneOpen(false)} aria-label="Đóng điện thoại">×</button>
              </div>
            </div>

            <div className="pt-phone-user-strip">
              <div className="pt-phone-avatar-bubble">
                <Icon3dCrown size={22} />
              </div>
              <div className="pt-phone-greeting">
                <b>{session.name || 'Nông Dân Kaia'}</b>
                <small>Cấp {progress.level} · {session.farmAddress?.villageName || 'Thung Lũng Bình Minh'}</small>
              </div>
            </div>

            <div className="pt-phone-app-grid">
              <button type="button" className="pt-app-bubble" onClick={() => { setPhoneOpen(false); handleMenuClick('inventory'); }}>
                <div className="pt-app-icon"><Icon3dBackpack size={32} /></div><span>Túi đồ</span>
              </button>
              <button
                type="button"
                className="pt-app-bubble app-fashion"
                onClick={() => { setPhoneOpen(false); setPanel('fashion'); }}
                title="Tiệm Thời Trang & Tủ Đồ Play Together"
              >
                <div className="pt-app-icon"><Icon3dFashionLogo size={32} /></div>
                <span>Thời Trang</span>
              </button>
              <button type="button" className="pt-app-bubble" onClick={() => { setPhoneOpen(false); setCameraCleanMode(true); setStatus('Chế độ chụp ảnh · HUD đã ẩn'); }}>
                <div className="pt-app-icon"><HudImageIcon asset="camera" alt="" /></div><span>Chụp ảnh</span>
              </button>
              <button
                type="button"
                className="pt-app-bubble app-land"
                onClick={() => { setPhoneOpen(false); setFocusedLand(null); setPanel('land'); }}
              >
                <div className="pt-app-icon"><Icon3dHouseCabin size={32} /></div>
                <span>{session.farmId ? 'Đất Đai' : 'Mua Đất'}</span>
              </button>

              <button
                type="button"
                className="pt-app-bubble app-orders"
                onClick={() => { setPhoneOpen(false); handleMenuClick('orders'); }}
              >
                <div className="pt-app-icon">
                  {isFeatureLocked(progress, 'orders') ? <Icon3dLock size={26} /> : <Icon3dOrdersBox size={32} />}
                  {ORDERS.some(order => canFillOrder(progress, order)) && <span className="pt-app-badge">!</span>}
                </div>
                <span>Đơn Hàng</span>
              </button>

              <button
                type="button"
                className="pt-app-bubble app-market"
                onClick={() => { setPhoneOpen(false); setRoadsideOpen(true); }}
              >
                <div className="pt-app-icon"><Icon3dMarketStall size={32} /></div>
                <span>Chợ</span>
              </button>

              <button
                type="button"
                className="pt-app-bubble app-quests"
                onClick={() => { setPhoneOpen(false); handleMenuClick('quests'); }}
              >
                <div className="pt-app-icon">
                  <Icon3dQuestBook size={32} />
                  {QUESTS.some(q => !progress.claimedQuests.includes(q.id) && (progress.stats[q.stat] || 0) >= q.goal) && (
                    <span className="pt-app-badge">!</span>
                  )}
                </div>
                <span>Nhiệm Vụ</span>
              </button>

              <button
                type="button"
                className="pt-app-bubble app-map"
                onClick={() => { setPhoneOpen(false); handleMenuClick('map'); }}
              >
                <div className="pt-app-icon"><Icon3dMap size={32} /></div>
                <span>Bản Đồ</span>
              </button>

              <button
                type="button"
                className={`pt-app-bubble app-factory ${isFeatureLocked(progress, 'factory') ? 'is-locked' : ''}`}
                onClick={() => { setPhoneOpen(false); handleMenuClick('factory'); }}
              >
                <div className="pt-app-icon">
                  {isFeatureLocked(progress, 'factory') ? <Icon3dLock size={26} /> : <Icon3dMill size={32} />}
                </div>
                <span>Chế Biến</span>
              </button>

              <button
                type="button"
                className={`pt-app-bubble app-upgrade ${isFeatureLocked(progress, 'upgrade') ? 'is-locked' : ''}`}
                onClick={() => { setPhoneOpen(false); handleMenuClick('upgrade'); }}
              >
                <div className="pt-app-icon">
                  {isFeatureLocked(progress, 'upgrade') ? <Icon3dLock size={26} /> : <Icon3dHammer size={32} />}
                </div>
                <span>Nâng Cấp</span>
              </button>

              <button
                type="button"
                className="pt-app-bubble app-camera"
                onClick={() => {
                  const mode = worldRef.current?.toggleCameraView();
                  if (mode) setCameraViewMode(mode);
                  setStatus(mode === 'explore' ? 'Góc nhìn: Khám phá tự do' : 'Góc nhìn: Canh tác nông trại');
                }}
              >
                <div className="pt-app-icon"><Icon3dSparkleStar size={30} /></div>
                <span>{cameraViewMode === 'explore' ? 'Nhìn Xa' : 'Canh Tác'}</span>
              </button>

              <button
                type="button"
                className="pt-app-bubble app-guide"
                onClick={() => { setPhoneOpen(false); setGuideOpen(true); }}
              >
                <div className="pt-app-icon"><Icon3dGuideBook size={32} /></div>
                <span>Sổ Tay</span>
              </button>

              <button
                type="button"
                className="pt-app-bubble app-notice"
                onClick={() => { setPhoneOpen(false); setPlazaNoticeOpen(true); }}
                title="Bảng Thông Báo & Sự Kiện Quảng Trường"
              >
                <div className="pt-app-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon3dNoticeBoard size={28} /></div>
                <span>Bảng Tin</span>
              </button>
            </div>

            <div className="hud-phone-settings" aria-label="Thiết lập trò chơi">
              <button type="button" onClick={() => { const muted = farmAudio.toggleMute(); setIsMuted(muted); }}>
                {isMuted ? <Icon3dAudioOff size={20} /> : <Icon3dAudioOn size={20} />}
                <span>Âm thanh: {isMuted ? 'Tắt' : 'Bật'}</span>
              </button>
              <button type="button" onClick={() => {
                const nextPreset = ({ auto: 'ultra', ultra: 'balanced', balanced: 'eco', eco: 'auto' })[graphicsQuality] || 'auto';
                setGraphicsQuality(nextPreset);
                worldRef.current?.setGraphicsQuality(nextPreset);
              }}>
                <Icon3dSparkleStar size={20} />
                <span>Đồ họa: {{ auto: 'Tự động · nét trước', ultra: 'Siêu nét cố định', balanced: 'Cân bằng', eco: 'Tiết kiệm' }[graphicsQuality]}</span>
              </button>
            </div>

            <div className="pt-phone-travel-dock">
              <span className="pt-travel-dock-label">DỊCH CHUYỂN TỨC THỜI</span>
              <div className="pt-travel-dock-btns">
                <button
                  type="button"
                  className="pt-travel-chip town-chip"
                  onClick={() => {
                    travelTo({ id: 'town', label: 'Trung tâm thành phố', x: 0, z: 20 });
                    setPhoneOpen(false);
                  }}
                  title="Dịch chuyển tức thì đến Quảng Trường Trung Tâm"
                >
                  <Icon3dModernCity size={20} />
                  <span>Đến Trung Tâm</span>
                </button>
                <button
                  type="button"
                  className="pt-travel-chip farm-chip"
                  onClick={() => {
                    travelTo({ id: 'farm', label: 'Nông trại', ...playerFarmTarget(session.farmId) });
                    setPhoneOpen(false);
                  }}
                  title="Dịch chuyển tức thì về Nông Trại của bạn"
                >
                  <Icon3dRiceSpike size={20} />
                  <span>Về Nông Trại</span>
                </button>
              </div>
            </div>

            <div className="pt-phone-home-bar" onClick={() => setPhoneOpen(false)}>
              <span className="pt-home-indicator" />
            </div>
          </div>
        </div>
      )}
        </>
      )}

      {/* Modern Onboarding HUD with Distance Tracker and Navigation */}
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
      {panel === 'casino' && (
        <LiveCasinoGames
          state={casinoState}
          coins={progress.coins}
          connected={network.connected}
          inside={venueMode?.venue === 'casino'}
          message={casinoResult}
          defaultGame={chosenCasinoGame}
          onAction={casinoAction}
          onSelectGame={game => {
            setChosenCasinoGame(game);
          }}
          onExit={() => setPanel(null)}
        />
      )}
      {/* World Map Fast Travel Modal (Play Together Standard) */}
      <PlayTogetherWorldMapModal
        isOpen={panel === 'map'}
        onClose={() => setPanel(null)}
        onTravel={travelTo}
        session={session}
        playerCoord={worldRef.current?.getPlayerState?.() || { x: 0, z: 0 }}
        currentZone={zoneAtPosition((worldRef.current?.getPlayerState?.()?.x) || 0, (worldRef.current?.getPlayerState?.()?.z) || 0)}
      />

      {/* Play Together Inventory Modal (Túi Đồ Cao Cấp 3D) */}
      <PlayTogetherInventoryModal
        isOpen={panel === 'inventory'}
        onClose={() => setPanel(null)}
        onOpenFashion={() => setPanel('fashion')}
        progress={progress}
        onUseItem={(item) => {
          if (item.category === 'clothing') {
            const currentCustom = progress.customization || getDefaultCustomization();
            const earOptions = [
              'duck_floatie', 'frog_backpack', 'cat_headphones', 'round_glasses', 'angel_wings',
              'cat_ears', 'rabbit_ears', 'bear_ears', 'elf_ears', 'shiba_ears', 'duck_beak', 'halo_crown',
              'fox_tail', 'devil_horns', 'toast_mouth', 'lollipop_sweet', 'steampunk_goggles',
              'crown_royal', 'tiara_princess', 'aura_stars', 'cape_royal', 'cape_vampire', 'wings_faerie', 'wings_bat'
            ];
            let nextCustom = { ...currentCustom };
            if (item.id.startsWith('top_')) {
              nextCustom.topId = item.id;
            } else if (item.id.startsWith('bot_')) {
              nextCustom.bottomId = item.id;
            } else if (item.id.startsWith('shoe_')) {
              nextCustom.shoeId = item.id;
            } else if (item.id.startsWith('hair_')) {
              nextCustom.hairStyle = item.id;
            } else if (earOptions.includes(item.id)) {
              nextCustom.ears = item.id;
            } else if (item.id === 'straw_hat') {
              if (!network.connected || !progress.ownedOutfits?.includes('farmer')) { setStatus('Bạn chưa sở hữu bộ nông dân hoặc chưa kết nối server.');return; }
              gameClientRef.current?.sendGameAction('buy_outfit',{id:'farmer'});return;
            } else if (item.id === 'blue_backpack') {
              if (!network.connected || !progress.ownedOutfits?.includes('farmer')) { setStatus('Bạn chưa sở hữu bộ nông dân hoặc chưa kết nối server.');return; }
              gameClientRef.current?.sendGameAction('buy_outfit',{id:'farmer'});return;
            }
            if (!network.connected) { setStatus('Cần kết nối server để trang bị.');return; }
            gameClientRef.current?.sendGameAction('fashion_save_customization',{customization:nextCustom,newOwnedItemIds:[]});
            setStatus('Đang chờ server xác nhận trang bị…');
            return;
          }
          if (item.id === 'watering_can') {
            setStatus('Đã cầm Bình tưới nước!');
            setPanel(null);
          } else if (item.id === 'hoe') {
            setStatus('Đã cầm Cuốc làm đất!');
            setPanel(null);
          } else if (item.id === 'carrot') {
            sellItem('carrot');
            setStatus('Đã bán Cà rốt tươi!');
          } else if (item.id === 'blue_fish') {
            fishingSellAll();
            setStatus('Đã bán Cá biển!');
          } else {
            setStatus(`Đã sử dụng ${item.name}!`);
          }
        }}
        onDropItem={(item) => {
          setStatus(`Đã chuyển ${item.name} vào kho lưu trữ.`);
        }}
        farmAudio={farmAudio}
      />

      {panel && panel !== 'orders' && panel !== 'fashion' && panel !== 'casino' && panel !== 'map' && panel !== 'inventory' && (
        <div className="panel-backdrop" onClick={() => { farmAudio.playPop(); setPanel(null); }}>
          <section className="game-panel" onClick={event => event.stopPropagation()} role="dialog" aria-modal="true">
            <header>
              <div>
                <small>{PANEL_INFO[panel]?.badge || 'TRUNG TÂM NÔNG TRẠI'}</small>
                <h2>{PANEL_INFO[panel]?.title || panel}</h2>
              </div>
              <button type="button" onClick={() => { farmAudio.playPop(); setPanel(null); }} aria-label="Đóng">✕</button>
            </header>
        {panel === 'land' && <LandMarket lots={landLots} focusFarmId={focusedLand} playerId={session.playerId} ownsLand={Boolean(session.farmId)} coins={progress.coins} pending={landPending} onVisit={lot => { const gate = WORLD_VILLAGES.find(v => v.id === lot.villageId)?.gate; if (gate) travelTo({ id: lot.villageId, label: lot.villageName, ...gate }); }} onBuy={lot => { if (!network.connected) { setStatus('Chưa kết nối server.'); return; } setLandPending(true); gameClientRef.current?.sendGameAction('buy_land', { farmId: lot.farmId }); }} />}
        {panel === 'livestock' && <LivestockRefresh>{() => <div className="item-list">
          <h3>Chăn nuôi · {progress.coins} xu</h3>
          <p>Xây chuồng, mua con giống, cho ăn rồi thu trứng, sữa và len. Heo trưởng thành được bán trực tiếp.</p>
          {Object.values(FARM_CONFIG.animals).map(def => {
            const herd = animals.filter(a => a.species === def.id);
            const built = progress.animalPens?.[def.id] || herd.length > 0;
            return <button key={def.id} disabled={!network.connected || progress.coins < (built ? def.buyCost : def.penCost) || herd.length >= def.capacity} onClick={() => gameClientRef.current?.sendGameAction(built ? 'buy_animal' : 'build_pen', { species: def.id })}>
              <span><b>{def.name} · {herd.length}/{def.capacity}</b><small>{built ? `Mua con giống · thức ăn ${def.feedCost} xu/con · ${Math.ceil(def.productMs / 60000)} phút` : 'Xây chuồng trước khi mua con giống'}</small></span><em>{built ? def.buyCost : def.penCost} xu</em>
            </button>;
          })}
          <button onClick={feedAnimals} disabled={!network.connected || !animals.some(a => !a.productReadyAt)}>Cho ăn · bắt đầu đợt mới</button>
          <button onClick={collectAnimals} disabled={!network.connected || !animals.some(a => !FARM_CONFIG.animals[a.species]?.saleOnly && a.productReadyAt > 0 && a.productReadyAt <= Date.now())}>Thu trứng, sữa và len</button>
          {animals.filter(a => FARM_CONFIG.animals[a.species]?.saleOnly).map(a => <button key={a.id} disabled={!network.connected || !a.productReadyAt || a.productReadyAt > Date.now()} onClick={() => gameClientRef.current?.sendGameAction('sell_animal', { id: a.id })}>Bán heo trưởng thành · {FARM_CONFIG.products.maturePig.sellPrice} xu</button>)}
          {Object.entries(FARM_CONFIG.products).filter(([id]) => id !== 'maturePig').map(([id, product]) => <button key={id} disabled={!network.connected || !progress.inventory[id]} onClick={() => gameClientRef.current?.sendGameAction('sell_livestock_product', { id })}><span>{product.name} × {progress.inventory[id] || 0}</span><em>Bán · {product.sellPrice} xu</em></button>)}
        </div>}</LivestockRefresh>}
        {panel === 'shop' && <div className="item-list">{Object.values(CROPS).map(crop => <button key={crop.id} disabled={progress.level < crop.level} onClick={() => chooseCrop(crop)}><i>{cropIcons[crop.id]}</i><span><b>{crop.name}</b><small>{Math.ceil(crop.growMs / 60000)} phút · mở cấp {crop.level}</small></span><em>{crop.seedCost} xu</em></button>)}</div>}
        {panel === 'quests' && <div className="item-list">{QUESTS.map(quest => { const current = Math.min(quest.goal, progress.stats[quest.stat]); const claimed = progress.claimedQuests.includes(quest.id); return <button key={quest.id} disabled={claimed || current < quest.goal} onClick={() => claimQuest(quest)}><i>{claimed ? <Icon3dCheck /> : <Icon3dStar />}</i><span><b>{quest.title}</b><small>{current}/{quest.goal} · thưởng {quest.xp} XP</small></span><em>{claimed ? 'Đã nhận' : `+${quest.coins} xu`}</em></button>; })}</div>}
        {panel === 'factory' && <div className="item-list">{RECIPES.map(recipe => <button key={recipe.id} onClick={() => craft(recipe)}><i>{recipeIcons[recipe.id]}</i><span><b>{recipe.name}</b><small>{Object.entries(recipe.inputs).map(([id,count]) => `${CROPS[id]?.name || id} ${count}`).join(' · ')} · +{recipe.xp} XP</small></span><em>Chế biến</em></button>)}</div>}
        {panel === 'upgrade' && <div className="item-list"><button onClick={upgradeLand}><i><Icon3dSprout /></i><span><b>Mở rộng đất · {progress.unlockedPlots}/48 ô</b><small>{EXPANSIONS.find(item => item.plots > progress.unlockedPlots) ? `Yêu cầu cấp ${EXPANSIONS.find(item => item.plots > progress.unlockedPlots).level}` : 'Đã đạt tối đa'}</small></span><em>{EXPANSIONS.find(item => item.plots > progress.unlockedPlots)?.cost || 'MAX'} xu</em></button><button onClick={upgradeBarn}><i><Icon3dBarn /></i><span><b>Nâng kho lên cấp {progress.barnLevel + 1}</b><small>Tăng thêm 20 chỗ chứa</small></span><em>{farmBarnUpgradeCost(progress.barnLevel)} xu</em></button><button onClick={upgradeHome}><i><Icon3dHouseCabin /></i><span><b>{(progress.homeTier || 1) >= 2 ? 'Nhà Nông Trại Ấm Cúng' : 'Nâng cấp căn nhà gỗ'}</b><small>{(progress.homeTier || 1) >= 2 ? 'Đã sở hữu · cấp nhà 2' : 'Mở ở cấp 4 · thay căn nhà khởi đầu đơn giản'}</small></span><em>{(progress.homeTier || 1) >= 2 ? 'Đã mua' : '1800 xu'}</em></button></div>}
        {panel === 'city' && (
          <div className="destination-grid">
            <button onClick={() => { setPanel(null); worldRef.current?.enterVenue('supplies'); }}>
              <i><Icon3dSprout size={28} /></i><b>Vật tư</b><small>Mua hạt giống theo cấp</small><em>Đến tiệm 3D →</em>
            </button>
            <button onClick={() => isFeatureLocked(progress, 'casino') ? setStatus('Casino mở sau khi hoàn thành hướng dẫn!') : (setPanel(null), worldRef.current?.enterVenue('casino'))}>
              <i><Icon3dDice size={28} /></i><b>Hội quán Casino</b><small>{isFeatureLocked(progress, 'casino') ? 'Khóa tân thủ' : 'Trò chơi dân gian & xúc xắc'}</small><em>Vào sảnh 3D →</em>
            </button>
            <button onClick={() => { setPanel(null); worldRef.current?.enterVenue('fashion'); }}>
              <i><Icon3dWardrobe size={28} /></i><b>Thời trang</b><small>Mua và thay trang phục Sophie</small><em>Đến tiệm 3D →</em>
            </button>
            <button onClick={() => isFeatureLocked(progress, 'vehicles') ? setStatus('Đại lý xe mở sau khi hoàn thành hướng dẫn!') : (setPanel(null), worldRef.current?.enterVenue('vehicles'))}>
              <i><Icon3dCub50 size={28} /></i><b>Đại lý xe</b><small>{isFeatureLocked(progress, 'vehicles') ? 'Khóa tân thủ' : 'Xe đạp cổ & chổi bay'}</small><em>Đến tiệm 3D →</em>
            </button>
            <button onClick={() => { setPanel(null); worldRef.current?.enterVenue('fishing'); }}>
              <i><Icon3dFishingRodPro size={28} /></i><b>Đồ câu cá</b><small>Cần câu trúc, cước & mồi câu</small><em>Đến tiệm 3D →</em>
            </button>
          </div>
        )}
        {panel === 'vehicles' && <VehicleShowroom vehicles={vehicles} owned={progress.ownedVehicles || []} current={progress.vehicle} coins={progress.coins} connected={network.connected} onBuy={buyVehicle} />}
        {panel === 'fishing' && (
          <div className="item-list">
            <div className="capacity" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: '#fff', padding: '10px 14px', borderRadius: '14px', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold' }}>
              <Icon3dFishingRodPro size={24} /> Tiệm Đồ Câu Lão Ngư · Trang bị cần câu & mồi câu ven hồ
            </div>
            <div className="fishing-guide">{fishingWater ? `Bạn đang ở ${FISHING_WATER_NAMES[fishingWater]}. Trang bị cần, thả phao rồi giật khi cá cắn.` : 'Đứng sát bờ hồ, sông hoặc biển để câu cá.'}</div>
            {fishingWater && <div className="fishing-actions">
              <button type="button" disabled={!network.connected || !progress.fishing?.equippedRod} onClick={()=>setPanel(null)}>Ra bờ nước · dùng nút câu cá (F)</button>
            </div>}
            <div className="fishing-section-title">Cửa hàng đồ câu</div>
            {FISHING_GEAR_ORDER.map(id => {
              const item = FISHING_GEAR[id];
              const GearIcon = fishingGearIcons[item.icon] || Icon3dFishingRodPro;
              const owned = item.kind === 'rod'
                ? progress.fishing?.ownedRods?.includes(id)
                : item.kind === 'tool'
                  ? Boolean(progress.fishing?.ownedTools?.[id])
                  : false;
              return <button key={`buy-${id}`} type="button" disabled={!network.connected || progress.coins < item.cost || owned} onClick={() => gameClientRef.current?.sendGameAction('fishing_buy', { id })}>
                <i><GearIcon size={item.kind === 'rod' ? 30 : 28} /></i>
                <span><b>{item.name}</b><small>{item.description}</small><small>{item.kind === 'rod' ? `Tầm ném ${item.castDistance}m · sức kéo ${item.reelPower}` : item.kind === 'bait' ? `Gói x${item.quantity} · tốc độ cá cắn ${item.biteSpeed}x` : `Sức chứa cá +${item.capacity}`}</small></span>
                <em>{owned ? 'Đã mua' : `${item.cost} xu`}</em>
              </button>;
            })}
            <div className="fishing-guide" data-fishing-tick={fishingTick}>Cần: {FISHING_GEAR[progress.fishing?.equippedRod]?.name || 'Chưa có'} · Mồi: {FISHING_GEAR[progress.fishing?.equippedBait]?.name || 'Không dùng'} · Kho cá: {fishingInventoryCount(progress.fishing)}/{fishingCapacity(progress.fishing)}</div>
            <div className="fishing-section-title">Trang bị</div>
            {Object.values(FISHING_CONFIG.rods).map(rod => <button key={`equip-${rod.id}`} type="button" disabled={!progress.fishing?.ownedRods?.includes(rod.id)} onClick={() => gameClientRef.current?.sendGameAction('fishing_equip', { id: rod.id })}><span><b>{rod.name}</b><small>{rod.id === progress.fishing?.equippedRod ? 'Đang dùng' : 'Đã sở hữu'}</small></span><em>{rod.id === progress.fishing?.equippedRod ? 'Đang dùng' : 'Trang bị'}</em></button>)}
            <button type="button" disabled={!progress.fishing?.equippedBait} onClick={() => gameClientRef.current?.sendGameAction('fishing_equip', { id: null })}><span><b>Không dùng mồi</b><small>Tiết kiệm mồi cho cá thường</small></span><em>{progress.fishing?.equippedBait ? 'Bỏ mồi' : 'Đang dùng'}</em></button>
            {Object.values(FISHING_CONFIG.baits).map(bait => <button key={`equip-${bait.id}`} type="button" disabled={!(progress.fishing?.bait?.[bait.id] > 0)} onClick={() => gameClientRef.current?.sendGameAction('fishing_equip', { id: bait.id })}><span><b>{bait.name}</b><small>Còn {progress.fishing?.bait?.[bait.id] || 0} · hiếm +{Math.round(bait.rareBonus * 100)}%</small></span><em>{bait.id === progress.fishing?.equippedBait ? 'Đang dùng' : 'Trang bị'}</em></button>)}
            <div className="fishing-section-title">Bộ sưu tập · giữ kỷ lục cả sau khi bán</div>
            {Object.entries(FISHING_CONFIG.missions).map(([id,mission])=><button key={id} disabled={!network.connected||progress.fishing?.claimedMissions?.includes(id)||fishingMissionProgress(progress.fishing||{},mission)<mission.goal} onClick={()=>gameClientRef.current?.sendGameAction('fishing_claim_mission',{id})}><span><b>{mission.name}</b><small>{Math.min(mission.goal,fishingMissionProgress(progress.fishing||{},mission))}/{mission.goal}</small></span><em>{progress.fishing?.claimedMissions?.includes(id)?'Đã nhận':`${mission.coins} xu · ${mission.xp} XP`}</em></button>)}
            <div className="fishing-guide">{Object.values(FISHING_CONFIG.fish).map(fish => <span key={fish.id} style={{display:'block'}}>{progress.fishing?.collection?.[fish.id] ? `${fish.name} · ${progress.fishing.collection[fish.id].count} lần bắt · kỷ lục ${Number(progress.fishing.collection[fish.id].maxWeight).toFixed(2)} kg` : '[Chưa khám phá]'}</span>)}</div>
            <div className="fishing-section-title">Cá trong thùng</div>
            <div className="fishing-guide">Đã bắt {progress.fishing?.stats?.totalCaught || 0} con · cá hiếm {progress.fishing?.stats?.rareCaught || 0} · kỷ lục {Number(progress.fishing?.stats?.largestFish || 0).toFixed(2)} kg</div>
            {Object.entries(LAKE_FISH).map(([id, fish]) => {
              const record = progress.fishing?.fish?.[id];
              const count = typeof record === 'number' ? record : record?.count || 0;
              const averageWeight = typeof record === 'object' && record?.count ? record.totalWeight / record.count : 0;
              return <button key={`sell-${id}`} type="button" disabled={!count} onClick={() => gameClientRef.current?.sendGameAction('fishing_sell', { id })}><span><b>{fish.name} × {count}</b><small>{fish.rarity} · {averageWeight ? `${averageWeight.toFixed(2)} kg/con` : 'Chưa có cá'} · bán cho Lão Ngư</small></span><em>+{fish.price} xu</em></button>;
            })}
            <button type="button" className="fishing-sell-all" disabled={!fishingInventoryCount(progress.fishing)} onClick={fishingSellAll}>Bán toàn bộ cá</button>
          </div>
        )}
      </section></div>)}

      {/* Sophie's Fashion Boutique Modal */}
      {panel === 'fashion' && (
        <FashionBoutiqueModal
          currentCustomization={progress.customization || getDefaultCustomization()}
          ownedItems={progress.ownedCustomization || []}
          coins={progress.coins}
          onSaveAndEquip={(newCustomization, newOwnedItemIds, totalCost) => {
            if (!network.connected) { setStatus('Cần kết nối server để lưu thời trang.');return; }
            gameClientRef.current?.sendGameAction('fashion_save_customization', {
              customization: newCustomization,
              newOwnedItemIds,
              totalCost,
            });
            setStatus('Đang chờ server xác nhận thời trang…');
          }}
          onClose={() => setPanel(null)}
        />
      )}

      {/* Onboarding Modals */}
      {gameStarted && showCharacterCreation && (
        <CharacterCreationModal
          defaultName={session.name}
          villages={villages}
          defaultVillageId={session.villageId || ''}
          onSubmit={handleCharacterCreation}
          pending={characterCreationPending}
          error={characterCreationError}
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
          progress={progress}
          onClose={() => setGuideOpen(false)}
          onResetTutorial={handleResetTutorial}
          onNavigateStep={() => {
            setGuideOpen(false);
            const step = progress.onboarding?.step;
            if (step === ONBOARDING_STEPS.FIRST_PLANT) {
              const myFarm = WORLD_LAYOUT.farms.find(f => f.id === session.farmId) || WORLD_LAYOUT.farms[0];
              if (myFarm && worldRef.current) {
                worldRef.current.setObjective({ x: myFarm.x, y: 0, z: myFarm.z });
                setStatus('Đang dẫn đường tới ô ruộng của bạn!');
              }
            } else if (step === ONBOARDING_STEPS.DELIVER_ORDER) {
              setPanel('orders');
            } else {
              setDialogueOpen(true);
            }
          }}
        />
      )}

      {celebrationOpen && (
        <GraduationModal onClose={() => setCelebrationOpen(false)} />
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

      {/* Plaza Leaderboard Monument Modal */}
      {leaderboardOpen && (
        <LeaderboardModal
          leaderboard={socialState.leaderboard}
          myPlayer={{ name: session.name, progress }}
          onVisitFarm={friendId => {
            setLeaderboardOpen(false);
            setStatus(`Đang xem thông tin nông trại của ${friendId}…`);
          }}
          onAddFriend={friendId => {
            gameClientRef.current?.send({ type: 'social_action', friendId, action: 'add_friend' });
            emitReward({ text: '+1 Yêu cầu kết bạn', icon: <Icon3dFriends size={20} />, color: '#10b981' });
          }}
          onClose={() => setLeaderboardOpen(false)}
        />
      )}

      {/* Plaza Community Billboard & Event Notice Modal */}
      {plazaNoticeOpen && (
        <PlazaEventNoticeModal
          connected={network.connected}
          rewardState={progress.communityRewards}
          rewardNotice={status}
          onClaimDailyReward={reward => {
            if (!network.connected) return;
            gameClientRef.current?.sendGameAction('claim_daily_reward');
            setStatus('Đang xác nhận thưởng điểm danh…');
          }}
          onRedeemCode={(code, info) => {
            if (!network.connected) return;
            gameClientRef.current?.sendGameAction('redeem_giftcode',{code});
            setStatus('Đang xác thực giftcode trên server…');
          }}
          onNavigateVenue={venue => {
            setPlazaNoticeOpen(false);
            setPanel(null);
            worldRef.current?.enterVenue(venue);
          }}
          onClose={() => setPlazaNoticeOpen(false)}
        />
      )}

      {/* Bus Transit System HUD (Boarding Prompts & High-Speed Ride Status) */}
      <LiveBusHud
        statusRef={busTransitRef}
        onBoard={busId => worldRef.current?.boardBus(busId)}
        onAlight={() => worldRef.current?.alightBus()}
        onToggleCinematicTour={() => worldRef.current?.toggleCinematicTour()}
      />

      {/* Floating Rewards Pop Effect (Juicy Harvest Pop VFX) */}
      <FloatingRewards />

      {(statusVisible || !network.connected) && <div className="status" role="status"><i className={network.phase === 'connected' ? '' : 'offline'} /> {status}</div>}
    </main>
  );
}
