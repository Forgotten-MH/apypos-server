export const QUEST_STATE = {
  UNKNOWN: 0, // Possible non value
  NEW: 1,
  UNKNOWN3: 2,
  CLEAR: 3, // S A B C based on clear_time
} as const;

export const NODE_STATE = {
  UNKNOWN_0: 0, // Possible non value
  UNKNOWN_1: 1,
  NEW: 2, // Only just unlocked
  MEDAL_SILVER_CROWN: 3, // All quests completed on Node (Day and Night)
  MEDAL_GOLD_CROWN: 4, // All S Rank (Clear within 1:30)
  BUBBLE: 5,
  HELP: 6, // Hunter needs to interact with this node to trigger the request
  BUBBLE_EXCLAMATION: 7, // Current request's target monster in this location
  BUBBLE_MUSIC: 8, // Report back to node to finish request
  NEXT_ISLAND: 9,
} as const;

export const ARTIFACT_STATE = {
  UNKNOWN_0: 0, // Possible non value
  UNKNOWN_1: 1,
  NEWLY_DISCOVERED: 2, // Triggers big opening animation
  DISCOVERED: 3,
} as const;

export const PART_STATE = {
  CLOSED: 0,
  OPEN: 1,
  UNKNOWN_2: 2,
  GINGIRA_SPARKLE: 3, // When gingira_node_id is set
} as const;
