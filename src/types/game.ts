// Shared game type definitions derived from Mongoose schemas

// --- Simple items (amount + mst_X_id) ---

export interface GrowthItem {
  amount: number;
  mst_growth_item_id: number;
}
export interface Limited {
  amount: number;
  mst_limited_id: number;
}
export interface Matatabi {
  amount: number;
  mst_matatabi_id: number;
}
export interface Material {
  amount: number;
  mst_material_id: number;
}
export interface Payment {
  amount: number;
  mst_payment_id: number;
}
export interface Point {
  amount: number;
  mst_event_point_id: number;
}
export interface Power {
  amount: number;
  mst_power_id: number;
}
export interface Augite {
  amount: number;
  mst_augite_id: number;
  mst_monument_type_id: number;
}

// --- Complex items ---

export interface Equipment {
  equipment_id: string;
  created: number;
  mst_equipment_id: number;
  favorite: number;
  elv: number;
  slv: number;
  potential: number;
  is_complete_auto_potential_composite: number;
  auto_potential_composite: number;
  awaked: number;
  is_awake: number;
  endAwakeCount: number;
  endAwakeRemain: number;
  end_remain: number;
  start_remain: number;
  evolve_start_time: number;
}

export interface Otomo {
  created: number;
  exp: number;
  mst_otomo_id: number;
  otomo_id: string;
  subskill: number[];
  attack: number;
  defense: number;
  hp: number;
  level: number;
}

export interface Partner {
  created: number;
  exp: number;
  exp_max: number;
  level: number;
  level_cap_tier: number;
  level_max: number;
  mst_partner_id: number;
  partner_id: string;
}

// --- Ocean hierarchy (from model/ocean.ts) ---

export interface Campaign {
  mst_campaign_id: number;
  remain_time: number;
}
export interface RaidInfo {
  end_remain: number;
  mst_node_id: number;
  start_remain: number;
}
export interface OceanObject {
  mst_object_id: number;
  state: number;
}
export interface NoteContent {
  mst_note_content_id: number;
  state: number;
}
export interface ExplorationNote {
  note_contents: NoteContent[];
  progress: number;
}

export interface OceanNode {
  is_collection_node: number;
  mst_node_id: number;
  mst_story_id: number;
  state: number;
}

export interface OceanPart {
  mst_part_id: number;
  campaign: Campaign[];
  exploration_note: ExplorationNote;
  gingira_node_id: number;
  node_list: OceanNode[];
  object_list: OceanObject[];
  raid_info: RaidInfo[];
  silver_bonus: number;
  state: number;
}

export interface Ocean {
  mst_ocean_id: number;
  part_list: OceanPart[];
}

// --- Monument ---

export interface Monument {
  augite: Augite[];
  hr: number;
  mlv: { atk: number; def: number; hp: number; sp: number };
}

// --- Box ---

export interface Box {
  capacity?: Record<string, number>;
  equipments?: Equipment[];
  growth_items?: GrowthItem[];
  limiteds?: Limited[];
  matatabis?: Matatabi[];
  materials?: Material[];
  monument?: Monument;
  otomos?: Otomo[];
  partners?: Partner[];
  payments?: Payment[];
  points?: Point[];
  powers?: Power[];
  zeny?: number;
}

// --- Quest subtarget ---

export interface QuestSubtarget {
  mst_subtarget_id: number;
  state: number;
}

// --- Cleared quest ---

export interface ClearedQuest {
  mst_quest_id: number;
  clear_time?: number;
}

// --- Equipment sub-types (for User model) ---

export interface EquipPiece {
  created?: number;
  equipment_id: string;
  level?: number;
  mst_equipment_id?: number;
  potential?: number;
  skill_level?: number;
}

export interface EquipSetPiece {
  equipment_id: string;
}

export interface PartnerEquipSet {
  mst_partner_id?: number;
  arm?: EquipPiece;
  body?: EquipPiece;
  leg?: EquipPiece;
  head?: EquipPiece;
  secret_weapon?: EquipPiece;
  talisman?: EquipPiece;
  waist?: EquipPiece;
  weapon?: EquipPiece;
}

export interface EquipSet {
  index: number;
  partner_equip_sets: PartnerEquipSet[];
  arm?: EquipSetPiece;
  body?: EquipSetPiece;
  leg?: EquipSetPiece;
  head?: EquipSetPiece;
  secret_weapon?: EquipSetPiece;
  talisman?: EquipSetPiece;
  waist?: EquipSetPiece;
  weapon?: EquipSetPiece;
}

// --- Social equip ---

export interface SocialEquipPart {
  equipment_id: string;
  mst_equipment_id: number;
}

export interface SocialEquipset {
  gunner: {
    social_arm: SocialEquipPart;
    social_body: SocialEquipPart;
    social_head: SocialEquipPart;
    social_leg: SocialEquipPart;
    social_waist: SocialEquipPart;
  };
  knight: {
    social_arm: SocialEquipPart;
    social_body: SocialEquipPart;
    social_head: SocialEquipPart;
    social_leg: SocialEquipPart;
    social_waist: SocialEquipPart;
  };
  is_used: number;
  mst_partner_id: number;
}

// --- Otomo team ---

export interface OtomoTeam {
  index: number;
  otomo_ids: string[];
}

// --- Model info (character appearance) ---

export interface ModelInfo {
  face: number;
  gender: number;
  hair: number;
  hair_color: number;
  inner: number;
  skin: number;
}

// --- Guild ---

export interface GuildRequestEntry {
  _id: string;
  created: number;
  gid: string;
  uid: string;
}

export interface GuildInfo {
  gid: string;
  is_guild: number;
  is_same: number;
  member_type: number;
  name: string;
  rank: number;
  login_freq: number;
  chat_freq: number;
  yarikomi: number;
  mood: number;
  timezone: number;
  waited: number;
  receive: GuildRequestEntry[];
  send: GuildRequestEntry[];
}

// --- Nyanken cooldown ---

export interface NyankenCooldown {
  mst_nyanken_id: number;
  last_draw_time: number;
}

// --- Selected partner ---

export interface SelectedPartner {
  main_partner_id: string;
  quest_partner_id: string;
}
