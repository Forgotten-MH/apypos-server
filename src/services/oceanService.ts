import { readFile, writeFile } from 'fs/promises';
import { createLogger } from '../middleware/logger.js';
import type { Campaign, OceanObject, RaidInfo } from '../types/game.js';
const log = createLogger('oceanService');

interface QuestListItem {
  quest_name: string;
  clear_time: number;
  is_collection_quest: number;
  is_key_quest: number;
  mst_quest_id: number;
  quest_subtargets: { mst_subtarget_id: number; state: number }[];
  state: number;
}

interface OceanNode {
  name: string;
  node_type: number;
  day_quest_list: QuestListItem[];
  is_collection_node: number;
  mst_node_id: number;
  mst_story_id: number;
  night_quest_list: QuestListItem[];
  state: number;
}

interface OceanPart {
  mst_part_id: number;
  campaign: Campaign[];
  exploration_note: {
    note_contents: { mst_note_content_id: number; state: number }[];
    progress: number;
  };
  gingira_node_id: number;
  node_list: OceanNode[];
  object_list: OceanObject[];
  raid_info: RaidInfo[];
  silver_bonus: number;
  state: number;
}

export interface OceanData {
  ocean_name: string;
  mst_ocean_id: number;
  part_list: OceanPart[];
}

export function parseCSV(csvContent: string) {
  const lines = csvContent.trim().split('\n');
  const headers = lines.shift()!.split(',');
  const data: Record<string, OceanData> = {};

  for (const line of lines) {
    const values = line.split(',');
    const row = Object.fromEntries(
      headers.map((h: string, i: number) => [h, values[i] ?? '']),
    );

    const oceanHash = row['mOceanHash'] ?? '';
    const partHash = row['mPartHash'] ?? '';
    const oceanName = row['mOceanName'] ?? '';
    if (!data[oceanHash]) {
      data[oceanHash] = {
        ocean_name: oceanName,
        mst_ocean_id: Number(oceanHash),
        part_list: [],
      };
    }

    data[oceanHash].part_list.push({
      mst_part_id: Number(partHash),
      campaign: [
        // {
        //   mst_campaign_id: 2374006206,
        //   remain_time: 3600,
        // }
      ],
      exploration_note: {
        note_contents: [],
        progress: 9999,
      },
      gingira_node_id: 0,
      node_list: [],
      object_list: [
        // { mst_object_id: 2245466522, state: 1 }
      ],
      raid_info: [
        // { end_remain: 3600, mst_node_id: 1857525354, start_remain: 0 }
      ],
      silver_bonus: 0,
      state: 1,
    });
  }

  return Object.values(data);
}

export function parsePartCSV(csvContent: string, oceanData: OceanData[]) {
  const lines = csvContent.trim().split('\n');
  const headers = lines.shift()!.split(',');
  const partNodeMap: Record<number, Record<number, number>> = {};

  for (const line of lines) {
    const values = line.split(',');
    const row = Object.fromEntries(
      headers.map((h: string, i: number) => [h, values[i] ?? '']),
    );

    const partHash = Number(row['mPartHash']);
    const nodeHash = Number(row['mNodeHash']);
    const nodeOrder = Number(row['NodeOrder']);
    const mNodeType = Number(row['mNodeType']);
    const mNodeName = row['mNodeName'] ?? '';

    if (!partNodeMap[partHash]) {
      partNodeMap[partHash] = {};
    }
    partNodeMap[partHash][nodeOrder] = nodeHash;

    for (const ocean of oceanData) {
      const part = ocean.part_list.find((p) => p.mst_part_id === partHash);
      if (part) {
        part.node_list.push({
          name: mNodeName,
          node_type: mNodeType,
          day_quest_list: [],
          is_collection_node: 0,
          mst_node_id: nodeHash,
          mst_story_id: 0,
          night_quest_list: [],
          state: 1,
        });
      }
    }
  }
  return partNodeMap;
}

export function parseDramaCSV(
  dramaCsv: string,
  storyData: string,
  noteData: string,
  nodeQuestData: string,
  questData: string,
  questSubtargetSet: string,
  partNodeMap: Record<number, Record<number, number>>,
  oceanData: OceanData[],
) {
  const dramaLines = dramaCsv.trim().split('\n');
  const dramaHeaders = dramaLines.shift()!.split(',');

  const storyLines = storyData.trim().split('\n');
  const storyHeaders = storyLines.shift()!.split(',');

  for (const line of dramaLines) {
    const values = line.split(',');
    const row = Object.fromEntries(
      dramaHeaders.map((h: string, i: number) => [h, values[i] ?? '']),
    );

    const partHash = Number(row.mPartHash);
    const dramaHash = Number(row.mDramaHash);
    const dramaOrder = Number(row.DramaOrder);
    const nodeHash = partNodeMap[partHash]?.[dramaOrder];
    if (nodeHash !== undefined) {
      for (const ocean of oceanData) {
        const part = ocean.part_list.find((p) => p.mst_part_id === partHash);
        if (part) {
          const node = part.node_list.find((n) => n.mst_node_id === nodeHash);
          if (node) {
            for (const line of storyLines) {
              const values = line.split(',');
              const row = Object.fromEntries(
                storyHeaders.map((h: string, i: number) => [h, values[i] ?? '']),
              );
              const storyDramaHash = Number(row.mDramaHash);
              const storyHash = Number(row.mStoryHash);
              if (dramaHash == storyDramaHash) {
                node.mst_story_id = storyHash;
              }
            }
          }
        }
      }
    }
  }
  const noteLines = noteData.trim().split('\n');
  const noteHeaders = noteData.trim().split(',');

  for (const line of noteLines) {
    const values = line.split(',');
    const row = Object.fromEntries(
      noteHeaders.map((h: string, i: number) => [h, values[i] ?? '']),
    );
    const note_id = Number(row.mNoteID);
    const note_part_id = Number(row.mPartID);
    for (const ocean of oceanData) {
      const part = ocean.part_list.find((p) => p.mst_part_id == note_part_id);
      if (part) {
        part.exploration_note.note_contents.push({
          mst_note_content_id: note_id,
          state: 3,
        });
      }
    }
  }

  const noteQuestLines = nodeQuestData.trim().split('\n');
  const noteQuestHeaders = noteQuestLines.shift()!.split(',');
  const questLines = questData.trim().split('\n');
  const questHeaders = questLines.shift()!.split(',');

  const questSubtargetSetLines = questSubtargetSet.trim().split('\n');
  const questSubtargetSetHeaders = questSubtargetSetLines.shift()!.split(',');

  // Preprocess nodeQuestData into a Map (mNodeHash -> [mQuestHash])
  const nodeQuestMap = new Map<number, { questHash: number; isCollectionQuest: string; isKeyQuest: string }[]>();
  for (const line of noteQuestLines) {
    const values = line.split(',');
    const row = Object.fromEntries(
      noteQuestHeaders.map((h: string, i: number) => [h, values[i] ?? '']),
    );

    const nodeHash = Number(row.mNodeHash);
    const questHash = Number(row.mQuestHash);
    const isCollectionQuest = row.isCollectionQuest ?? '';
    const isKeyQuest = row.isKeyQuest ?? '';

    if (!nodeQuestMap.has(nodeHash)) {
      nodeQuestMap.set(nodeHash, []);
    }
    nodeQuestMap.get(nodeHash)!.push({
      questHash: questHash,
      isCollectionQuest: isCollectionQuest,
      isKeyQuest: isKeyQuest,
    });
  }

  // Preprocess questData into a Map (mQuestID -> mDayNight)
  const questMap = new Map<number, { time: number; name: string }>();
  for (const line of questLines) {
    const values = line.split(',');
    const row = Object.fromEntries(
      questHeaders.map((h: string, i: number) => [h, values[i] ?? '']),
    );

    const questID = Number(row.mQuestID);
    const questTimeType = Number(row.mDayNight);
    const mQuestName = row.mQuestName ?? '';
    questMap.set(questID, { time: questTimeType, name: mQuestName });
  }

  // Preprocess questData into a Map (mQuestID -> mDayNight)
  const questSubtargetSetMap = new Map<number, number>();
  for (const line of questSubtargetSetLines) {
    const values = line.split(',');
    const row = Object.fromEntries(
      questSubtargetSetHeaders.map((h: string, i: number) => [h, values[i] ?? '']),
    );

    const questID = Number(row.mQuestID);
    const mSubTargetID = Number(row.mSubTargetID);

    questSubtargetSetMap.set(questID, mSubTargetID);
  }

  // Iterate over ocean and part structures
  for (const ocean of oceanData) {
    for (const part of ocean.part_list) {
      if (!part) continue;

      // Convert node list into a Map for fast lookups
      const nodeMap = new Map<number, OceanNode>(
        part.node_list.map((n: OceanNode) => [n.mst_node_id, n]),
      );

      for (const [nodeHash, questHashList] of nodeQuestMap) {
        const node = nodeMap.get(nodeHash);
        if (node) {
          for (const { questHash, isCollectionQuest, isKeyQuest } of questHashList) {
            const questInfo = questMap.get(questHash);
            if (!questInfo) continue;
            const { time: questTimeType, name } = questInfo;
            const subtarget = questSubtargetSetMap.get(questHash);
            if (questTimeType !== undefined) {
              log.debug(String(node.mst_node_id), questHash, questTimeType);

              switch (questTimeType) {
                case 1:
                  node.day_quest_list.push({
                    quest_name: name,
                    clear_time: 0,
                    is_collection_quest: isCollectionQuest == 'true' ? 1 : 0,
                    is_key_quest: isKeyQuest == 'true' ? 1 : 0,
                    mst_quest_id: questHash,
                    quest_subtargets: subtarget
                      ? [
                          {
                            mst_subtarget_id: subtarget ? subtarget : 0,
                            state: 1,
                          },
                        ]
                      : [],
                    state: 1,
                  });
                  break;
                case 2:
                  node.night_quest_list.push({
                    quest_name: name,
                    clear_time: 0,
                    is_collection_quest: isCollectionQuest == 'true' ? 1 : 0,
                    is_key_quest: isKeyQuest == 'true' ? 1 : 0,
                    mst_quest_id: questHash,
                    quest_subtargets: subtarget
                      ? [
                          {
                            mst_subtarget_id: subtarget ? subtarget : 0,
                            state: 1,
                          },
                        ]
                      : [],
                    state: 1,
                  });
                  break;
              }
            }
          }
        }
      }
    }
  }
}

export async function generateOceanData(csvDir: string, outputPath: string) {
  const oceanCsv = await readFile(`${csvDir}/1-oceans.csv`, 'utf8');
  const partCsv = await readFile(`${csvDir}/parts/1-parts.csv`, 'utf8');
  const dramaCsv = await readFile(`${csvDir}/parts/2-dramas.csv`, 'utf8');
  const storyCsv = await readFile(`${csvDir}/parts/3-story.csv`, 'utf8');
  const noteCsv = await readFile(`${csvDir}/parts/4-notes.csv`, 'utf8');
  const nodeQuestCsv = await readFile(`${csvDir}/parts/nodes/2-node-quests.csv`, 'utf8');
  const questCsv = await readFile(`${csvDir}/../questData.csv`, 'utf8');
  const questSubtargetCsv = await readFile(`${csvDir}/../questSubtargetSet.csv`, 'utf8');

  let parsedOceanData = parseCSV(oceanCsv);
  const partNodeMap = parsePartCSV(partCsv, parsedOceanData);

  parseDramaCSV(
    dramaCsv,
    storyCsv,
    noteCsv,
    nodeQuestCsv,
    questCsv,
    questSubtargetCsv,
    partNodeMap,
    parsedOceanData,
  );

  log.debug(JSON.stringify(parsedOceanData, null, 2));

  //lazyfix reverse
  parsedOceanData = parsedOceanData.reverse();

  await writeFile(outputPath, JSON.stringify(parsedOceanData), 'utf8');
  log.info('complete');
}

// CLI entry point: yarn generate-island
const isDirectRun =
  process.argv[1] &&
  (process.argv[1].endsWith('/oceanService.ts') || process.argv[1].endsWith('/oceanService.js'));

if (isDirectRun) {
  void generateOceanData('./src/csv/oceans', 'myjsonfile.json');
}
