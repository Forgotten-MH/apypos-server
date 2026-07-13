import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';

vi.mock('../../../model/user');
vi.mock('../../../services/crypto/encryptionHelpers');
vi.mock('../../../middleware/logger', () => ({
  createLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  }),
}));

import User from '../../../model/user.js';
import { encryptAndSend } from '../../../services/crypto/encryptionHelpers.js';
import { ERROR_CODE } from '../../../constants/error.codes.js';
import { end, updatePartNoteState } from './story.controller.js';
import type { Ocean } from './story.controller.js';

function mockReqRes(body: Record<string, unknown> = {}) {
  const req = { body, ip: '127.0.0.1', get: vi.fn() } as unknown as Request;
  const res = {} as Response;
  return { req, res };
}

function makeOceanList(): Ocean[] {
  return [
    {
      mst_ocean_id: 3525753088,
      part_list: [
        {
          mst_part_id: 3815380063,
          campaign: [],
          exploration_note: {
            note_contents: [
              { mst_note_content_id: 2030304811, state: 1 },
              { mst_note_content_id: 3758796689, state: 1 },
            ],
            progress: 0,
          },
          gingira_node_id: 0,
          node_list: [
            {
              is_collection_node: 0,
              mst_node_id: 517825253,
              mst_story_id: 1603733826,
              state: 5,
            },
          ],
          object_list: [],
          raid_info: [],
          silver_bonus: 0,
          state: 1,
        },
      ],
    },
  ];
}

describe('story.controller', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('updatePartNoteState', () => {
    it('updates note state when found', () => {
      const oceanList = makeOceanList();
      updatePartNoteState(oceanList, 3525753088, 3815380063, 2030304811, 3);
      const note = oceanList[0]!.part_list[0]!.exploration_note.note_contents[0]!;
      expect(note.state).toBe(3);
    });

    it('does nothing when ocean not found', () => {
      const oceanList = makeOceanList();
      updatePartNoteState(oceanList, 999, 3815380063, 2030304811, 3);
      expect(oceanList[0]!.part_list[0]!.exploration_note.note_contents[0]!.state).toBe(1);
    });

    it('does nothing when part not found', () => {
      const oceanList = makeOceanList();
      updatePartNoteState(oceanList, 3525753088, 999, 2030304811, 3);
      expect(oceanList[0]!.part_list[0]!.exploration_note.note_contents[0]!.state).toBe(1);
    });

    it('does nothing when note not found', () => {
      const oceanList = makeOceanList();
      updatePartNoteState(oceanList, 3525753088, 3815380063, 999, 3);
      expect(oceanList[0]!.part_list[0]!.exploration_note.note_contents[0]!.state).toBe(1);
    });
  });

  describe('end', () => {
    it('returns default response for unmatched story parameters', async () => {
      const { req, res } = mockReqRes({
        mst_node_id: 0,
        mst_note_content_id: 0,
        mst_ocean_id: 0,
        mst_part_id: 0,
        mst_story_id: 0,
        session_id: 'sess-1',
      });

      await end(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          mst_part_id: 0,
          open_list: expect.objectContaining({
            open_node: [],
            open_ocean: [],
            open_part: [],
          }),
          pop_list: [],
        }),
        res,
        req,
      );
    });

    it('returns NOT_AUTHENTICATED for first branch when user not found', async () => {
      vi.mocked(User.findOne).mockResolvedValue(null);

      const { req, res } = mockReqRes({
        mst_ocean_id: 3525753088,
        mst_part_id: 3815380063,
        mst_node_id: 517825253,
        mst_story_id: 1603733826,
        mst_note_content_id: 0,
        session_id: 'sess-1',
      });

      await end(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith({}, res, req, ERROR_CODE.NOT_AUTHENTICATED);
    });

    it('opens new node for first story progression', async () => {
      const mockDoc = {
        id: 'doc-id',
        ocean_list: makeOceanList(),
        box: { monument: { augite: [], hr: 0, mlv: { atk: 0, def: 0, hp: 0, sp: 0 } } },
      };
      vi.mocked(User.findOne).mockResolvedValue(mockDoc as never);
      vi.mocked(User.findByIdAndUpdate).mockResolvedValue(null);

      const { req, res } = mockReqRes({
        mst_ocean_id: 3525753088,
        mst_part_id: 3815380063,
        mst_node_id: 517825253,
        mst_story_id: 1603733826,
        mst_note_content_id: 0,
        session_id: 'sess-1',
      });

      await end(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          mst_part_id: 3815380063,
          open_list: expect.objectContaining({
            open_node: [{ mst_node_id: 2278830943 }],
          }),
        }),
        res,
        req,
      );
    });

    it('returns NOT_AUTHENTICATED for note collection when user not found', async () => {
      vi.mocked(User.findOne).mockResolvedValue(null);

      const { req, res } = mockReqRes({
        mst_ocean_id: 3525753088,
        mst_part_id: 3815380063,
        mst_node_id: 0,
        mst_story_id: 0,
        mst_note_content_id: 3758796689,
        session_id: 'sess-1',
      });

      await end(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith({}, res, req, ERROR_CODE.NOT_AUTHENTICATED);
    });
  });
});
