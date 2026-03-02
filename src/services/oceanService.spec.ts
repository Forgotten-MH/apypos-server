import { describe, it, expect } from 'vitest';
import { parseCSV, parsePartCSV, parseDramaCSV } from './oceanService.js';

describe('oceanService', () => {
  describe('parseCSV', () => {
    it('should parse ocean CSV into OceanData array', () => {
      const csv = [
        'mOceanHash,mPartHash,mOceanName',
        '100,201,Ocean A',
        '100,202,Ocean A',
        '300,301,Ocean B',
      ].join('\n');

      const result = parseCSV(csv);

      expect(result).toHaveLength(2);

      const oceanA = result.find((o) => o.mst_ocean_id === 100);
      expect(oceanA).toBeDefined();
      expect(oceanA!.ocean_name).toBe('Ocean A');
      expect(oceanA!.part_list).toHaveLength(2);
      expect(oceanA!.part_list[0]!.mst_part_id).toBe(201);
      expect(oceanA!.part_list[1]!.mst_part_id).toBe(202);

      const oceanB = result.find((o) => o.mst_ocean_id === 300);
      expect(oceanB).toBeDefined();
      expect(oceanB!.ocean_name).toBe('Ocean B');
      expect(oceanB!.part_list).toHaveLength(1);
      expect(oceanB!.part_list[0]!.mst_part_id).toBe(301);
    });

    it('should initialize parts with empty node_list and default state', () => {
      const csv = ['mOceanHash,mPartHash,mOceanName', '1,10,Test'].join('\n');
      const result = parseCSV(csv);

      const part = result[0]!.part_list[0]!;
      expect(part.node_list).toEqual([]);
      expect(part.state).toBe(1);
      expect(part.exploration_note.progress).toBe(9999);
      expect(part.gingira_node_id).toBe(0);
    });
  });

  describe('parsePartCSV', () => {
    it('should add nodes to parts and build partNodeMap', () => {
      const oceanData = parseCSV(
        ['mOceanHash,mPartHash,mOceanName', '100,201,Ocean A'].join('\n'),
      );

      const partCsv = [
        'mPartHash,mNodeHash,NodeOrder,mNodeType,mNodeName',
        '201,501,0,1,Node Alpha',
        '201,502,1,2,Node Beta',
      ].join('\n');

      const partNodeMap = parsePartCSV(partCsv, oceanData);

      // Check partNodeMap
      expect(partNodeMap[201]).toBeDefined();
      expect(partNodeMap[201]![0]).toBe(501);
      expect(partNodeMap[201]![1]).toBe(502);

      // Check nodes were added to ocean data
      const part = oceanData[0]!.part_list[0]!;
      expect(part.node_list).toHaveLength(2);
      expect(part.node_list[0]!.mst_node_id).toBe(501);
      expect(part.node_list[0]!.name).toBe('Node Alpha');
      expect(part.node_list[0]!.node_type).toBe(1);
      expect(part.node_list[1]!.mst_node_id).toBe(502);
    });

    it('should skip nodes for non-existent parts', () => {
      const oceanData = parseCSV(
        ['mOceanHash,mPartHash,mOceanName', '100,201,Ocean A'].join('\n'),
      );

      const partCsv = [
        'mPartHash,mNodeHash,NodeOrder,mNodeType,mNodeName',
        '999,501,0,1,Orphan Node',
      ].join('\n');

      const partNodeMap = parsePartCSV(partCsv, oceanData);

      expect(partNodeMap[999]).toBeDefined();
      expect(oceanData[0]!.part_list[0]!.node_list).toHaveLength(0);
    });
  });

  describe('parseDramaCSV', () => {
    it('should assign story IDs and quest lists to nodes', () => {
      const oceanData = parseCSV(
        ['mOceanHash,mPartHash,mOceanName', '100,201,Ocean A'].join('\n'),
      );

      const partCsv = [
        'mPartHash,mNodeHash,NodeOrder,mNodeType,mNodeName',
        '201,501,0,1,Node Alpha',
      ].join('\n');
      const partNodeMap = parsePartCSV(partCsv, oceanData);

      const dramaCsv = [
        'mPartHash,mDramaHash,DramaOrder',
        '201,601,0',
      ].join('\n');

      const storyCsv = [
        'mDramaHash,mStoryHash',
        '601,701',
      ].join('\n');

      const noteCsv = [
        'mNoteID,mPartID',
        '801,201',
      ].join('\n');

      const nodeQuestCsv = [
        'mNodeHash,mQuestHash,isCollectionQuest,isKeyQuest',
        '501,901,false,true',
      ].join('\n');

      const questCsv = [
        'mQuestID,mDayNight,mQuestName',
        '901,1,Day Quest',
      ].join('\n');

      const questSubtargetCsv = [
        'mQuestID,mSubTargetID',
        '901,1001',
      ].join('\n');

      parseDramaCSV(
        dramaCsv, storyCsv, noteCsv, nodeQuestCsv, questCsv, questSubtargetCsv,
        partNodeMap, oceanData,
      );

      const node = oceanData[0]!.part_list[0]!.node_list[0]!;
      expect(node.mst_story_id).toBe(701);
      expect(node.day_quest_list).toHaveLength(1);
      expect(node.day_quest_list[0]!.mst_quest_id).toBe(901);
      expect(node.day_quest_list[0]!.quest_name).toBe('Day Quest');
      expect(node.day_quest_list[0]!.is_key_quest).toBe(1);
      expect(node.day_quest_list[0]!.is_collection_quest).toBe(0);
      expect(node.day_quest_list[0]!.quest_subtargets).toHaveLength(1);
      expect(node.day_quest_list[0]!.quest_subtargets[0]!.mst_subtarget_id).toBe(1001);

    });

    it('should add night quests for mDayNight=2', () => {
      const oceanData = parseCSV(
        ['mOceanHash,mPartHash,mOceanName', '100,201,Ocean A'].join('\n'),
      );
      const partCsv = [
        'mPartHash,mNodeHash,NodeOrder,mNodeType,mNodeName',
        '201,501,0,1,Node Alpha',
      ].join('\n');
      parsePartCSV(partCsv, oceanData);

      const nodeQuestCsv = [
        'mNodeHash,mQuestHash,isCollectionQuest,isKeyQuest',
        '501,902,false,false',
      ].join('\n');

      const questCsv = [
        'mQuestID,mDayNight,mQuestName',
        '902,2,Night Quest',
      ].join('\n');

      parseDramaCSV(
        'mPartHash,mDramaHash,DramaOrder\n',
        'mDramaHash,mStoryHash\n',
        'mNoteID,mPartID\n',
        nodeQuestCsv,
        questCsv,
        'mQuestID,mSubTargetID\n',
        {},
        oceanData,
      );

      const node = oceanData[0]!.part_list[0]!.node_list[0]!;
      expect(node.night_quest_list).toHaveLength(1);
      expect(node.night_quest_list[0]!.quest_name).toBe('Night Quest');
    });
  });
});
