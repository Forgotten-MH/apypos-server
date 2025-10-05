import path from "path";

const event_nodes = require(
  path.resolve(__dirname, "../../json/event_nodes.json")
);
export const getDurationFromValue = (value) => {
  if (!value) return null; // Handle cases where the date is not set
  const now = Date.now(); // Current timestamp in milliseconds
  return Math.max(0, Math.floor((value.getTime() - now) / 1000)); // Convert duration to seconds
};

export function enrichEvent(eventList: any[]): any[] {
  return eventList.map((event: any) => {
    
    const nodeId = event.mst_event_node_id ?? event.mst_score_node_id;

    const node = event_nodes.find(
      (node) => parseInt(node.mEventNodeHash) === nodeId
    );

    if (!node) {
      console.warn(
        `No matching node found for event ID: ${event.mst_event_node_id}`
      );
      return event;
    }

    event.quest_list ??= [];

    for (const questId of node.mEventQuestList) {
      event.quest_list.push({
        clear_time: 0,
        limited_amount: 0,
        mst_limited_id: 0,
        mst_quest_id: parseInt(questId),
        quest_subtargets: [],
        state: 1,
      });
    }

    return event;
  });
}