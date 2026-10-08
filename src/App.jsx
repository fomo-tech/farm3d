import {AppleTreeHUD} from './components/AppleTreeHUD.jsx';
import './components/FarmHudPolish.css';
import {CropHarvestHUD} from './components/CropHarvestHUD.jsx';
import {LivestockActionHUD} from './components/LivestockActionHUD.jsx';
import {FortuneLotteryModal} from './components/FortuneLotteryModal.jsx';
import {LOTTERY_CONFIG} from '../shared/lotteryConfig.js';
import {createRuntimeId} from './game/runtime/BrowserRuntime.js';
import {firstLandPurchasePrice} from '../shared/landConfig.js';
import {GameConfirm,GameToast} from './components/GameFeedback.jsx';
import { FishingShopModal } from './components/FishingShopModal.jsx';
import { FarmSuppliesModal } from './components/FarmSuppliesModal.jsx';
import { FarmSettingsModal } from './components/FarmSettingsModal.jsx';
import { useDailyAttendance } from './hooks/useDailyAttendance.js';
import { useGameNotifications } from './hooks/useGameNotifications.js';
import { DailyRewardBadge } from './components/DailyRewardBadge.jsx';
import { HudIcon } from './components/icons3d/HudIcon.jsx';
import { GameHudTopbar } from './components/GameHudTopbar.jsx';
import { missionAvailability } from '../shared/missionEligibility.js';
import { dailyMissionList } from '../shared/missions.js';
import { preLandJourney, missionStats } from '../shared/preLandJourney.js';
import { LAKE_CONFIG } from '../shared/lakeConfig.js';
import { NPC_TRADING_CONFIG } from '../shared/npcTradingConfig.js';
import { unlockedFarmTiles } from '../shared/landExpansionConfig.js';
import { farmTilePosition } from '../shared/farmLayout.js';
import { FarmUpgradePanel } from './components/FarmUpgradePanel.jsx';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { travelCost } from '../shared/travelConfig.js';
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
import { FishingHUD } from './components/FishingHUD.jsx';
import { VehicleQuickMenu } from './components/VehicleQuickMenu.jsx';
import { VEHICLE_LIST } from '../shared/vehicleConfig.js';
import { VehicleShowroom } from './components/VehicleShowroom.jsx';
import { fishingMissionProgress } from '../shared/fishingSession.js';
import { AvatarChatBar } from './components/chat/AvatarChatBar.jsx';
import { readGraphicsQuality } from './game/rendering/GraphicsSettings.js';
import { loadWorldSession, saveWorldSession, switchWorldIdentity, restoreGuestIdentity, leaveWorldSession } from './game/network/WorldSession.js';
import { GoogleAccountConflictDialog } from './components/GameAccountUI.jsx';
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
import { MissionBoard, MissionTracker } from './components/MissionBoard.jsx';
import { MAIN_MISSIONS, DAILY_MISSIONS, activeMainMission, missionDayKey, missionProgress, normalizeMissions } from '../shared/missions.js';
import { HudContextAction } from './components/HudContextAction.jsx';
import { FarmGuideModal } from './components/FarmGuideModal.jsx';
import { GraduationModal } from './components/GraduationModal.jsx';
import { RoadsideShopModal } from './components/RoadsideShopModal.jsx';
import { FashionBoutiqueModal } from './components/FashionBoutiqueModal.jsx';
import { LeaderboardModal } from './components/LeaderboardModal.jsx';
import { PlazaEventNoticeModal } from './components/PlazaEventNoticeModal.jsx';
import { PlayerProfileModal } from './components/PlayerProfileModal.jsx';
import PlayTogetherWorldMapModal from './components/PlayTogetherWorldMapModal.jsx';
import { PlayTogetherInventoryModal } from './components/PlayTogetherInventoryModal.jsx';
import { Icon3dFashionLogo } from './components/icons3d/Fashion3DIcons.jsx';
import { getDefaultCustomization } from './game/data/fashionCatalog.js';
import { OrderBulletinBoard } from './components/OrderBulletinBoard.jsx';
import { FloatingRewards, emitReward } from './components/FloatingRewards.jsx';
import { farmAudio } from './game/audio/FarmAudioSystem.js';
import { FarmToolDock } from './components/FarmToolDock.jsx';
import { FarmMinimap } from './components/FarmMinimap.jsx';
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
  land: { badge: 'VĂN PHÒNG ĐẤT ĐAI', title: 'Mua đất & Quyền sử dụng' },
  livestock: { badge: 'Nông Trại Vui Vẻ', title: 'Chuồng Trại & Thú Nuôi' },
  shop: { badge: 'Nông Cụ & Hạt Giống', title: 'Cửa Hàng Nông Nghiệp' },
  inventory: { badge: 'Ba Lô & Kho Chứa', title: 'Kho Nông Sản' },
  quests: { badge: 'Chính Tuyến & Hằng Ngày', title: 'Sổ Nhiệm Vụ' },
  factory: { badge: 'Xưởng Chế Biến', title: 'Chế Biến Nông Sản' },
  upgrade: { badge: 'Mở Rộng & Nâng Cấp', title: 'Nâng Cấp Nông Trại' },
  city: { badge: 'Khu Trung Tâm', title: 'Thị Trấn Thung Lũng' },
  vehicles: { badge: 'Phương Tiện & Di Chuyển', title: 'Đại Lý Xe & Chổi Bay' },
  fishing: { badge: 'Câu Cá Ven Hồ', title: 'Cửa Hàng Lão Ngư' },
};

function HudImageIcon({ asset, className = '', alt = '' }) {
  return <HudIcon mobile asset={asset} className={`pt-hud-img-icon ${className}`} alt={alt} />;
}

function formatCompactCurrency(val) {
  if (val == null || !Number.isFinite(val)) return '0';
  if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)}B`;
  if (val >= 10_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 100_000) return `${(val / 1_000).toFixed(0)}K`;
  return val.toLocaleString('vi-VN');
}

function playerFarmTarget(farmId) {
  const farm = WORLD_LAYOUT.farms.find(item => item.id === farmId) || WORLD_LAYOUT.farms[0];
  return farmTilePosition(Number(farm.id.replace('farm_', '')), '0:0');
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
  const [lotteryState,setLotteryState]=useState(null);
  const [lotteryPending,setLotteryPending]=useState(false);
  const refreshLottery=useCallback(()=>gameClientRef.current?.send({type:'lottery_sync'}),[]);
  const [gameStarted, setGameStarted] = useState(false);
  const { status, setStatus, toast, dismissToast } = useGameNotifications(gameStarted);
  const [confirmation,setConfirmation]=useState(null);

  const confirmAction=options=>new Promise(resolve=>setConfirmation({...options,resolve}));
  const [session, setSession] = useState(loadWorldSession);
  const [authError, setAuthError] = useState('');
  const [authConflict, setAuthConflict] = useState(null);
  const googleCredentialRef = useRef(null);
  const sessionRef = useRef(session);
  sessionRef.current = session;
  const initialLocationRef = useRef(null);
  const [animals, setAnimals] = useState(initialLivestockState);
  const [livestockFocus, setLivestockFocus] = useState(null);
  const [appleFocus,setAppleFocus]=useState(null);
  const [appleBusy,setAppleBusy]=useState(false);
  const [livestockPending, setLivestockPending] = useState(false);
  const livestockPendingRef = useRef(false);
  const [progress, setProgress] = useState(loadProgress);
  const [fishingConditions,setFishingConditions]=useState(null);
  const [panel, setPanel] = useState(null);
  const [cameraViewMode, setCameraViewMode] = useState('explore');
  const cameraViewModeRef = useRef(cameraViewMode);
  cameraViewModeRef.current = cameraViewMode;
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [plotUnlockPending, setPlotUnlockPending] = useState(false);
  const [trackedMission, setTrackedMission] = useState(null);
  const [questOpenTab, setQuestOpenTab] = useState('main');
  const [missionRewardEvent, setMissionRewardEvent] = useState(null);
  const missionRewardSerial = useRef(0);
  const [activeTool, setActiveTool] = useState('hand');
  const [boot, setBoot] = useState({ phase: 'idle', error: '' });
  // Warm the 3D world behind the title screen so the player lands in the game
  // world instead of waiting on a blank splash after pressing Play.
  const [startRequested, setStartRequested] = useState(true);
  const [bootProgress, setBootProgress] = useState({ phase: 'init', percentage: 0, message: 'Đang mở cửa thị trấn…', current: 0, total: 40 });
  const [debugEnabled, setDebugEnabled] = useState(() => Boolean(window.__farmDebug?.enabled));
  useEffect(() => { document.documentElement.dataset.debug = String(debugEnabled); }, [debugEnabled]);
  const clockRef = useRef(Math.floor(Date.now() / 1000));
  const [timeMode, setTimeMode] = useState('auto');
  const [fishingWater, setFishingWater] = useState(null);
  const [fishingTick, setFishingTick] = useState(0);
  const [caughtFish, setCaughtFish] = useState(null);
  const fishingServerOffset = useRef(0);
  const missionRolloverRequestedRef = useRef(null);
  const fishingSessionId = useRef(null);
  const fishingCatchDisplayed = useRef(false);
  const [network, setNetwork] = useState({ connected: false, phase: 'connecting', online: 1, queued: 0, attempt: 0 });
  useEffect(()=>{if(panel==='fortune'&&network.connected)refreshLottery();if(!network.connected)setLotteryPending(false);},[panel,network.connected]);
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
  const [roadsidePending, setRoadsidePending] = useState(false);
  useEffect(() => { if (!network.connected) setRoadsidePending(false); }, [network.connected]);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [phonePage, setPhonePage] = useState('home');
  useEffect(() => { if (phoneOpen) setPhonePage('home'); }, [phoneOpen]);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [plazaNoticeOpen, setPlazaNoticeOpen] = useState(false);
  const [socialState, setSocialState] = useState({ friends: [], leaderboard: [] });
  const [profileTarget, setProfileTarget] = useState(null);
  const [viewedProfile, setViewedProfile] = useState(null);
  // Resume only after the world and the server session are ready.
  useEffect(() => {
    const returningPlayer = session.hasEnteredWorld || progress.onboarding?.characterCreated || (session.googleLinked && session.sessionToken);
    if (session.signedOut || !returningPlayer || gameStarted || boot.phase !== 'ready' || bootProgress.percentage < 100 || !network.connected || !gameClientRef.current?.joined) return;
    dismissToast();
    setGameStarted(true);
  }, [session.signedOut, session.hasEnteredWorld, session.googleLinked, session.sessionToken, progress.onboarding?.characterCreated, gameStarted, boot.phase, bootProgress.percentage, network.connected]);

  useEffect(()=>{if(!gameStarted||!network.connected)return;refreshLottery();const timer=setInterval(refreshLottery,60000);return()=>clearInterval(timer);},[gameStarted,network.connected,refreshLottery]);
  const [graphicsQuality, setGraphicsQuality] = useState(readGraphicsQuality);
  const [targetDistance, setTargetDistance] = useState(null);
  const [activeObjective, setActiveObjective] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [currentFarmZone, setCurrentFarmZone] = useState(null);
  const [nearbyFarmGate, setNearbyFarmGate] = useState(null);
  const [theftProgress, setTheftProgress] = useState(null);
  const busTransitRef = useRef(null);

  useEffect(() => {
    if (panel === 'land' && network.connected) gameClientRef.current?.send({type:'land_market'});
  }, [panel, network.connected]);

  const missionState = normalizeMissions(progress.missions, missionStats(progress), Date.now(), {hasLand:progress.unlockedPlots > 0,progress,livestock:animals,seed:session.playerId});
  const currentMainMission = activeMainMission(missionState);
  const missionRewardsReady = Boolean(
    (currentMainMission && !missionAvailability(currentMainMission, progress) && missionProgress(currentMainMission, missionStats(progress), missionState) >= currentMainMission.goal) ||
    dailyMissionList(missionState).some(mission => !missionState.daily.claimed.includes(mission.id) && !missionAvailability(mission, progress) && missionProgress(mission, missionStats(progress), missionState, 'daily') >= mission.goal)
  );
  const legacyQuestReady = QUESTS.some(quest => !progress.claimedQuests.includes(quest.id) && (progress.stats[quest.stat] || 0) >= quest.goal);
  const dailyAttendance = useDailyAttendance(progress.communityRewards?.daily, fishingServerOffset.current);
  const dailyRewardAvailable = !dailyAttendance.claimedToday;
  const hasPendingNotifications = ORDERS.some(order => canFillOrder(progress, order)) || legacyQuestReady || missionRewardsReady;

  useEffect(() => {
    const checkDay = () => {
      if (!gameClientRef.current?.joined) return;
      const today = missionDayKey(Date.now() + fishingServerOffset.current);
      if (progressRef.current?.missions?.daily?.dayKey === today) {
        missionRolloverRequestedRef.current = null;
      } else if (missionRolloverRequestedRef.current !== today) {
        missionRolloverRequestedRef.current = today;
        gameClientRef.current.send({ type: 'missions_sync' });
      }
    };
    const interval = window.setInterval(checkDay, 30_000);
    return () => window.clearInterval(interval);
  }, []);

  progressRef.current = progress;
  useEffect(()=>{
    const update=()=>{
      const world=worldRef.current;if(!world)return;
      for(const [farmId,chunk] of world.farmChunks||[]){
        const readyAt=farmId===sessionRef.current.farmId?progressRef.current?.appleReadyAt:world.publicFarms?.find(f=>f.farmId===farmId)?.appleReadyAt;
        for(const fruit of chunk.appleFruits||[])if(!fruit.isDisposed())fruit.setEnabled(Number.isFinite(readyAt)&&Date.now()>=readyAt);
      }
    };
    update();const timer=setInterval(update,1000);return()=>clearInterval(timer);
  },[]);
  useEffect(()=>{if(!appleBusy)return;const timer=setTimeout(()=>setAppleBusy(false),20000);return()=>clearTimeout(timer);},[appleBusy]);


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
          if (worldRef.current) { worldRef.current.cameraViewMode = cameraViewModeRef.current; worldRef.current.resetCameraView(); }
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
          setBoot({ phase: 'error', error: 'Trò chơi bị gián đoạn. Hãy tải lại để tiếp tục.' });
        },
        getPlayerName: () => sessionRef.current.name,
        getPlayerId: () => sessionRef.current.playerId,
        getVillageName: () => sessionRef.current.farmAddress?.villageName || 'Làng Hoa Mai',
        getPlayerFarmId: () => sessionRef.current.farmId,
        onAppleInteract: target=>{worldRef.current?.cancelLivestockInteraction();setAppleFocus(target);setLivestockFocus(null);setPanel(null);},
        onLivestockInteract: target => { setAppleFocus(null);setLivestockFocus(target); setPanel(null); },
        onLivestockTheftFinish: payload=>gameClientRef.current?.sendGameAction('steal_livestock_finish',payload),
        onLivestockTheftCancelled: ()=>{livestockPendingRef.current=false;setLivestockPending(false);},
        onLandInteract: farmId => { setFocusedLand(farmId); setPanel('land'); gameClientRef.current?.send({ type: 'land_market' }); },
        getHomeTier: () => progressRef.current?.homeTier || 1,
        onFarmZoneChange: zone => setCurrentFarmZone(zone),
        onNearbyFarmGate: setNearbyFarmGate,
        onTheftProgress: setTheftProgress,
        onFarmGateAction: payload => gameClientRef.current?.sendGameAction('farm_gate', payload),
        onBusBoard: busId => gameClientRef.current?.joined ? gameClientRef.current.send({type:'bus_board',busId}) : false,
        onToolChange: tool => setActiveTool(tool),
        onHelpNeighbor: neighborFarmId => {
          setStatus(`Đang tưới giúp hàng xóm…`);
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
        getUnlockedTileKeys: () => unlockedFarmTiles(progressRef.current || {}),
        onUnlockPlot: tileKey => { setSelectedPlot(tileKey); setPanel('upgrade'); },
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
        onPlayerProfile: playerId => {
          setProfileTarget(playerId);
          setViewedProfile(null);
          gameClientRef.current?.send({ type: 'get_profile', playerId });
        },
        onSponsor: url => {
          if (url === 'https://bagbily.com/hoantien-shopee') window.open(url, '_blank', 'noopener,noreferrer');
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
          if (npcId === 'fortune_god') { setPanel('fortune'); return; }
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
      setBoot({ phase: 'error', error: 'Chưa thể mở trò chơi. Hãy tải lại để thử lần nữa.' });
    }
    return () => {
      world?.dispose();
      worldRef.current = null;
    };
  }, [startRequested]);

  useEffect(() => {
    if (boot.phase !== 'ready' || !session.farmId) return;
    worldRef.current?.syncOwnedLivestock(animals, progress.animalPens || {}, session.farmId);
  }, [animals, progress.animalPens, session.farmId, boot.phase]);

  useEffect(() => {
    worldRef.current?.setLocalPlayerName(session.name);
  }, [session.name]);

  useEffect(() => {
    const client = new GameClient({
      onStatus: state => {
        if (state.connected === false) { livestockPendingRef.current = false; setLivestockPending(false); setLandPending(false); setPlotUnlockPending(false); }
        setNetwork(previous => ({ ...previous, ...state }));
        const phaseText = {
          connecting: 'Đang kết nối…',
          syncing: 'Đang chuẩn bị nhân vật của bạn…',
          connected: state.queued ? `Đã kết nối · còn ${state.queued} thao tác chờ xác nhận` : 'Đã kết nối. Tiếp tục khám phá nào!',
          reconnecting: `Mất kết nối · đang thử lại${state.attempt ? ` lần ${state.attempt}` : ''}`,
          offline: 'Mất kết nối. Các thao tác đang chờ được hoàn tất.',
        };
        setStatus(phaseText[state.phase] || 'Đang kiểm tra kết nối…', { silent: true });
      },
      onState: (players, serverTime) => {
        setNetwork(previous => previous.online === players.length + 1 ? previous : ({ ...previous, online: players.length + 1 }));
        worldRef.current?.syncRemotePlayers(players, serverTime);
        if (serverTime) {
          clockRef.current = Math.floor(serverTime / 1000);
        }
      },
      onMoveAck: state => { if(state.busRejected)worldRef.current?.alightBus(true);worldRef.current?.correctPlayerPosition(state); },
      onCasinoState: state => {
        setCasinoState(state);
        if (worldRef.current) worldRef.current.casinoStateReceivedAt = Date.now();
        worldRef.current?.setCasinoRoom(state.mine || null);
      },
      onSocialState: state => {
        setSocialState(state);
        const scene = worldRef.current?.scene;
        if (scene) {
          scene.metadata = { ...scene.metadata, portalLeaderboard: state.leaderboards?.wealth || [] };
        }
      },
      onProfileState: state => {
        setViewedProfile({ requestedId: state.requestedId || state.profile?.playerId, profile: state.profile || null });
      },
      onFarmSync: farms => {
        worldRef.current?.applyRemoteFarmSync(farms);
      },
      onFarmGate: update => {
        worldRef.current?.applyFarmGate(update);
        if (update.farmId === sessionRef.current?.farmId) setStatus(update.open ? 'Cổng đã mở. Người khác có thể vào vườn.' : 'Cổng đã đóng. Vườn được bảo vệ.');
      },
      onTheftPending: pending => pending.kind==='livestock'?worldRef.current?.beginLivestockTheft(pending):worldRef.current?.farming?.beginTheftCountdown(pending),
      onFarmScope: scope => {
        if (scope.lots) { setLandLots(scope.lots); worldRef.current?.setLandListings(scope.lots); }
        if (scope.marketOnly) return;
        worldRef.current?.applyPublicFarmScope(scope.farms || [], scope.crops || {});
      },
      onFarmUpdate: update => {
        worldRef.current?.applyRemoteFarmAction(update);
        if (update.byPlayer) {
          setStatus(`${update.byPlayer} vừa thực hiện hành động tại nông trại ${update.farmId}!`, { silent: true });
        }
      },
      onMailboxNotice: notice => {
        if (notice.farmId === session.farmId) {
          emitReward({ text: `${notice.fromName} khen nông trại!`, icon: <Icon3dHeartReaction size={20} />, color: '#ec4899' });
          farmAudio.playFanfare();
          setStatus(`${notice.fromName} vừa ghé thăm và khen vườn của bạn!`, { silent: true });
        } else {
          setStatus(`${notice.fromName} vừa khen nông trại ${notice.farmId}`, { silent: true });
        }
      },
      onEmote: msg => {
        if (msg.playerId && msg.playerId === sessionRef.current?.playerId) return;
        worldRef.current?.showEmote(msg.playerId, msg.emote);
        if (msg.fromName) {
          setStatus(`${msg.fromName} vừa gửi một biểu cảm!`, { silent: true });
        }
      },
      onChat: msg => {
        if (msg.playerId && msg.playerId === sessionRef.current?.playerId) return;
        worldRef.current?.showChatBubble(msg.playerId, msg.text, msg.emote);
        if (msg.fromName && msg.text) {
          setStatus(`${msg.fromName}: “${msg.text}”`, { silent: true });
          farmAudio.playPop();
        }
      },
      onVillages: list => setVillages(keepAvailableVillages(list)),
      onVillageRequired: () => setVillageRequired(true),
      onVillageError: message => {
        setVillageRequired(true);
        setLotteryPending(false);setStatus(`Lỗi: ${message}`);
      },
      onActionError: message => {
        setAppleBusy(false);
        setRoadsidePending(false);
        livestockPendingRef.current = false; setLivestockPending(false);
        worldRef.current?.finishLivestockInteraction(false);
        setPlotUnlockPending(false);
        if (characterCreationRef.current) {
          characterCreationRef.current = null;
          setCharacterCreationPending(false);
          setCharacterCreationError(message);
        }
        setLandPending(false);
        worldRef.current?.farming?.clearPendingActions?.();
        setLotteryPending(false);setStatus(`Lỗi: ${message}`);
        setCasinoResult(message);
        if (worldRef.current) worldRef.current.casinoLastError = message;
      },
      onFishingConditions:(conditions,serverNow)=>{setFishingConditions(conditions);if(serverNow)fishingServerOffset.current=serverNow-Date.now();},
      onAccountState: state => {
        if(state.result?.appleHarvest){setAppleBusy(false);for(const fruit of worldRef.current?.farmChunks.get(sessionRef.current.farmId)?.appleFruits||[])if(!fruit.isDisposed())fruit.setEnabled(false);farmAudio.playPop();setStatus(`Đã cất ${state.result.appleHarvest.amount} quả táo vào kho!`);}
        if (state.result?.livestockAction) {
          livestockPendingRef.current = false; setLivestockPending(false);
        worldRef.current?.finishLivestockInteraction(false);
          const action = state.result.livestockAction;
          worldRef.current?.finishLivestockInteraction(true);
          farmAudio.playPop();
          setStatus(({steal_livestock:'Đã lấy sản phẩm!',retire_animal:'Vật nuôi đã được nghỉ nuôi!',build_pen:'Chuồng trại đã sẵn sàng!',buy_animal:'Đã đón vật nuôi về chuồng!',feed_animals:'Vật nuôi đã ăn no!',collect_animals:'Đã cất sản phẩm vào kho!',sell_animal:'Đã bán heo trưởng thành!',sell_livestock_product:'Đã bán nông sản!'})[action]);
        }
        if (state.result?.roadsidePurchase) {
          setRoadsidePending(false);
          const purchase = state.result.roadsidePurchase;
          setStatus(`Đã mua ${purchase.amount} ${CROPS[purchase.crop]?.name || purchase.crop} · ${purchase.price} xu`);
        }
        if (state.result?.plotUnlocked) {
          setPlotUnlockPending(false);
          setSelectedPlot(null);
          farmAudio.playFanfare();
          setStatus(`Đã khai hoang ô đất · ${state.result.plotUnlocked.unlockedPlots} ô sử dụng được`);
        }
        if (typeof state.googleLinked === 'boolean' && state.googleLinked !== sessionRef.current.googleLinked) {
          setSession(previous => { const next = { ...previous, googleLinked: state.googleLinked }; saveWorldSession(next); return next; });
        }
        if (state.name && state.name !== sessionRef.current.name) {
          setSession(previous => { const next = { ...previous, name: state.name }; saveWorldSession(next); return next; });
        }
        if (state.result?.profileUpdated) {
          const updatedName = state.result.profileUpdated.name;
          setSession(previous => { const next = { ...previous, name: updatedName }; saveWorldSession(next); return next; });
          gameClientRef.current?.send({ type: 'get_social_state' });
          setStatus('Hồ sơ đã được lưu.');
        }
        if (state.serverNow) fishingServerOffset.current = state.serverNow - Date.now();
        if (state.result?.communityReward) {
          const reward=state.result.communityReward;
          emitReward({text:`+${reward.coins} Xu`,icon:<Icon3dGoldCoin size={20}/>,color:'#f59e0b'});
          farmAudio.playFanfare();setStatus(`Bạn nhận được ${reward.coins} xu!`);
        }
        const confirmedMission = state.result?.missionClaimed;
        const confirmedQuest = state.result?.questClaimed;
        if (confirmedMission || confirmedQuest) {
          const kind = confirmedQuest ? 'legacy' : confirmedMission.kind;
          const id = confirmedQuest?.id || confirmedMission.id;
          const reward = (kind === 'main' ? MAIN_MISSIONS : kind === 'daily' ? DAILY_MISSIONS : QUESTS).find(item => item.id === id);
          if (reward) {
            setMissionRewardEvent({ kind, id, title: reward.title, coins: reward.coins, xp: reward.xp, sequence: ++missionRewardSerial.current });
            setTrackedMission(prev => prev?.kind === kind && prev.id === id ? null : prev);
            emitReward({ text: `+${reward.coins} xu · +${reward.xp} XP`, icon: <Icon3dGoldCoin size={20} />, color: '#f5ad26' });
            farmAudio.playFanfare();
            setStatus(`Đã nhận thưởng: ${reward.title}.`, { silent: true });
          }
        }
        if (state.result?.fashionUpdated) { setStatus('Đã lưu diện mạo mới!');setPanel(null); }
        if (characterCreationRef.current && state.progress?.onboarding?.characterCreated) {
          const created = characterCreationRef.current;
          characterCreationRef.current = null;
          setCharacterCreationPending(false);
          setSession(prev => { const next = { ...prev, name: created.name, avatarIcon: 'starter' }; saveWorldSession(next); return next; });
          setVillageRequired(false);
          setStatus(`Chào mừng ${created.name}! Hãy đến tiệm đồ câu để bắt đầu kiếm xu mua đất.`);
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
          if (state.progress.onboarding?.completed && previousStep === ONBOARDING_STEPS.CLAIM_REWARD) {
            farmAudio.playFanfare();
            window.setTimeout(() => farmAudio.playBicycleBell(), 600);
            setDialogueOpen(false);
            setCelebrationOpen(true);
            setStatus('Chúc mừng! Bạn đã nhận xe đạp và có thể tự do khám phá.');
          } else if ([ONBOARDING_STEPS.EXPLAIN_SYSTEMS, ONBOARDING_STEPS.CLAIM_REWARD].includes(state.progress.onboarding?.step) && state.progress.onboarding.step !== previousStep) {
            setStatus(state.progress.onboarding.step === ONBOARDING_STEPS.EXPLAIN_SYSTEMS ? 'Đã thu hoạch! Hãy gặp Oliver để học cách giao đơn.' : 'Đã giao đơn! Hãy gặp Oliver để nhận xe đạp.');
          }
        }
        if (state.livestock) {setAnimals(state.livestock);worldRef.current?.syncOwnedLivestock(state.livestock,state.progress?.animalPens||{},sessionRef.current.farmId);}
        if (state.position?.villageId === session.villageId) worldRef.current?.restorePlayerPosition(state.position);
        if (state.sessionToken && state.sessionToken !== session.sessionToken) {
          setSession(previous => {
            const updated = { ...previous, sessionToken: state.sessionToken };
            saveWorldSession(updated);
            return updated;
          });
        }
        if (state.progress?.fishing?.pending) {
          fishingCatchDisplayed.current = false;
          setPanel(null);
          const pending = state.progress.fishing.pending;
          if (fishingSessionId.current !== pending.id) {
            fishingSessionId.current = pending.id;
            worldRef.current?.startFishingCast({distance:pending.castDistance,animation:FISHING_CONFIG.rods[pending.rodId]?.animation,target:pending.target,shadowSize:pending.shadowSize});
          }
          worldRef.current?.setFishingPhase?.(pending.phase === 'fighting' ? 'reel' : Date.now()+fishingServerOffset.current >= pending.biteAt ? 'bite' : 'waiting', pending.biteAt-Date.now()-fishingServerOffset.current,{...pending,serverOffset:fishingServerOffset.current});
        } else if (state.result?.fishCaught) {
          fishingSessionId.current = null;
          fishingCatchDisplayed.current = true;
          setCaughtFish(state.result);
          worldRef.current?.finishFishingCatch?.(true, {...LAKE_FISH[state.result.fishCaught],caughtWeight:state.result.weight});
          const fish = LAKE_FISH[state.result.fishCaught];
          const weight = Number(state.result.weight || 0).toFixed(2);
          setStatus(`Câu được ${fish?.name || 'một con cá'} · ${weight} kg · +${state.result.value || fish?.price || 0} xu giá trị`);
        }
        if (!state.progress?.fishing?.pending && !state.result?.fishCaught && !fishingCatchDisplayed.current) { fishingSessionId.current=null;worldRef.current?.clearFishing?.(); }
        if (state.result?.fishEscaped) setStatus(state.result.fishEscaped);
        if (state.result?.fishSold) setStatus(`Đã bán ${state.result.fishSold.count} con cá · +${state.result.fishSold.coins} xu.`);
        if (state.result?.lotteryPurchase || state.result?.lotteryReward) {if(state.result.lotteryPurchase)worldRef.current?.fortuneNPC?.giveTicket?.();setLotteryPending(false);refreshLottery();setStatus(state.result.lotteryReward?`Đã nhận thưởng +${state.result.lotteryReward} xu.`:`Đã mua vé ${state.result.lotteryPurchase.number}.`);}
        if (state.result?.casinoBet) setCasinoResult(state.result.casinoBet.amount ? `Đã giữ ${state.result.casinoBet.amount} xu cho ván.` : 'Đã hủy cược và hoàn xu.');
        if (state.result?.casinoSettlement) {
          const { reward, amount } = state.result.casinoSettlement;
          setCasinoResult(reward === amount ? `Hoàn lại ${reward} xu` : reward > amount ? `Nhận ${reward} xu · lãi ${reward - amount} xu` : `Nhận ${reward} xu · giảm ${amount - reward} xu`);
        }
      },
      onLotteryState: state => { setLotteryState({...state,receivedAt:Date.now()}); setLotteryPending(false); },
      onGoogleAuthResult: result => {
        if (result.status === 'login') {
          try { switchWorldIdentity(result); window.location.reload(); }
          catch (error) { setAuthError(error.message); }
        } else if (result.status === 'logged-out') {
          leaveWorldSession(); window.location.reload();
        } else if (result.status === 'deleted') {
          leaveWorldSession({ deleted: true }); window.location.reload();
        } else if (result.status === 'linked' || result.status === 'already-linked') {
          setSession(previous => { const next = { ...previous, googleLinked: true }; saveWorldSession(next); return next; });
          setStatus('Đã bảo vệ nhân vật bằng Google.');
          setAuthError('');
          setAuthConflict(null);
        } else if (result.status === 'conflict') {
          setAuthConflict({ name: result.name || 'Nhân vật Google', level: result.level || 1 });
          setStatus('Google này đã gắn với một nhân vật khác.');
        } else {
          setAuthError(result.message || 'Không thể xác thực Google.');
          setStatus(result.message || 'Không thể xác thực Google.');
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
    let lastNearbyRankingRefresh = Date.now();
    const timer = window.setInterval(() => {
      const state = worldRef.current?.getPlayerState();
      if (state) client.sendPosition(state);
      if (Date.now() - lastNearbyRankingRefresh >= 30_000) {
        lastNearbyRankingRefresh = Date.now();
        if (client.joined && state && !state.venue && Math.hypot(state.x, state.z - 25.5) < 80) {
          client.send({ type: 'get_social_state' });
        }
      }
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
        worldRef.current?.setFishingPhase?.(pending.phase === 'fighting' ? 'reel' : Date.now()+fishingServerOffset.current >= pending.biteAt ? 'bite' : 'waiting', pending.biteAt-Date.now()-fishingServerOffset.current,{...pending,serverOffset:fishingServerOffset.current});
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [timeMode]);

  // Đồng bộ camera và vị trí ngồi 3D khi vào bàn chơi Casino
  useEffect(() => {
    if (venueMode?.venue === 'casino') {
      if (panel === 'casino' && casinoState?.mine?.game) {
        worldRef.current?.focusCasinoTable(casinoState.mine.game);
      } else if (panel === 'casino' && chosenCasinoGame) {
        worldRef.current?.focusCasinoTable(chosenCasinoGame, true);
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
      if (!session.farmId) {
        const guide = preLandJourney(current);
        if (guide.target === 'lake') target = {x:LAKE_CONFIG.pier.x,z:LAKE_CONFIG.pier.z,y:LAKE_CONFIG.pier.deckY,label:'Hồ câu'};
        else if (guide.target === 'shop') target = {x:LAKE_CONFIG.shop.entranceX,z:LAKE_CONFIG.shop.z,y:0,label:'Tiệm đồ câu'};
      } else if (
        onboarding.step === ONBOARDING_STEPS.MEET_ELDER ||
        onboarding.step === ONBOARDING_STEPS.EXPLAIN_SYSTEMS ||
        onboarding.step === ONBOARDING_STEPS.CLAIM_REWARD
      ) {
        target = { ...WORLD_LAYOUT.villageElder, label: 'Quản Gia Oliver' };
      } else if (onboarding.step === ONBOARDING_STEPS.FIRST_PLANT && current.stats?.harvested > 0) {
        target = { ...WORLD_LAYOUT.villageElder, label: 'Báo Cáo Oliver' };
      } else if (onboarding.step === ONBOARDING_STEPS.FIRST_PLANT) {
        target = { ...playerFarmTarget(session.farmId), y: 0, label: 'Ruộng Nhà' };
      }

      if (target) {
        const dist = worldRef.current.getDistanceTo(target.x, target.z);
        setTargetDistance(Math.round(dist * 10) / 10);
        worldRef.current.setObjective(target);
        setActiveObjective(target);
      } else {
        worldRef.current.setObjective(null);
        setTargetDistance(null);
        setActiveObjective(null);
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
      } else if (event.code === 'KeyC') {
        event.preventDefault();
        const mode = worldRef.current?.toggleCameraView();
        if (mode) setCameraViewMode(mode);
      } else if (event.code === 'KeyO') {
        event.preventDefault();
        setPanel(prev => (prev === 'orders' ? null : 'orders'));
      } else if (event.code === 'KeyQ') {
        event.preventDefault();
        setQuestOpenTab('main');
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
  const livestockAction = async (action, payload = {}, inWorld = false) => {
    if (!network.connected || livestockPendingRef.current || (!session.farmId && !action.startsWith('steal_livestock'))) return;
    const def = FARM_CONFIG.animals[payload.species];
    if (!inWorld && ['build_pen','buy_animal','sell_animal'].includes(action)) {
      const price = action === 'build_pen' ? def?.penCost : action === 'buy_animal' ? def?.buyCost : FARM_CONFIG.products.maturePig.sellPrice;
      const confirmed = await confirmAction({title:action==='build_pen'?`Xây chuồng ${def.name.toLowerCase()}?`:action==='buy_animal'?`Đón ${def.name.toLowerCase()} về chuồng?`:'Bán heo trưởng thành?',message:action==='sell_animal'?`Nhận ${price} xu và trống một chỗ trong chuồng.`:action==='build_pen'?`Có chỗ cho ${def.capacity} vật nuôi.`:'Cho ăn để bắt đầu chăm sóc.',price,asset:'coin',confirmLabel:action==='sell_animal'?'Bán heo':action==='build_pen'?'Xây chuồng':'Đón về'});
      if (!confirmed || !gameClientRef.current?.joined || livestockPendingRef.current) return;
    }
    livestockPendingRef.current=true; setLivestockPending(true);
    const sent=gameClientRef.current?.sendGameAction(action,payload);
    if(sent===false){livestockPendingRef.current=false;setLivestockPending(false);}
    return sent !== false;
  };
  const feedAnimals = () => livestockAction('feed_animals');
  const collectAnimals = () => livestockAction('collect_animals');
  const chooseCrop = crop => {
    if (!network.connected || !gameClientRef.current) { setStatus('Chưa có kết nối. Hãy thử đổi hạt giống sau.'); return; }
    if (progress.level < crop.level) { setStatus(`${crop.name} mở khóa ở cấp ${crop.level}`); return; }
    farmAudio.playPop();
    gameClientRef.current?.sendGameAction('select_crop', { crop: crop.id });
    if (worldRef.current?.canUseFarmTools()) selectTool('seed');
    setStatus(worldRef.current?.canUseFarmTools()
      ? `Đang chọn hạt ${crop.name} · giá ${crop.seedCost} xu khi gieo`
      : `Đang chọn hạt ${crop.name}. Về nông trại để gieo.`);
  };
  const sellItem = (id, amount = 1) => {
    const crop = CROPS[id];
    if (!crop || progress.inventory[id] < amount) return;
    farmAudio.playCoins();
    gameClientRef.current?.sendGameAction('sell_item', { id, amount });
    setStatus(`Đang bán ${amount} ${crop.name}…`);
  };
  const deliverOrder = order => {
    if (!canFillOrder(progress, order) || progress.completedOrders.includes(order.id)) return;
    farmAudio.playFanfare();
    gameClientRef.current?.sendGameAction('deliver_order', { id: order.id });
    setStatus(`Đang giao đơn “${order.title}”…`);
  };
  const claimQuest = quest => {
    if (progress.stats[quest.stat] < quest.goal || progress.claimedQuests.includes(quest.id)) return;
    gameClientRef.current?.sendGameAction('claim_quest', { id: quest.id });
    setStatus('Đang nhận thưởng nhiệm vụ…');
  };
  const claimMissionReward = (kind, mission) => {
    if (!network.connected) return;
    gameClientRef.current?.sendGameAction('claim_mission', { kind, id: mission.id });
    setStatus('Đang nhận thưởng nhiệm vụ…');
  };

  const handleSendChat = (text, emoteChar) => {
    if (!text && !emoteChar) return;
    if (text) {
      gameClientRef.current?.sendChat(text, emoteChar);
    } else if (emoteChar) {
      gameClientRef.current?.sendEmote(emoteChar);
    }
    worldRef.current?.showChatBubble(session.playerId, text, emoteChar);
    farmAudio.playPop();
  };

  const handleTriggerEmote = (emoteChar) => {
    handleSendChat('', emoteChar);
    farmAudio.playFanfare();
    setStatus(`Bạn thả biểu cảm: ${emoteChar}`);
  };

  const craft = recipe => {
    const ready = Object.entries(recipe.inputs).every(([id, count]) => progress.inventory[id] >= count);
    if (!ready) { setStatus(`Chưa đủ nguyên liệu làm ${recipe.name}`); return; }
    farmAudio.playPop();
    gameClientRef.current?.sendGameAction('craft', { id: recipe.id });
    setStatus(`Đang chế biến ${recipe.name}…`);
  };
  const sellProduct = (id, price, name) => {
    if (!progress.inventory[id]) return;
    farmAudio.playCoins();
    gameClientRef.current?.sendGameAction('sell_product', { id });
    setStatus(`Đang bán ${name}…`);
  };
  const unlockPlot = tileKey => {
    if (!network.connected || plotUnlockPending) return;
    const sent = gameClientRef.current?.sendGameAction('unlock_plot', { tileKey });
    if (sent !== false) { setPlotUnlockPending(true); setStatus('Đang mở thêm ô đất…'); }
  };
  const upgradeBarn = () => {
    const cost = farmBarnUpgradeCost(progress.barnLevel);
    if (progress.coins < cost) { setStatus(`Cần ${cost} xu để nâng kho`); return; }
    farmAudio.playFanfare();
    gameClientRef.current?.sendGameAction('upgrade_barn');
    setStatus('Đang nâng cấp kho…');
  };
  const upgradeHome = () => {
    const cost = 1800;
    const requiredLevel = 4;
    if ((progress.homeTier || 1) >= 2) { setStatus('Nhà của bạn đã đạt cấp hiện có cao nhất'); return; }
    if (progress.level < requiredLevel || progress.coins < cost) { setStatus(`Cần cấp ${requiredLevel} và ${cost} xu để mua Nhà Nông Trại Ấm Cúng`); return; }
    farmAudio.playFanfare();
    gameClientRef.current?.sendGameAction('upgrade_home');
    setStatus('Đang nâng cấp nhà…');
  };
  const resetOrders = () => {
    if (progress.completedOrders.length < ORDERS.length || progress.coins < 25) return;
    gameClientRef.current?.sendGameAction('reset_orders');
    setStatus('Đang làm mới đơn hàng…');
  };
  const travelTo = async destination => {
    if (destination.id === 'farm' && !session.farmId) { setFocusedLand(null); setPanel('land'); setStatus('Bạn cần mua một lô đất trước.'); return; }
    const target = destination.id === 'farm'
      ? { ...destination, ...playerFarmTarget(session.farmId) }
      : destination.id === 'town' ? { ...destination, ...TOWN_SPAWN } : destination;
    if (!network.connected) { setStatus('Kết nối lại để đến điểm này.'); return; }
    const position = worldRef.current?.getPlayerState();
    if (!position) return;
    const cost = travelCost(position, target);
    if (progress.coins < cost) { setStatus(`Cần ${cost} xu để dịch chuyển.`); return; }
    if (!await confirmAction({title:`Đến ${destination.label}?`,message:'Dịch chuyển nhanh đến địa điểm này. Phí thực tế được tính theo vị trí khi khởi hành.',price:cost,asset:'map',confirmLabel:'Dịch chuyển'})) return;
    if (!gameClientRef.current?.joined) { setStatus('Kết nối lại để đến điểm này.'); return; }
    gameClientRef.current?.sendTravel(target);
    setPanel(null);
    setStatus(`Đang dịch chuyển tới ${destination.label}…`);
  };
  const buyOutfit = outfit => {
    const owned = progress.ownedOutfits.includes(outfit.id);
    if (!owned && progress.coins < outfit.cost) { setStatus(`Cần ${outfit.cost} xu để mua trang phục`); return; }
    gameClientRef.current?.sendGameAction('buy_outfit', { id: outfit.id });
    setStatus(`Đang chuẩn bị ${outfit.name}…`);
  };
  const buyVehicle = vehicle => {
    const owned = progress.ownedVehicles.includes(vehicle.id);
    if (!owned && progress.coins < vehicle.cost) { setStatus(`Cần ${vehicle.cost} xu để mua ${vehicle.name}`); return; }
    gameClientRef.current?.sendGameAction('buy_vehicle', { id: vehicle.id });
    setStatus(`Đang chuẩn bị ${vehicle.name}…`);
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
  const fishingCast = (castInput = {}) => {
    if (!network.connected || progress.fishing?.pending) return;
    if (!fishingWater) { setStatus('Hãy đứng sát bờ nước để thả câu.'); return; }
    if (!progress.fishing?.equippedRod) { setStatus('Hãy mua và trang bị cần câu trước.'); return; }
    gameClientRef.current?.sendGameAction('fishing_cast', castInput);
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
    if (!network.connected) { setCharacterCreationError('Chưa có kết nối. Vui lòng thử lại.'); return; }
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
    setStatus('Đang nhận xe đạp…');
  };

  const handleResetTutorial = () => {
    gameClientRef.current?.sendGameAction('reset_onboarding');
    setGuideOpen(false);
    setDialogueOpen(true);
    setStatus('Đã bắt đầu lại hướng dẫn của Oliver.');
  };

  const handleNavigateFishing = target => {
    if (target === 'shop' && venueMode?.venue === 'fishing') { setPanel('fishing'); return; }
    setPanel(null);
    if (venueMode) worldRef.current?.exitVenue();
    const point = target === 'lake' ? {x:LAKE_CONFIG.pier.x,z:LAKE_CONFIG.pier.z} : {x:LAKE_CONFIG.shop.entranceX,z:LAKE_CONFIG.shop.z};
    worldRef.current?.moveToTarget(point);
    setStatus(target === 'lake' ? 'Đến mép hồ, mở thao tác câu để thả cần.' : 'Đến tiệm đồ câu để mua cần hoặc bán cá.');
  };

  const handleNavigateTarget = () => {
    const step = progress.onboarding?.step;
    if (
      step === ONBOARDING_STEPS.MEET_ELDER ||
      step === ONBOARDING_STEPS.EXPLAIN_SYSTEMS ||
      step === ONBOARDING_STEPS.CLAIM_REWARD
    ) {
      worldRef.current?.moveToTarget({ ...WORLD_LAYOUT.villageElder, z: WORLD_LAYOUT.villageElder.z - 2.5 }, () => setDialogueOpen(true));
      setStatus('Đang đi tới Quản Gia Oliver…');
    } else if (step === ONBOARDING_STEPS.FIRST_PLANT) {
      worldRef.current?.moveToTarget(playerFarmTarget(session.farmId));
      setStatus('Đang đi tới ô ruộng…');
    }
  };

  const handleVisitRoadsideShop = () => {
    if (venueMode) { setStatus('Hãy ra ngoài để đến gian hàng ven đường.'); return; }
    setRoadsideOpen(false);
    worldRef.current?.moveToTarget(NPC_TRADING_CONFIG.roadside.approach, () => setRoadsideOpen(true));
    setStatus('Đang đi tới gian hàng ven đường…');
  };

  const handleBuyOffer = offer => {
    const shop = NPC_TRADING_CONFIG.roadside;
    if (!worldRef.current || venueMode || worldRef.current.getDistanceTo(shop.position.x, shop.position.z) > shop.interactionDistance) {
      handleVisitRoadsideShop();
      return;
    }
    const sent = gameClientRef.current?.sendGameAction('roadside_buy', { crop: offer.crop, amount: offer.amount });
    if (!sent) { setStatus('Chưa kết nối. Hãy thử lại khi có mạng.'); return; }
    setRoadsidePending(true);
    setStatus('Đang chờ xác nhận mua nông sản…');
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
    if(panelId==='livestock'){worldRef.current?.openLivestockControls();return;}
    if (isFeatureLocked(progress, panelId)) {
      setStatus('Tính năng này sẽ mở sau khi hoàn thành hướng dẫn của Quản Gia Oliver!');
      return;
    }
    if (panelId === 'land') setFocusedLand(null);
    if (panelId === 'quests') setQuestOpenTab('main');
    setPanel(panelId);
  };

  const showCharacterCreation = !progress.onboarding?.characterCreated || villageRequired;
  const handleGoogleCredential = (credential, mode) => {
    googleCredentialRef.current = credential;
    setAuthError('');
    const sent = gameClientRef.current?.sendNow({ type: mode === 'link' ? 'google_link' : 'google_login', credential });
    if (!sent) setAuthError('Chưa có kết nối. Vui lòng thử lại.');
    else setStatus(mode === 'link' ? 'Đang bảo vệ nhân vật bằng Google…' : 'Đang đăng nhập Google…');
  };
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
  const fortunePosition=worldRef.current?.getPlayerState?.();
  const nearFortune=fortunePosition&&Math.hypot(fortunePosition.x-LOTTERY_CONFIG.npc.x,fortunePosition.z-LOTTERY_CONFIG.npc.z)<=LOTTERY_CONFIG.npc.radius;
  const contextAction = panel || venueMode || !gameStarted ? null : nearFortune ? {iconAsset:'ticket',label:'Thần Tài · Mua vé',hint:'Vé may mắn · E',onClick:()=>setPanel('fortune')} : nearbyFarmGate ? {
    iconAsset: 'gate',
    label: nearbyFarmGate.open ? 'Đóng cổng' : 'Mở cổng',
    hint: 'Cổng nông trại · E',
    onClick: () => network.connected && worldRef.current?.interactFarmGate(),
  } : nearbyLot ? {
    iconAsset: 'land',
    label: `Xem lô đất ${currentFarmZone.lotNumber}`,
    hint: 'Kiểm tra giá và mua',
    onClick: () => { setFocusedLand(currentFarmZone.farmId); setPanel('land'); gameClientRef.current?.send({ type: 'resync' }); },
  } : fishingWater ? (progress.fishing?.equippedRod ? null : {
    iconAsset: 'fishing',
    label: `Câu cá · ${FISHING_WATER_NAMES[fishingWater]}`,
    hint: 'Trang bị cần câu để bắt đầu',
    onClick: () => setPanel('fishing'),
  }) : currentFarmZone?.isOwner ? null : !session.farmId && progress.onboarding?.characterCreated ? {
    iconAsset: 'land',
    label: 'Chọn đất nông trại',
    hint: 'Xem các lô đất đang bán',
    onClick: () => { setFocusedLand(null); setPanel('land'); },
  } : null;

  return (
    <main className={`game-shell pt-game-shell compact-game-hud${venueMode ? ' in-venue' : ''}${confirmation || panel || phoneOpen || dialogueOpen || guideOpen || celebrationOpen || roadsideOpen || leaderboardOpen || plazaNoticeOpen || showCharacterCreation ? ' hud-modal-open' : ''}`}>
      <canvas ref={canvasRef} className="game-canvas" tabIndex={0} onPointerDown={event => event.currentTarget.focus({ preventScroll: true })} aria-label="Thế giới nông trại 3D" />
      {gameStarted && boot.phase === 'ready' && (!panel || progress.fishing?.pending) && <FishingHUD conditions={fishingConditions} fishing={progress.fishing} connected={network.connected} water={fishingWater} cast={fishingCast} send={(action,payload)=>gameClientRef.current?.sendGameAction(action,payload)} serverOffset={fishingServerOffset.current} caught={caughtFish} clearCaught={()=>{fishingCatchDisplayed.current=false;setCaughtFish(null);worldRef.current?.clearFishing?.();}} />}
      {/* Play Together Title & Start Screen */}
      {!gameStarted && (
        <GameStartScreen
          bootPhase={boot.phase}
          bootError={boot.error}
          bootProgress={bootProgress}
          onRequestStart={() => setStartRequested(true)}
          onGoogleCredential={credential => handleGoogleCredential(credential, 'login')}
          authError={authError}
          playerName={session.name}
          playerLevel={progress.level}
          googleLinked={session.googleLinked}
          onBeginExit={() => {
            worldRef.current?.playStartCinematic?.();
          }}
          onStart={() => {
            if (boot.phase !== 'ready' || bootProgress.percentage < 100) return;
            setSession(previous => { const next = { ...previous, hasEnteredWorld: true, signedOut: false }; saveWorldSession(next); return next; });
            dismissToast();
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
            setStatus(nextPreset === 'auto' ? 'Đã chọn hình ảnh tự động' : nextPreset === 'ultra' ? 'Đã chọn hình ảnh siêu nét' : nextPreset === 'balanced' ? 'Cân bằng' : 'Tiết kiệm pin');
          }}
        />
      )}

      {authConflict && <GoogleAccountConflictDialog current={{ name: session.name, level: progress.level }} saved={authConflict}
        onSwitch={() => { setAuthConflict(null); handleGoogleCredential(googleCredentialRef.current, 'login'); }}
        onStay={() => { setAuthConflict(null); googleCredentialRef.current = null; }}/>
      }

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

      {gameStarted && (
        <>
      {/* PLAY TOGETHER STANDARD TOPBAR */}
      {gameStarted && (
        <GameHudTopbar progress={progress} name={session.name} notifications={hasPendingNotifications} dailyReward={dailyRewardAvailable}
          onProfile={() => { setProfileTarget(session.playerId); setViewedProfile(null); gameClientRef.current?.send({ type: 'get_profile', playerId: session.playerId }); }}
          onShop={() => setPanel('shop')}
          onMissions={() => { setQuestOpenTab('main'); setPanel('quests'); }}
          onInventory={() => { farmAudio.playPop(); setPanel(prev => prev === 'inventory' ? null : 'inventory'); }}
          onFashion={() => { farmAudio.playPop(); setPanel('fashion'); }}
          onCamera={() => { farmAudio.playPop(); const mode = worldRef.current?.toggleCameraView(); if (mode) setCameraViewMode(mode); }}
          onPhone={() => { farmAudio.playPop(); setPhoneOpen(true); }}
        />
      )}

      {/* One objective tracker for the entire newcomer journey. */}
      {gameStarted && !showCharacterCreation && progress.onboarding && !progress.onboarding.completed && (
        <OnboardingHUD
          progress={progress}
          hasFarm={Boolean(session.farmId)}
          targetDistance={targetDistance}
          onOpenLand={() => { setFocusedLand(null); setPanel('land'); }}
          onNavigateFishing={handleNavigateFishing}
          onNavigateTarget={handleNavigateTarget}
          onTalkToElder={() => targetDistance != null && targetDistance > 3.5
            ? worldRef.current?.moveToTarget({ ...WORLD_LAYOUT.villageElder, z: WORLD_LAYOUT.villageElder.z - 2.5 }, () => setDialogueOpen(true))
            : setDialogueOpen(true)}
          onOpenGuide={() => setGuideOpen(true)}
          onOpenOrders={handleOpenOrders}
          onOpenMissions={() => { setQuestOpenTab('main'); setPanel('quests'); }}
        />
      )}
      {gameStarted && !showCharacterCreation && progress.onboarding?.completed && <MissionTracker missionContext={{ hasLivestock: animals.length > 0, livestock:animals, seed:session.playerId }} progress={progress} legacyQuests={QUESTS} trackedMission={trackedMission} onOpen={kind => { setQuestOpenTab(kind); setPanel('quests'); }} />}

      {gameStarted && !showCharacterCreation && (
        <nav className="mission-hud-links" aria-label="Nhiệm vụ">
          {!progress.onboarding?.completed && <button type="button" aria-current="step" onClick={() => { if (!session.farmId) { const guide = preLandJourney(progress); if (guide.target === 'land') setPanel('land'); else handleNavigateFishing(guide.target); } else if (progress.onboarding?.step === ONBOARDING_STEPS.DELIVER_ORDER) handleOpenOrders(); else handleNavigateTarget(); }}><HudIcon asset="seeds" size={26}/><span>Tân thủ</span></button>}
          <button type="button" onClick={() => { setQuestOpenTab('main'); setPanel('quests'); }}><HudIcon asset="quest" size={26}/><span>Chính tuyến</span></button>
          <button type="button" onClick={() => { setQuestOpenTab('daily'); setPanel('quests'); }}><HudIcon asset="basket" size={26}/><span>Hằng ngày</span></button>
        </nav>
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
          {/* Avatar Speech Bubble Chat Bar */}
          {gameStarted && (
            <AvatarChatBar
              onSendChat={handleSendChat}
              disabled={Boolean(panel || showCharacterCreation || venueMode)}
            />
          )}
        </>
      )}

      {/* Floating Indicator when walking inside a Farm Estate */}
      {theftProgress && <aside className="farm-theft-progress" role="status"><b>Đang lấy nông sản</b><small>Đứng yên · di chuyển để hủy</small><div><i style={{ animationDuration: `${theftProgress.durationMs}ms` }} /></div></aside>}
      {currentFarmZone && (
        <aside className={`farm-zone-badge ${currentFarmZone.isOwner ? 'owner' : 'visitor'}`}>
          <span className="zone-icon">{currentFarmZone.isOwner ? <Icon3dCrown size={24} /> : <Icon3dHouseCabin size={24} />}</span>
          <span className="zone-text">
            {currentFarmZone.isOwner
              ? `Nông trại của bạn · Lô ${currentFarmZone.lotNumber}`
              : `Nông trại ${currentFarmZone.ownerName}`}
          </span>
          <span className="zone-tag">{currentFarmZone.isOwner ? 'Khu vực canh tác của bạn' : 'Đang ghé thăm bạn bè'}</span>
        </aside>
      )}

      <HudContextAction action={contextAction} />

      {currentFarmZone?.isOwner && !venueMode && <button type="button" className="livestock-action-btn farm-herd-compact" onClick={() => worldRef.current?.openLivestockControls()}><Icon3dChicken size={28}/> Vật nuôi · {animals.length}</button>}

{currentFarmZone?.isOwner && !venueMode && <FarmToolDock crops={CROPS} cropIcons={cropIcons} progress={progress} connected={network.connected} activeTool={activeTool} selectTool={selectTool} chooseCrop={chooseCrop} openHerd={()=>worldRef.current?.openLivestockControls()} openInventory={()=>setPanel('inventory')} onAutoWork={() => { const world = worldRef.current; if (network.connected && world?.canUseFarmTools() && world.player) world.farming?.interactNearest(world.player.root.position); }}/>}
      {!venueMode && gameStarted && <FarmMinimap worldRef={worldRef} farmTarget={session.farmId?playerFarmTarget(session.farmId):null} objectiveTarget={activeObjective} onOpenMap={()=>handleMenuClick('map')}/>}

      {/* Play Together Kaia Smartphone OS Device Modal */}
      {phoneOpen && phonePage === 'settings' && <FarmSettingsModal name={session.name} level={progress.level} googleLinked={session.googleLinked}
        onCredential={credential => handleGoogleCredential(credential, 'link')} error={authError}
        onLogout={async () => { if (!await confirmAction({title:'Đăng xuất?',message:'Nhân vật và nông trại của bạn được giữ lại. Bạn sẽ trở về màn hình bắt đầu.',asset:'logout',confirmLabel:'Đăng xuất'})) return; if (!gameClientRef.current?.sendNow({ type: 'google_logout' })) setAuthError('Chưa có kết nối để đăng xuất.'); }}
        onDelete={async () => { if (!await confirmAction({title:'Xoá tài khoản?',message:'Xoá nhân vật, xu, túi đồ, trang phục, bạn bè và đất sở hữu. Không thể khôi phục. Tài khoản Google của bạn không bị xoá.',asset:'quest',confirmLabel:'Xoá tài khoản'})) return; if (!gameClientRef.current?.sendNow({type:'account_delete',confirm:'DELETE_ACCOUNT'})) setAuthError('Chưa có kết nối. Nhân vật của bạn chưa bị xoá.'); }}
        isMuted={isMuted} onToggleAudio={() => setIsMuted(farmAudio.toggleMute())}
        graphicsQuality={graphicsQuality} onGraphicsChange={quality => { setGraphicsQuality(quality); worldRef.current?.setGraphicsQuality(quality); }}
        cameraViewMode={cameraViewMode} onCameraChange={() => { const mode = worldRef.current?.toggleCameraView(); if (mode) setCameraViewMode(mode); }}
        onGuide={() => { setPhoneOpen(false); setGuideOpen(true); }} onClose={() => setPhonePage('home')}/> }
      {phoneOpen && phonePage !== 'settings' && (
        <div className="pt-phone-backdrop" onClick={() => setPhoneOpen(false)}>
          <div className="pt-phone-device" onClick={event => event.stopPropagation()}>
            <div className="pt-phone-notch" />

            <div className="pt-phone-status-bar">
              <span className="pt-phone-clock">
                <GameClock compact />
              </span>
              <div className="pt-phone-status-right">
                <span className="pt-phone-signal">5G ●●●●</span>
                <span className="pt-phone-battery"><Icon3dBatteryEco size={16} /> 100%</span>
                <button type="button" className="pt-phone-close" onClick={() => setPhoneOpen(false)} aria-label="Đóng điện thoại">×</button>
              </div>
            </div>

            <div className="pt-phone-user-strip" role="button" tabIndex={0} onClick={() => { setPhoneOpen(false); setProfileTarget(session.playerId); setViewedProfile(null); gameClientRef.current?.send({ type: 'get_profile', playerId: session.playerId }); }} onKeyDown={event => { if (event.key === 'Enter') event.currentTarget.click(); }}>
              <div className="pt-phone-avatar-bubble">
                <Icon3dCrown size={22} />
              </div>
              <div className="pt-phone-greeting">
                <b>{session.name || 'Nông Dân Kaia'}</b>
                <small>Cấp {progress.level} · {session.farmAddress?.villageName || 'Thung Lũng Bình Minh'}</small>
              </div>
            </div>

            {phonePage !== 'home' && <button type="button" className="pt-phone-back" onClick={() => setPhonePage('home')}>‹ Menu</button>}
            {phonePage === 'home' && <div className="pt-phone-app-grid">
              <button type="button" className="pt-app-bubble" onClick={()=>{setPhoneOpen(false);setPanel('fortune');}}><div className="pt-app-icon"><HudIcon asset="coin" size={40}/></div><span>Vé may mắn{lotteryState?.tickets?.some(t=>t.prize>0&&!t.claimed)?' • Nhận thưởng':''}</span></button>
              <button type="button" className="pt-app-bubble" onClick={() => { setPhoneOpen(false); handleMenuClick('inventory'); }}>
                <div className="pt-app-icon"><HudIcon asset="backpack" size={40} /></div><span>Túi đồ</span>
              </button>
              <button
                type="button"
                className="pt-app-bubble app-fashion"
                onClick={() => { setPhoneOpen(false); setPanel('fashion'); }}
                title="Tiệm Thời Trang & Tủ Đồ Play Together"
              >
                <div className="pt-app-icon"><HudIcon asset="wardrobe" size={40} /></div>
                <span>Thời Trang</span>
              </button>
              <button
                type="button"
                className="pt-app-bubble app-market"
                onClick={() => { setPhoneOpen(false); setRoadsideOpen(true); }}
              >
                <div className="pt-app-icon"><HudIcon asset="shop" size={40} /></div>
                <span>Chợ</span>
              </button>

              <button
                type="button"
                className="pt-app-bubble app-quests"
                onClick={() => { setPhoneOpen(false); handleMenuClick('quests'); }}
              >
                <div className="pt-app-icon">
                  <HudIcon asset="quest" size={40} />
                  {(legacyQuestReady || missionRewardsReady) && (
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
                <div className="pt-app-icon"><HudIcon asset="map" size={40} /></div>
                <span>Bản Đồ</span>
              </button>

              <button type="button" className="pt-app-bubble app-land" onClick={() => setPhonePage('farm')}>
                <div className="pt-app-icon"><HudIcon asset="land" size={40} /></div><span>Nông trại</span>
              </button>

              <button
                type="button"
                className="pt-app-bubble app-notice"
                onClick={() => { setPhoneOpen(false); setPlazaNoticeOpen(true); }}
                title={dailyRewardAvailable ? `Điểm danh · Nhận ${dailyAttendance.coins} xu hôm nay` : 'Bảng tin & hoạt động thị trấn'}
                aria-label={dailyRewardAvailable ? `Điểm danh, có quà ${dailyAttendance.coins} xu hôm nay` : 'Điểm danh'}
              >
                <div className="pt-app-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><HudIcon asset="quest" size={40} />{dailyRewardAvailable && <DailyRewardBadge/>}</div>
                <span>Điểm danh</span>{dailyRewardAvailable && <small className="pt-daily-reward-hint">Nhận quà</small>}
              </button>
              <button type="button" className="pt-app-bubble app-guide" onClick={() => setPhonePage('settings')}>
                <div className="pt-app-icon"><HudIcon asset="settings" size={40} /></div><span>Thiết lập</span>
              </button>
            </div>}

            {phonePage === 'farm' && <div className="pt-phone-submenu" aria-label="Nông trại">
              <button type="button" onClick={() => { setPhoneOpen(false); setFocusedLand(null); setPanel('land'); }}><Icon3dHouseCabin size={24} /> {session.farmId ? 'Đất đai' : 'Mua đất'}</button>
              <button type="button" onClick={() => { setPhoneOpen(false); handleMenuClick('orders'); }}><Icon3dOrdersBox size={24} /> Đơn hàng {ORDERS.some(order => canFillOrder(progress, order)) ? '• Có thể giao' : ''}</button>
              <button type="button" onClick={() => { setPhoneOpen(false); handleMenuClick('factory'); }}><Icon3dMill size={24} /> Chế biến {isFeatureLocked(progress, 'factory') ? '🔒' : ''}</button>
              <button type="button" onClick={() => { setPhoneOpen(false); handleMenuClick('upgrade'); }}><Icon3dHammer size={24} /> Nâng cấp {isFeatureLocked(progress, 'upgrade') ? '🔒' : ''}</button>
            </div>}


            <div className="pt-phone-home-bar" onClick={() => setPhoneOpen(false)}>
              <span className="pt-home-indicator" />
            </div>
          </div>
        </div>
      )}
</>
      )}

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
        worldRef={worldRef}
        objectiveTarget={activeObjective}
        coins={progress.coins}
        connected={network.connected}
        onClose={() => setPanel(null)}
        onTravel={travelTo}
        session={session}
        playerCoord={worldRef.current?.getPlayerState?.() || { x: 0, z: 0 }}
        currentZone={zoneAtPosition((worldRef.current?.getPlayerState?.()?.x) || 0, (worldRef.current?.getPlayerState?.()?.z) || 0)}
      />

      {/* Play Together Inventory Modal (Túi Đồ Cao Cấp 3D) */}
      <PlayTogetherInventoryModal
        isOpen={panel === 'inventory'}
        connected={network.connected}
        onClose={() => setPanel(null)}
        onOpenFashion={() => setPanel('fashion')}
        progress={progress}
        onUseItem={(item) => {
          if (!network.connected) { setStatus('Kết nối lại để thao tác với túi đồ.'); return; }
          if (item.kind === 'crop') sellItem(item.itemId);
          else if (item.itemId==='apple') gameClientRef.current?.sendGameAction('sell_livestock_product',{id:'apple'});
          else if (['rod', 'bait', 'gear'].includes(item.kind)) {
            gameClientRef.current?.sendGameAction('fishing_equip', { id: item.itemId });
            setStatus('Đang trang bị…');
          }
        }}
        farmAudio={farmAudio}
      />

      {panel === 'vehicles' && <VehicleShowroom vehicles={vehicles} owned={progress.ownedVehicles || []} current={progress.vehicle} coins={progress.coins} connected={network.connected} onBuy={buyVehicle} onClose={() => setPanel(null)}/> }
      {panel === 'shop' && <FarmSuppliesModal progress={progress} connected={network.connected} onChooseCrop={chooseCrop} onClose={() => setPanel(null)}/> }
      {panel === 'fishing' && <FishingShopModal conditions={fishingConditions} progress={progress} connected={network.connected} fishingWater={fishingWater} fishingTick={fishingTick} onAction={(action,payload)=>gameClientRef.current?.sendGameAction(action,payload)} onSellAll={fishingSellAll} onClose={()=>setPanel(null)}/> }
      {panel === 'quests' && <MissionBoard missionContext={{ hasLivestock: animals.length > 0, livestock:animals, seed:session.playerId }} progress={progress} legacyQuests={QUESTS} connected={network.connected} rewardEvent={missionRewardEvent} trackedMission={trackedMission} initialTab={questOpenTab} onClose={() => setPanel(null)} onTrack={(kind, id) => setTrackedMission(prev => prev?.kind === kind && prev.id === id ? null : { kind, id })} onClaim={claimMissionReward} onClaimLegacy={claimQuest} onNavigate={mission => {
          if (['fishCaught','fishSold'].includes(mission.stat)) handleNavigateFishing(mission.stat === 'fishCaught' ? 'lake' : 'shop');
          else if (['planted', 'watered', 'harvested'].includes(mission.stat)) setPanel(currentFarmZone?.isOwner ? null : 'map');
          else if (mission.stat === 'landTiles') setPanel('upgrade');
          else if (mission.stat === 'orders') setPanel('orders');
          else if (mission.stat === 'animalsFed') worldRef.current?.openLivestockControls();
          else if (mission.stat === 'crafted') setPanel('factory');
        }} />}
      {panel && panel !== 'fortune' && panel !== 'quests' && panel !== 'fishing' && panel !== 'shop' && panel !== 'vehicles' && panel !== 'orders' && panel !== 'fashion' && panel !== 'casino' && panel !== 'map' && panel !== 'inventory' && (
        <div className="panel-backdrop" onClick={() => { farmAudio.playPop(); setPanel(null); }}>
          <section className={`game-panel ${panel === 'land' ? 'land-game-panel' : panel === 'upgrade' ? 'farm-upgrade-panel' : panel === 'livestock' ? 'livestock-game-panel' : ''}`} onClick={event => event.stopPropagation()} role="dialog" aria-modal="true">
            <header>
              <div>
                <small>{PANEL_INFO[panel]?.badge || 'TRUNG TÂM NÔNG TRẠI'}</small>
                <h2>{PANEL_INFO[panel]?.title || panel}</h2>
              </div>
              <button type="button" onClick={() => { farmAudio.playPop(); setPanel(null); }} aria-label="Đóng">✕</button>
            </header>
        {panel === 'land' && <LandMarket lots={landLots} focusFarmId={focusedLand} playerId={session.playerId} ownsLand={Boolean(session.farmId)} coins={progress.coins} pending={landPending} onVisit={lot => { const gate = WORLD_VILLAGES.find(v => v.id === lot.villageId)?.gate; if (gate) travelTo({ id: lot.villageId, label: lot.villageName, ...gate }); }} onBuy={async lot => { if (!network.connected) { setStatus('Chưa có kết nối.'); return; } if (!await confirmAction({title:`Mua lô ${lot.lot}?`,message:`${lot.villageName} · Nhận nhà nhỏ và đất trồng khởi đầu.`,price:firstLandPurchasePrice(lot.price),asset:'land',confirmLabel:'Mua đất'})) return; if(!gameClientRef.current?.joined){setStatus('Chưa có kết nối.');return;} setLandPending(true); gameClientRef.current?.sendGameAction('buy_land', { farmId: lot.farmId }); }} />}


        {panel === 'factory' && <div className="item-list">{RECIPES.map(recipe => <Fragment key={recipe.id}><button disabled={!network.connected || !Object.entries(recipe.inputs).every(([id,count]) => (progress.inventory[id] || 0) >= count)} onClick={() => craft(recipe)}><i>{recipeIcons[recipe.id]}</i><span><b>{recipe.name}</b><small>{Object.entries(recipe.inputs).map(([id,count]) => `${CROPS[id]?.name || FARM_CONFIG.products[id]?.name || id} ${count}`).join(' · ')} · +{recipe.xp} XP · bán {recipe.sell} xu</small></span><em>Chế biến</em></button><button disabled={!network.connected || !(progress.inventory[recipe.id] > 0)} onClick={() => sellProduct(recipe.id, recipe.sell, recipe.name)}><span><b>Bán {recipe.name.toLowerCase()}</b><small>Trong kho: {progress.inventory[recipe.id] || 0} · bán 1 sản phẩm</small></span><em>{recipe.sell} xu</em></button></Fragment>)}</div>}
        {panel === 'upgrade' && <FarmUpgradePanel progress={progress} animals={animals} selectedKey={selectedPlot} onSelect={setSelectedPlot} onUnlock={unlockPlot} connected={network.connected} pending={plotUnlockPending} ownsLand={Boolean(session.farmId)} onUpgradeBarn={upgradeBarn} onUpgradeHome={upgradeHome}/>}

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


      </section></div>)}

      {/* Sophie's Fashion Boutique Modal */}
      {panel === 'fashion' && (
        <FashionBoutiqueModal
          connected={network.connected}
          currentCustomization={progress.customization || getDefaultCustomization()}
          ownedItems={progress.ownedCustomization || []}
          coins={progress.coins}
          onSaveAndEquip={(newCustomization, newOwnedItemIds, totalCost) => {
            if (!network.connected) { setStatus('Kết nối lại để lưu thời trang.');return; }
            gameClientRef.current?.sendGameAction('fashion_save_customization', {
              customization: newCustomization,
              newOwnedItemIds,
              totalCost,
            });
            setStatus('Đang lưu diện mạo mới…');
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
          hasFarm={!!session.farmId}
          progress={progress}
          onClose={() => setGuideOpen(false)}
          onResetTutorial={handleResetTutorial}
          onNavigateStep={() => {
            setGuideOpen(false);
            if (!session.farmId) { const guide = preLandJourney(progress); if (guide.target === 'land') setPanel('land'); else handleNavigateFishing(guide.target); return; }
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



      {/* Roadside Shop Modal */}
      {roadsideOpen && (
        <RoadsideShopModal
          progress={progress}
          onBuyOffer={handleBuyOffer}
          onVisitShop={handleVisitRoadsideShop}
          onOpenInventory={() => { setRoadsideOpen(false); setPanel('inventory'); }}
          pending={roadsidePending}
          connected={network.connected}
          onClose={() => setRoadsideOpen(false)}
        />
      )}

      {/* Plaza Leaderboard Monument Modal */}
      {leaderboardOpen && (
        <LeaderboardModal
          leaderboard={socialState.leaderboard}
          leaderboards={socialState.leaderboards}
          myRanks={socialState.myRanks}
          myPlayer={{ playerId:session.playerId, name: session.name, progress }}
          onVisitFarm={friendId => {
            setLeaderboardOpen(false);
            setProfileTarget(friendId);
            setViewedProfile(null);
            gameClientRef.current?.send({ type: 'get_profile', playerId: friendId });
          }}
          onAddFriend={friendId => {
            gameClientRef.current?.send({ type: 'social_action', friendId, action: 'add_friend' });
            emitReward({ text: '+1 Yêu cầu kết bạn', icon: <Icon3dFriends size={20} />, color: '#10b981' });
          }}
          onClose={() => setLeaderboardOpen(false)}
        />
      )}

      {profileTarget && <PlayerProfileModal
        profile={viewedProfile?.requestedId === profileTarget ? viewedProfile.profile : null}
        loading={viewedProfile?.requestedId !== profileTarget}
        own={profileTarget === session.playerId}
        friend={socialState.friends.some(item => item.playerId === profileTarget)}
        connected={network.connected}
        onClose={() => { setProfileTarget(null); setViewedProfile(null); }}
        onSave={data => gameClientRef.current?.sendGameAction('profile_update', data)}
        onFriend={() => gameClientRef.current?.sendSocialAction('add_friend', profileTarget)}
      />}

      {/* Plaza Community Billboard & Event Notice Modal */}
      {plazaNoticeOpen && (
        <PlazaEventNoticeModal
          connected={network.connected}
          rewardState={progress.communityRewards}
          serverOffset={fishingServerOffset.current}
          rewardNotice={status}
          onClaimDailyReward={reward => {
            if (!network.connected) return;
            gameClientRef.current?.sendGameAction('claim_daily_reward');
            setStatus('Đang xác nhận thưởng điểm danh…');
          }}
          onRedeemCode={(code, info) => {
            if (!network.connected) return;
            gameClientRef.current?.sendGameAction('redeem_giftcode',{code});
            setStatus('Đang kiểm tra mã quà tặng…');
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
      {gameStarted&&appleFocus&&!panel&&!venueMode&&<AppleTreeHUD target={appleFocus} readyAt={appleFocus.farmId===session.farmId?progress.appleReadyAt:worldRef.current?.publicFarms?.find(f=>f.farmId===appleFocus.farmId)?.appleReadyAt} isOwner={appleFocus.farmId===session.farmId} busy={appleBusy} connected={network.connected} onClose={()=>{setAppleFocus(null);setAppleBusy(false);if(worldRef.current)worldRef.current.appleInteractionToken=(worldRef.current.appleInteractionToken||0)+1;}} onHarvest={farmId=>{setAppleBusy(true);const result=worldRef.current?.harvestAppleTree(farmId,()=>gameClientRef.current?.sendGameAction('harvest_apples'));if(result===false)setAppleBusy(false);}}/>}
      {gameStarted && !panel && !venueMode && !livestockFocus && !appleFocus && <CropHarvestHUD worldRef={worldRef}/>}
        {gameStarted && livestockFocus && !panel && !venueMode && <LivestockActionHUD target={livestockFocus} animals={animals} progress={progress} busy={livestockPending} connected={network.connected} onClose={()=>{worldRef.current?.cancelLivestockInteraction();setLivestockFocus(null);}} onAction={(action,payload)=>worldRef.current?.performLivestockInteraction(livestockFocus,action,payload,()=>livestockAction(action,action.startsWith('steal_livestock')?{farmId:livestockFocus.farmId,animalId:payload.id}:payload,true))}/>}


      {panel==='fortune'&&<FortuneLotteryModal state={lotteryState} coins={progress.coins} connected={network.connected} pending={lotteryPending} onRefresh={refreshLottery} onClose={()=>setPanel(null)} onBuy={async number=>{if(!await confirmAction({title:'Mua vé may mắn?',message:number?`Số vé: ${number}`:'Thần Tài chọn ngẫu nhiên 6 số.',price:LOTTERY_CONFIG.price,asset:'coin',confirmLabel:'Mua vé'}))return;if(!gameClientRef.current?.joined)return;setLotteryPending(true);gameClientRef.current.sendGameAction('lottery_buy',number?{number}:{});}} onClaim={ticketId=>{if(!gameClientRef.current?.joined)return;setLotteryPending(true);gameClientRef.current.sendGameAction('lottery_claim',{ticketId});}}/>}
      {confirmation&&<GameConfirm {...confirmation} onCancel={()=>{confirmation.resolve(false);setConfirmation(null);}} onConfirm={()=>{confirmation.resolve(true);setConfirmation(null);}}/>}
      {gameStarted && toast && <GameToast message={toast.message} kind={toast.kind} onClose={dismissToast}/>}
      {gameStarted && !network.connected && <aside className="game-connection-status" role="status">Đang kết nối lại…</aside>}
    </main>
  );
}
