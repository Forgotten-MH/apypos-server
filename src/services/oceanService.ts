const fs = require("fs");
const path = require("path");

function parseCSV(csvContent) {
  const lines = csvContent.trim().split("\n");
  const headers = lines.shift().split(",");
  const data = {};

  for (const line of lines) {
    const values = line.split(",");
    const row = Object.fromEntries(headers.map((h, i) => [h, values[i]]));

    const oceanHash = row.mOceanHash;
    const partHash = row.mPartHash;
    const oceanName = row.mOceanName;
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

function parsePartCSV(csvContent, oceanData) {
  const lines = csvContent.trim().split("\n");
  const headers = lines.shift().split(",");
  const partNodeMap = {};

  for (const line of lines) {
    const values = line.split(",");
    const row = Object.fromEntries(headers.map((h, i) => [h, values[i]]));

    const partHash = Number(row.mPartHash);
    const nodeHash = Number(row.mNodeHash);
    const nodeOrder = Number(row.NodeOrder);
    const mNodeType = Number(row.mNodeType);
    const mNodeName = row.mNodeName;

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

function parseDramaCSV(
  dramaCsv,
  storyData,
  noteData,
  nodeQuestData,
  questData,
  questSubtargetSet,
  partNodeMap,
  oceanData
) {
  const dramaLines = dramaCsv.trim().split("\n");
  const dramaHeaders = dramaLines.shift().split(",");

  const storyLines = storyData.trim().split("\n");
  const storyHeaders = storyLines.shift().split(",");

  for (const line of dramaLines) {
    const values = line.split(",");
    const row = Object.fromEntries(dramaHeaders.map((h, i) => [h, values[i]]));

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
              const values = line.split(",");
              const row = Object.fromEntries(
                storyHeaders.map((h, i) => [h, values[i]])
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
  const noteLines = noteData.trim().split("\n");
  const noteHeaders = noteData.trim().split(",");

  for (const line of noteLines) {
    const values = line.split(",");
    const row = Object.fromEntries(noteHeaders.map((h, i) => [h, values[i]]));
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

  const noteQuestLines = nodeQuestData.trim().split("\n");
  const noteQuestHeaders = noteQuestLines.shift().split(",");
  const questLines = questData.trim().split("\n");
  const questHeaders = questLines.shift().split(",");

  const questSubtargetSetLines = questSubtargetSet.trim().split("\n");
  const questSubtargetSetHeaders = questSubtargetSetLines.shift().split(",");
  

  // Preprocess nodeQuestData into a Map (mNodeHash -> [mQuestHash])
  const nodeQuestMap = new Map();
  for (const line of noteQuestLines) {
    const values = line.split(",");
    const row = Object.fromEntries(
      noteQuestHeaders.map((h, i) => [h, values[i]])
    );

    const nodeHash = Number(row.mNodeHash);
    const questHash = Number(row.mQuestHash);
    const isCollectionQuest = row.isCollectionQuest;
    const isKeyQuest = row.isKeyQuest;

    if (!nodeQuestMap.has(nodeHash)) {
      nodeQuestMap.set(nodeHash, []);
    }
    nodeQuestMap.get(nodeHash).push({questHash:questHash,isCollectionQuest:isCollectionQuest,isKeyQuest:isKeyQuest});
  }

  // Preprocess questData into a Map (mQuestID -> mDayNight)
  const questMap = new Map();
  for (const line of questLines) {
    const values = line.split(",");
    const row = Object.fromEntries(questHeaders.map((h, i) => [h, values[i]]));

    const questID = Number(row.mQuestID);
    const questTimeType = Number(row.mDayNight);
    const mQuestName = row.mQuestName;
    questMap.set(questID, { time: questTimeType, name: mQuestName });
  }

   // Preprocess questData into a Map (mQuestID -> mDayNight)
   const questSubtargetSetMap = new Map();
   for (const line of questSubtargetSetLines) {
     const values = line.split(",");
     const row = Object.fromEntries(questSubtargetSetHeaders.map((h, i) => [h, values[i]]));
 
     const questID = Number(row.mQuestID);
     const mSubTargetID = Number(row.mSubTargetID);

     questSubtargetSetMap.set(questID, mSubTargetID);
   }

  // Iterate over ocean and part structures
  for (const ocean of oceanData) {
    for (const part of ocean.part_list) {
      if (!part) continue;

      // Convert node list into a Map for fast lookups
      const nodeMap = new Map(part.node_list.map((n) => [n.mst_node_id, n]));

      for (const [nodeHash, questHashList] of nodeQuestMap) {
        const node = nodeMap.get(nodeHash) as any;
        if (node) {
          for (const {questHash,isCollectionQuest,isKeyQuest} of questHashList) {
            const { time: questTimeType, name } = questMap.get(questHash);
            const subtarget = questSubtargetSetMap.get(questHash);
            if (questTimeType !== undefined) {
              console.log(node.mst_node_id, questHash, questTimeType);

              switch (questTimeType) {
                case 1:
                  node.day_quest_list.push({
                    quest_name: name,
                    clear_time: 0,
                    is_collection_quest: isCollectionQuest=="true"?1:0,
                    is_key_quest: isKeyQuest=="true"?1:0,
                    mst_quest_id: questHash,
                    quest_subtargets: subtarget?[
                      {
                          mst_subtarget_id: subtarget?subtarget:0,
                          state: 1,
                      }
                    ]:[],
                    state: 1,
                  });
                  break;
                case 2:
                  node.night_quest_list.push({
                    quest_name: name,
                    clear_time: 0,
                    is_collection_quest: isCollectionQuest=="true"?1:0,
                    is_key_quest: isKeyQuest=="true"?1:0,
                    mst_quest_id: questHash,
                    quest_subtargets: subtarget?[
                      {
                          mst_subtarget_id: subtarget?subtarget:0,
                          state: 1,
                      }
                    ]:[],
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

fs.readFile("./src/csv/oceans/1-oceans.csv", "utf8", (err, oceanData) => {
  if (err) {
    console.error("Error reading ocean file:", err);
    return;
  }
  let parsedOceanData = parseCSV(oceanData);

  fs.readFile("./src/csv/oceans/parts/1-parts.csv", "utf8", (err, partData) => {
    if (err) {
      console.error("Error reading part file:", err);
      return;
    }

    fs.readFile(
      "./src/csv/oceans/parts/2-dramas.csv",
      "utf8",
      (err, dramaData) => {
        if (err) {
          console.error("Error reading drama file:", err);
          return;
        }

        fs.readFile(
          "./src/csv/oceans/parts/3-story.csv",
          "utf8",
          (err, storyData) => {
            if (err) {
              console.error("Error reading story file:", err);
              return;
            }
            fs.readFile(
              "./src/csv/oceans/parts/4-notes.csv",
              "utf8",
              (err, noteData) => {
                if (err) {
                  console.error("Error reading notes file:", err);
                  return;
                }
                fs.readFile(
                  "./src/csv/oceans/parts/nodes/2-node-quests.csv",
                  "utf8",
                  (err, noteQuestData) => {
                    if (err) {
                      console.error("Error reading story file:", err);
                      return;
                    }

                    fs.readFile(
                      "./src/csv/questData.csv",
                      "utf8",
                      (err, questData) => {
                        if (err) {
                          console.error("Error reading questData file:", err);
                          return;
                        }

                        fs.readFile(
                          "./src/csv/questSubtargetSet.csv",
                          "utf8",
                          (err, questSubtargetSet) => {
                            if (err) {
                              console.error(
                                "Error reading questSubtargetSet file:",
                                err
                              );
                              return;
                            }

                            const partNodeMap = parsePartCSV(
                              partData,
                              parsedOceanData
                            );

                            parseDramaCSV(
                              dramaData,
                              storyData,
                              noteData,
                              noteQuestData,
                              questData,
                              questSubtargetSet,
                              partNodeMap,
                              parsedOceanData
                            );
                            //lazyfix reverse
                            console.log(
                              JSON.stringify(parsedOceanData, null, 2)
                            );

                            parsedOceanData = parsedOceanData.reverse();

                            fs.writeFile(
                              "myjsonfile.json",
                              JSON.stringify(parsedOceanData),
                              "utf8",
                              (err) => {
                                if (err) throw err;
                                console.log("complete");
                              }
                            );
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
  });
});
