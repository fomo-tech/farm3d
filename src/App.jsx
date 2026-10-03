import { useEffect, useRef, useState } from 'react';
import { FISHING_GEAR, LAKE_FISH, FISHING_WATER_NAMES, fishingWaterAt } from '../shared/fishing.js';
import { FarmWorld } from './game/world/FarmWorld.js';
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
import { CasinoGames } from './components/CasinoGames.jsx';
import { ElderDialogueModal } from './components/ElderDialogueModal.jsx';
import { OnboardingHUD } from './components/OnboardingHUD.jsx';
import { HudContextAction } from './components/HudContextAction.jsx';
import { FarmGuideModal } from './components/FarmGuideModal.jsx';
import { GraduationModal } from './components/GraduationModal.jsx';
import { RoadsideShopModal } from './components/RoadsideShopModal.jsx';
import { FloatingPlotBubble } from './components/FloatingPlotBubble.jsx';
import { OrderBulletinBoard } from './components/OrderBulletinBoard.jsx';
import { FloatingRewards, emitReward } from './components/FloatingRewards.jsx';
import { farmAudio } from './game/audio/FarmAudioSystem.js';
import BusTransitHUD from './components/BusTransitHUD.jsx';
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
const vehicles = [
  { id: 'walk', name: 'Đi bộ', icon: <Icon3dWalk />, speed: 7, cost: 0 },
  { id: 'bike', name: 'Xe đạp', icon: <Icon3dBike size={28} />, speed: 10, cost: 350 },
  { id: 'scooter', name: 'Xe máy điện', icon: <Icon3dCub50 />, speed: 14, cost: 900 },
  { id: 'tractor', name: 'Máy kéo', icon: <Icon3dTractor />, speed: 18, cost: 2200 },
];
const timeIcons = [<Icon3dDawn key="dawn" size={24} />, <Icon3dSun key="sun" size={24} />, <Icon3dSunset key="sunset" size={24} />, <Icon3dMoon key="moon" size={24} />];
const seasonIcons = [<Icon3dSpring key="spring" size={20} />, <Icon3dSummer key="summer" size={20} />, <Icon3dAutumn key="autumn" size={20} />, <Icon3dWinter key="winter" size={20} />];
const cropIcons = {
  carrot: <Icon3dCarrot size={24} />,
  wheat: <Icon3dRiceSpike size={24} />,
  tomato: <Icon3dTomato size={24} />,
  strawberry: <Icon3dStrawberry size={24} />
};
const recipeIcons = { flour: <Icon3dFlourBowl size={24} />, cheese: <Icon3dCheese size={24} />, jam: <Icon3dJamJar size={24} /> };

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
  const [bootProgress, setBootProgress] = useState({ phase: 'init', percentage: 0, message: 'Đang khởi động thế giới 3D…', current: 0, total: 40 });
  const [debugEnabled, setDebugEnabled] = useState(() => new URLSearchParams(window.location.search).get('debug') === '1');
  const [debug, setDebug] = useState(null);
  const clockRef = useRef(Math.floor(Date.now() / 1000));
  const [clock, setClock] = useState(clockRef.current);
  const [fishingWater, setFishingWater] = useState(null);
  const [network, setNetwork] = useState({ connected: false, phase: 'connecting', online: 1, queued: 0, attempt: 0 });
  const [casinoResult, setCasinoResult] = useState('Chọn bàn và chờ ván online.');
  const [casinoState, setCasinoState] = useState(null);
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
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [graphicsQuality, setGraphicsQuality] = useState(readGraphicsQuality);
  const [cameraViewMode, setCameraViewMode] = useState('explore');
  const [targetDistance, setTargetDistance] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [currentFarmZone, setCurrentFarmZone] = useState(null);
  const [busTransit, setBusTransit] = useState(null);

  const hasPendingNotifications =
    ORDERS.some(order => canFillOrder(progress, order)) ||
    QUESTS.some(quest => !progress.claimedQuests.includes(quest.id) && (progress.stats[quest.stat] || 0) >= quest.goal);

  progressRef.current = progress;

  useEffect(() => {
    if (!canvasRef.current) return undefined;
    let world;
    try {
      window.__farmDebug?.mark('Creating Babylon world');
      setBoot({ phase: 'loading', error: '' });
      world = new FarmWorld(canvasRef.current, setStatus, {
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
          const outfit = outfits.find(item => item.id === progressRef.current?.outfit) || outfits[0];
          worldRef.current?.setPlayerOutfit(outfit.id, outfit.color);
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
        onToolChange: tool => setActiveTool(tool),
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
        onBusTransitChange: status => setBusTransit(status),
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
  }, []);

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
        setNetwork(previous => ({ ...previous, online: players.length + 1 }));
        worldRef.current?.syncRemotePlayers(players, serverTime);
      },
      onMoveAck: state => worldRef.current?.correctPlayerPosition(state),
      onCasinoState: state => setCasinoState(state.games),
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
        setCasinoResult(message);
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
        if (state.result?.fishCaught) setStatus(`Câu được ${LAKE_FISH[state.result.fishCaught]?.name || 'một con cá'}!`);
        if (state.result?.casinoBet) setCasinoResult('Đã nhận cược. Đang chờ kết quả chung của bàn.');
        if (state.result?.casinoSettlement) {
          const { reward, amount } = state.result.casinoSettlement;
          setCasinoResult(reward > 0 ? `Trúng thưởng ${reward} xu · lãi ${reward - amount} xu` : `Chưa trúng · mất ${amount} xu`);
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
      clockRef.current = now;
      setClock(now);
      worldRef.current?.setClock(now);
      const position = worldRef.current?.getPlayerState?.();
      const nextFishing = position && !position.venue ? fishingWaterAt(position.x, position.z) : null;
      setFishingWater(prev => (prev === nextFishing ? prev : nextFishing));
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

  useEffect(() => {
    if (!debugEnabled) return undefined;
    const refresh = () => setDebug(worldRef.current?.getDebugState() || null);
    refresh();
    const timer = window.setInterval(refresh, 1000);
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
    if (worldRef.current?.canUseFarmTools()) selectTool('seed');
    setPanel(null);
    setStatus(worldRef.current?.canUseFarmTools()
      ? `Đã chọn hạt ${crop.name} · giá ${crop.seedCost} xu`
      : `Đã chọn hạt ${crop.name}. Về nông trại để gieo.`);
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
    if (destination.id === 'farm' && !session.farmId) { setFocusedLand(null); setPanel('land'); setStatus('Bạn cần mua một lô đất trước.'); return; }
    const target = destination.id === 'farm'
      ? { ...destination, ...playerFarmTarget(session.farmId) }
      : destination;
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
  const playCasino = (game, choice, amount, roundId) => {
    if (venueMode?.venue !== 'casino') { setCasinoResult('Hãy vào hội quán trò chơi để đặt cược.'); return; }
    if (progress.coins < amount) { setCasinoResult('Không đủ xu để đặt cược.'); return; }
    gameClientRef.current?.sendGameAction('casino_bet', { game, choice, amount, roundId });
    setCasinoResult('Đang gửi cược tới server…');
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
    gameClientRef.current?.sendGameAction('character_create', { name: data.name, outfit: data.outfit || 'starter' });
    setSession(prev => {
      const updated = {
        ...prev,
        name: data.name,
        avatarIcon: data.avatarIcon,
      };
      saveWorldSession(updated);
      return updated;
    });
    worldRef.current?.setPlayerOutfit(data.outfit || 'starter', data.outfitColor || '#f8fafc');
    setVillageRequired(false);
    setStatus(`Chào mừng cư dân mới ${data.name} đến với Thung Lũng Kaia!`);
    setFocusedLand(null);
    setPanel('land');
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
  const contextAction = panel || venueMode || !gameStarted ? null : nearbyLot ? {
    label: `Xem lô đất ${currentFarmZone.lotNumber}`,
    hint: 'Kiểm tra giá và mua',
    onClick: () => { setFocusedLand(currentFarmZone.farmId); setPanel('land'); gameClientRef.current?.send({ type: 'resync' }); },
  } : fishingWater ? {
    label: `Câu cá · ${FISHING_WATER_NAMES[fishingWater]}`,
    hint: progress.fishing?.equippedRod ? 'Thả phao và chờ cá cắn' : 'Trang bị cần câu để bắt đầu',
    onClick: () => setPanel('fishing'),
  } : !session.farmId && progress.onboarding?.characterCreated ? {
    label: 'Chọn đất nông trại',
    hint: 'Xem các lô đất đang bán',
    onClick: () => { setFocusedLand(null); setPanel('land'); },
  } : null;

  return (
    <main className={`game-shell pt-game-shell${venueMode ? ' in-venue' : ''}`}>
      <canvas ref={canvasRef} className="game-canvas" aria-label="Thế giới nông trại 3D" />
      {/* Play Together Title & Start Screen */}
      {!gameStarted && (
        <GameStartScreen
          bootPhase={boot.phase}
          bootError={boot.error}
          bootProgress={bootProgress}
          onStart={() => {
            if (boot.phase !== 'ready' || bootProgress.percentage < 100) return;
            setGameStarted(true);
            worldRef.current?.playStartCinematic?.();
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
            const nextPreset = graphicsQuality === 'ultra' ? 'balanced' : graphicsQuality === 'balanced' ? 'eco' : 'ultra';
            setGraphicsQuality(nextPreset);
            worldRef.current?.setGraphicsQuality(nextPreset);
            setStatus(nextPreset === 'ultra' ? 'Đồ họa Siêu Nét (Ultra Retina HD)' : nextPreset === 'balanced' ? 'Đồ họa Cân Bằng (Balanced HD)' : 'Đồ họa Tiết Kiệm Pin (Eco)');
          }}
        />
      )}

      {debugEnabled && debug && <aside className="debug-panel"><b>WORLD DEBUG · F3</b><span>FPS {debug.fps}</span><span>POS {debug.x}, {debug.z}</span><span>CHUNK {debug.chunk}</span><span>MESHES {debug.meshes}</span><span>{debug.worldId}</span></aside>}
      {venueMode && <section className="venue-banner"><b>{venueMode.label}</b><span>Chọn thao tác hoặc đến gần quầy rồi nhấn E</span><div className="venue-banner-actions"><button type="button" onClick={() => setPanel(venueMode.venue === 'supplies' ? 'shop' : venueMode.venue)}>{venueMode.venue === 'casino' ? 'Chơi Tài Xỉu / Bầu Cua' : 'Nói chuyện với chủ tiệm'}</button><button type="button" onClick={() => { setPanel(null); worldRef.current?.exitVenue(); }}>Ra cửa hàng</button></div></section>}

      {gameStarted && (
        <>
          {/* PLAY TOGETHER STANDARD TOPBAR */}
          <header className="topbar pt-topbar">
        {/* Left: Player Profile Card with 3D Level Star & Jelly EXP */}
        <div className="pt-profile-card" onClick={() => setGuideOpen(true)} title="Bấm để mở Cẩm Nang Nông Trại">
          <div className="pt-avatar-ring">
            <Icon3dNonLa size={38} />
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
        <div className="pt-island-capsule">
          <div className="pt-island-badge">
            <Icon3dVillageGate size={18} />
            <b>{session.farmAddress?.villageName || worldRegion?.village?.name || 'Thung Lũng Bình Minh'}</b>
          </div>
          <div className="pt-clock-strip">
            <span className="pt-clock-icon">{timeIcons[Math.floor((clock % 240) / 60)]}</span>
            <span className="pt-clock-time">
              {String(Math.floor((clock % 240) / 10) + 6).padStart(2,'0')}:{String((clock % 10) * 6).padStart(2,'0')}
            </span>
            <span className="pt-capsule-dot">·</span>
            <span className="pt-season-icon">{seasonIcons[Math.floor(clock / 240) % 4]}</span>
            <span className="pt-season-name">{['Xuân','Hạ','Thu','Đông'][Math.floor(clock / 240) % 4]}</span>
          </div>
        </div>

        {/* Right: Candy Currency Dock & System Bubbles */}
        <div className="pt-currency-dock">
          {/* Gold Coin Candy Pill */}
          <div className="pt-candy-pill pt-gold-pill" onClick={() => setPanel('shop')} title="Đồng vàng nông trại (Bấm để mở Cửa Hàng)">
            <div className="pt-pill-icon"><Icon3dGoldCoin size={26} /></div>
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
            <div className="pt-pill-icon"><Icon3dGem size={24} /></div>
            <span className="pt-pill-val">{progress.gems}</span>
          </div>

          <button type="button" className="hud-header-button" onClick={() => handleMenuClick('inventory')} aria-label="Mở túi đồ" title="Túi đồ (B / I)"><Icon3dBackpack size={24} /></button>
          <button type="button" className="hud-header-button hud-menu-button" onClick={() => setPhoneOpen(true)} aria-label="Mở menu" title="Menu (P)"><Icon3dSmartPhone size={23} /><span>Menu</span>{hasPendingNotifications && <i className="hud-menu-ping" />}</button>
        </div>
      </header>

      {/* Dismount Bubble */}
      {progress.vehicle !== 'walk' && !venueMode && (
        <button type="button" className="dismount-vehicle-btn pt-dismount-bubble" onClick={dismountVehicle} aria-label="Xuống xe" title="Xuống xe và chuyển sang đi bộ">
          <span className="dismount-icon"><Icon3dDismount size={26} /></span>
          <b>Xuống xe</b>
        </button>
      )}

      {/* Action Controls & Virtual Joystick */}
      {!showCharacterCreation && (
        <>
          <div className="virtual-joystick pt-joystick" role="group" aria-label="Điều khiển di chuyển" onPointerDown={startJoystick} onPointerMove={event => event.currentTarget.hasPointerCapture(event.pointerId) && updateJoystick(event)} onPointerUp={stopJoystick} onPointerCancel={stopJoystick}>
            <span ref={joystickKnobRef} className="pt-joystick-knob">●</span>
          </div>
          <div className="world-action-controls pt-action-bubbles">
            <button type="button" className="pt-action-bubble pt-jump-bubble" onClick={() => worldRef.current?.jumpPlayer()} aria-label="Nhảy" title="Nhảy (Phím Cách)">
              <i><Icon3dJump size={34} /></i>
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
              <i><Icon3dSprint size={30} /></i>
              <b>Chạy</b>
            </button>
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

      <HudContextAction action={contextAction} />

      {currentFarmZone?.isOwner && !venueMode && animals.length > 0 && <section className="livestock-card">
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

      {/* Play Together Kaia Smartphone OS Device Modal */}
      {phoneOpen && (
        <div className="pt-phone-backdrop" onClick={() => setPhoneOpen(false)}>
          <div className="pt-phone-device" onClick={event => event.stopPropagation()}>
            <div className="pt-phone-notch" />

            <div className="pt-phone-status-bar">
              <span className="pt-phone-clock">
                {String(Math.floor((clock % 240) / 10) + 6).padStart(2,'0')}:{String((clock % 10) * 6).padStart(2,'0')} · {['Xuân','Hạ','Thu','Đông'][Math.floor(clock / 240) % 4]}
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
            </div>

            <div className="hud-phone-settings" aria-label="Thiết lập trò chơi">
              <button type="button" onClick={() => { const muted = farmAudio.toggleMute(); setIsMuted(muted); }}>
                {isMuted ? <Icon3dAudioOff size={20} /> : <Icon3dAudioOn size={20} />}
                <span>Âm thanh: {isMuted ? 'Tắt' : 'Bật'}</span>
              </button>
              <button type="button" onClick={() => {
                const nextPreset = graphicsQuality === 'ultra' ? 'balanced' : graphicsQuality === 'balanced' ? 'eco' : 'ultra';
                setGraphicsQuality(nextPreset);
                worldRef.current?.setGraphicsQuality(nextPreset);
              }}>
                <Icon3dSparkleStar size={20} />
                <span>Đồ họa: {{ ultra: 'Siêu nét', balanced: 'Cân bằng', eco: 'Tiết kiệm' }[graphicsQuality]}</span>
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
      {panel && panel !== 'orders' && <div className="panel-backdrop" onClick={() => setPanel(null)}><section className="game-panel" onClick={event => event.stopPropagation()}>
        <header><div><small>TRUNG TÂM NÔNG TRẠI</small><h2>{{ land: 'Mua đất · Quyền sở hữu', shop: 'Cửa hàng vật tư nông nghiệp', inventory: 'Kho nông sản', quests: 'Nhiệm vụ', factory: 'Xưởng chế biến', upgrade: 'Nâng cấp nông trại', map: 'Bản đồ Thung Lũng', city: 'Trung tâm thị trấn Ghibli', fashion: 'Cửa hàng thời trang Sophie', vehicles: 'Đại lý phương tiện & xưởng bay', casino: 'Casino & Giải Trí May Mắn', fishing: 'Cửa hàng đồ câu Lão Ngư' }[panel]}</h2></div><button type="button" onClick={() => setPanel(null)}>×</button></header>
        {panel === 'land' && <LandMarket lots={landLots} focusFarmId={focusedLand} playerId={session.playerId} ownsLand={Boolean(session.farmId)} coins={progress.coins} pending={landPending} onVisit={lot => { const gate = WORLD_VILLAGES.find(v => v.id === lot.villageId)?.gate; if (gate) travelTo({ id: lot.villageId, label: lot.villageName, ...gate }); }} onBuy={lot => { if (!network.connected) { setStatus('Chưa kết nối server.'); return; } setLandPending(true); gameClientRef.current?.sendGameAction('buy_land', { farmId: lot.farmId }); }} />}
        {panel === 'shop' && <div className="item-list">{Object.values(CROPS).map(crop => <button key={crop.id} disabled={progress.level < crop.level} onClick={() => chooseCrop(crop)}><i>{cropIcons[crop.id]}</i><span><b>{crop.name}</b><small>{Math.ceil(crop.growMs / 60000)} phút · mở cấp {crop.level}</small></span><em>{crop.seedCost} xu</em></button>)}</div>}
        {panel === 'inventory' && <div className="item-list"><div className="capacity">Kho cấp {progress.barnLevel} · {inventoryCount(progress)}/{barnCapacity(progress)} chỗ</div>{Object.values(CROPS).map(crop => <button key={crop.id} disabled={!progress.inventory[crop.id]} onClick={() => sellItem(crop.id)}><i>{cropIcons[crop.id]}</i><span><b>{crop.name} × {progress.inventory[crop.id]}</b><small>Chạm để bán từng sản phẩm</small></span><em>+{crop.sellPrice} xu</em></button>)}<div className="animal-stock"><Icon3dEgg size={20} /> Trứng × {progress.inventory.egg}　<Icon3dMilk size={20} /> Sữa × {progress.inventory.milk}</div>{RECIPES.map(recipe => <button key={recipe.id} disabled={!progress.inventory[recipe.id]} onClick={() => sellProduct(recipe.id, recipe.coins, recipe.name)}><i>{recipeIcons[recipe.id]}</i><span><b>{recipe.name} × {progress.inventory[recipe.id]}</b><small>Sản phẩm đã chế biến</small></span><em>+{recipe.coins} xu</em></button>)}</div>}
        {panel === 'quests' && <div className="item-list">{QUESTS.map(quest => { const current = Math.min(quest.goal, progress.stats[quest.stat]); const claimed = progress.claimedQuests.includes(quest.id); return <button key={quest.id} disabled={claimed || current < quest.goal} onClick={() => claimQuest(quest)}><i>{claimed ? <Icon3dCheck /> : <Icon3dStar />}</i><span><b>{quest.title}</b><small>{current}/{quest.goal} · thưởng {quest.xp} XP</small></span><em>{claimed ? 'Đã nhận' : `+${quest.coins} xu`}</em></button>; })}</div>}
        {panel === 'factory' && <div className="item-list">{RECIPES.map(recipe => <button key={recipe.id} onClick={() => craft(recipe)}><i>{recipeIcons[recipe.id]}</i><span><b>{recipe.name}</b><small>{Object.entries(recipe.inputs).map(([id,count]) => `${CROPS[id]?.name || id} ${count}`).join(' · ')} · +{recipe.xp} XP</small></span><em>Chế biến</em></button>)}</div>}
        {panel === 'upgrade' && <div className="item-list"><button onClick={upgradeLand}><i><Icon3dSprout /></i><span><b>Mở rộng đất · {progress.unlockedPlots}/48 ô</b><small>{EXPANSIONS.find(item => item.plots > progress.unlockedPlots) ? `Yêu cầu cấp ${EXPANSIONS.find(item => item.plots > progress.unlockedPlots).level}` : 'Đã đạt tối đa'}</small></span><em>{EXPANSIONS.find(item => item.plots > progress.unlockedPlots)?.cost || 'MAX'} xu</em></button><button onClick={upgradeBarn}><i><Icon3dBarn /></i><span><b>Nâng kho lên cấp {progress.barnLevel + 1}</b><small>Tăng thêm 20 chỗ chứa</small></span><em>{progress.barnLevel * 350} xu</em></button><button onClick={upgradeHome}><i><Icon3dHouseCabin /></i><span><b>{(progress.homeTier || 1) >= 2 ? 'Nhà Nông Trại Ấm Cúng' : 'Nâng cấp căn nhà gỗ'}</b><small>{(progress.homeTier || 1) >= 2 ? 'Đã sở hữu · cấp nhà 2' : 'Mở ở cấp 4 · thay căn nhà khởi đầu đơn giản'}</small></span><em>{(progress.homeTier || 1) >= 2 ? 'Đã mua' : '1800 xu'}</em></button></div>}
        {panel === 'map' && <><div className="destination-grid">{destinations.map(destination => <button key={destination.id} onClick={() => travelTo(destination)}><i>{destination.icon}</i><b>{destination.label}</b><small>{destination.description}</small><em>Đi xe buýt →</em></button>)}</div><div className="city-district-strip"><strong>PHÂN KHU TRUNG TÂM</strong>{cityDestinations.map(district => <button key={district.id} type="button" onClick={() => travelTo({ ...district, description: district.label })}><span>{cityDistrictIcons[district.id]}</span>{district.label}</button>)}</div></>}
        {panel === 'city' && <div className="destination-grid"><button onClick={() => setPanel('shop')}><i><Icon3dSprout size={28} /></i><b>Vật tư</b><small>Mua hạt giống theo cấp</small><em>Mở cửa hàng</em></button><button onClick={() => isFeatureLocked(progress, 'casino') ? setStatus('Casino mở sau khi hoàn thành hướng dẫn!') : setPanel('casino')}><i><Icon3dDice size={28} /></i><b>Casino giải trí</b><small>{isFeatureLocked(progress, 'casino') ? 'Khóa tân thủ' : 'Trò chơi xúc xắc may mắn'}</small><em>Vào chơi</em></button><button onClick={() => setPanel('fashion')}><i><Icon3dWardrobe size={28} /></i><b>Thời trang</b><small>Mua và thay trang phục Sophie</small><em>Xem đồ</em></button><button onClick={() => isFeatureLocked(progress, 'vehicles') ? setStatus('Đại lý xe mở sau khi hoàn thành hướng dẫn!') : setPanel('vehicles')}><i><Icon3dCub50 size={28} /></i><b>Đại lý xe</b><small>{isFeatureLocked(progress, 'vehicles') ? 'Khóa tân thủ' : 'Xe đạp cổ & chổi bay'}</small><em>Xem xe</em></button><button onClick={() => setPanel('fishing')}><i><Icon3dFishingRodPro size={28} /></i><b>Đồ câu cá</b><small>Cần câu trúc, cước & mồi câu</small><em>Mở tiệm</em></button></div>}
        {panel === 'fashion' && <div className="item-list">{outfits.map(outfit => { const owned = progress.ownedOutfits.includes(outfit.id); return <button key={outfit.id} onClick={() => buyOutfit(outfit)}><i>{outfit.icon}</i><span><b>{outfit.name}</b><small>{progress.outfit === outfit.id ? 'Đang mặc' : owned ? 'Đã sở hữu' : 'Trang phục mới'}</small></span><em>{owned ? 'Mặc' : `${outfit.cost} xu`}</em></button>; })}</div>}
        {panel === 'vehicles' && <div className="item-list">{vehicles.map(vehicle => { const owned = progress.ownedVehicles.includes(vehicle.id); return <button key={vehicle.id} onClick={() => buyVehicle(vehicle)}><i>{vehicle.icon}</i><span><b>{vehicle.name}</b><small>Tốc độ {vehicle.speed} · {progress.vehicle === vehicle.id ? 'đang dùng' : owned ? 'đã sở hữu' : 'chưa mua'}</small></span><em>{owned ? 'Chọn' : `${vehicle.cost} xu`}</em></button>; })}</div>}
        {panel === 'casino' && <CasinoGames state={casinoState} now={clock} coins={progress.coins} connected={network.connected} inside={venueMode?.venue === 'casino'} pending={progress.casinoPending} message={casinoResult} onBet={playCasino} />}
        {panel === 'fishing' && (
          <div className="item-list">
            <div className="capacity" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: '#fff', padding: '10px 14px', borderRadius: '14px', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold' }}>
              <Icon3dFishingRodPro size={24} /> Tiệm Đồ Câu Lão Ngư · Trang bị cần câu & mồi câu ven hồ
            </div>
            <div className="fishing-guide">{fishingWater ? `Bạn đang ở ${FISHING_WATER_NAMES[fishingWater]}. Trang bị cần, thả phao rồi giật khi cá cắn.` : 'Đứng sát bờ hồ, sông hoặc biển để câu cá.'}</div>
            {fishingWater && <div className="fishing-actions">
              <button type="button" disabled={!network.connected || !progress.fishing?.equippedRod || Boolean(progress.fishing?.pending && Date.now() < progress.fishing.pending.expiresAt)} onClick={() => gameClientRef.current?.sendGameAction('fishing_cast')}>Thả phao</button>
              <button type="button" disabled={!network.connected || !progress.fishing?.pending || Date.now() < progress.fishing.pending.biteAt || Date.now() > progress.fishing.pending.expiresAt} onClick={() => gameClientRef.current?.sendGameAction('fishing_reel')}>{progress.fishing?.pending && Date.now() >= progress.fishing.pending.biteAt && Date.now() <= progress.fishing.pending.expiresAt ? 'Cá cắn! Giật cần' : 'Đợi cá cắn…'}</button>
            </div>}
            {[
              { id: 'rod_bamboo', name: 'Cần câu trúc mộc', desc: 'Cần câu dẻo dai làm thủ công từ tre làng', cost: 150, icon: <Icon3dFishingRodBamboo size={30} /> },
              { id: 'rod_carbon', name: 'Cần máy Carbon Pro', desc: 'Cần câu máy quay săn cá lớn hồ sâu', cost: 650, icon: <Icon3dFishingRodPro size={30} /> },
              { id: 'bait_worm', name: 'Mồi trùn quế (x10)', desc: 'Mồi sống nhạy bén thu hút cá chép, cá rô', cost: 50, icon: <Icon3dBaitWorm size={28} /> },
              { id: 'bait_lure', name: 'Mồi ruồi lông vũ (x5)', desc: 'Mồi giả óng ánh săn cá hồi biển hồ', cost: 120, icon: <Icon3dBaitLure size={28} /> },
              { id: 'fish_chum', name: 'Thính thơm dụ cá (x3)', desc: 'Rải xuống nước tụ cá thành đàn lớn', cost: 80, icon: <Icon3dFishChum size={28} /> },
              { id: 'cooler_box', name: 'Thùng ướp lạnh ngư dân', desc: 'Bảo quản cá tươi ngon sau mỗi chuyến câu', cost: 400, icon: <Icon3dCoolerBox size={28} /> },
            ].map(item => (
              <button key={item.id} onClick={() => {
                if (progress.coins < item.cost) {
                  setStatus(`Bạn cần thêm ${item.cost - progress.coins} xu để mua ${item.name}!`);
                  return;
                }
                if (!FISHING_GEAR[item.id]) { setStatus('Món này sẽ mở trong bản cập nhật sau.'); return; }
                gameClientRef.current?.sendGameAction('fishing_buy', { id: item.id });
              }}>
                <i>{item.icon}</i>
                <span>
                  <b>{item.name}</b>
                  <small>{item.desc}</small>
                </span>
                <em>{item.cost} xu</em>
              </button>
            ))}
            <div className="fishing-guide">Cần đang dùng: {FISHING_GEAR[progress.fishing?.equippedRod]?.name || 'Chưa có'} · Mồi: {FISHING_GEAR[progress.fishing?.equippedBait]?.name || 'Không dùng'}</div>
            {Object.entries(FISHING_GEAR).map(([id, gear]) => <button key={`equip-${id}`} type="button" disabled={id.startsWith('rod_') ? !progress.fishing?.ownedRods?.includes(id) : !(progress.fishing?.bait?.[id] > 0)} onClick={() => gameClientRef.current?.sendGameAction('fishing_equip', { id })}><span><b>{gear.name}</b><small>{id.startsWith('rod_') ? 'Đã sở hữu' : `Còn ${progress.fishing?.bait?.[id] || 0} mồi`}</small></span><em>{id === progress.fishing?.equippedRod || id === progress.fishing?.equippedBait ? 'Đang dùng' : 'Trang bị'}</em></button>)}
            <div className="fishing-guide">Cá đã câu</div>
            {Object.entries(LAKE_FISH).map(([id, fish]) => <button key={`sell-${id}`} type="button" disabled={!(progress.fishing?.fish?.[id] > 0)} onClick={() => gameClientRef.current?.sendGameAction('fishing_sell', { id })}><span><b>{fish.name} × {progress.fishing?.fish?.[id] || 0}</b><small>Bán cho Lão Ngư</small></span><em>+{fish.price} xu</em></button>)}
          </div>
        )}
      </section></div>}

      {/* Onboarding Modals */}
      {gameStarted && showCharacterCreation && (
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
          progress={progress}
          onClose={() => setGuideOpen(false)}
          onResetTutorial={handleResetTutorial}
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

      {/* Bus Transit System HUD (Boarding Prompts & High-Speed Ride Status) */}
      <BusTransitHUD
        busTransit={busTransit}
        onBoard={busId => worldRef.current?.boardBus(busId)}
        onAlight={() => worldRef.current?.alightBus()}
        onToggleCinematicTour={() => worldRef.current?.toggleCinematicTour()}
        cinematicTourActive={busTransit?.cinematicTourActive}
      />

      {/* Floating Rewards Pop Effect (Juicy Harvest Pop VFX) */}
      <FloatingRewards />

      <div className="status"><i className={network.phase === 'connected' ? '' : 'offline'} /> {status}</div>
    </main>
  );
}
