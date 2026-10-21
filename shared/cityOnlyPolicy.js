// A positive allow-list prevents legacy farming RPCs being revived by old clients.
export const CITY_ACTIONS=new Set(['city_enter','city_vehicle','city_contract_start','city_contract_checkpoint','city_contract_timeout','city_contract_finish','city_contract_cancel','character_create','profile_update','fashion_save_customization','buy_outfit','casino']);
export const CITY_PANELS=new Set(['map','fashion','friends','settings','city']);
export const REMOVED_WORLD_MESSAGES=new Set(['farm_action','land_market','mailbox_heart','lottery_sync','missions_sync']);
for(const action of ['city_garage_buy','city_garage_select','city_garage_paint','city_garage_recover','city_garage_repair','city_respawn'])CITY_ACTIONS.add(action);
export const cityActionAllowed=action=>CITY_ACTIONS.has(action);
