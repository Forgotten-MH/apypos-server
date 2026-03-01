import { Request, Response } from 'express';
import { encryptAndSend } from '../../../services/crypto/encryptionHelpers.js';
import { ERROR_CODE } from '../../../constants/error.codes.js';
import { createLogger } from '../../../middleware/logger.js';
import User from '../../../model/user.js';
import type { StoryEndInput } from './story.schema.js';
import type {
  Ocean,
  OceanPart,
  OceanNode,
  NoteContent,
  Augite,
  Monument,
} from '../../../types/game.js';
export type { Ocean };
const log = createLogger('story');

type Part = OceanPart;
type Node = OceanNode;

interface PopItem {
  item_list: {
    pop_id: number;
    monument?: {
      augite: Augite[];
      hr: number;
      mlv: {
        atk: number;
        def: number;
        hp: number;
        sp: number;
      };
    };
  };
}

interface OpenNode {
  mst_node_id: number;
}

const updateNodeList = (
  oceanList: Ocean[],
  mst_ocean_id: number,
  mst_part_id: number,
  newNode: Node,
) => {
  const ocean = oceanList.find((ocean) => ocean.mst_ocean_id === mst_ocean_id);

  if (ocean) {
    const part = ocean.part_list.find((part: Part) => part.mst_part_id === mst_part_id);

    if (part) {
      part.node_list.push(newNode);
      log.debug('Node added successfully.');
    } else {
      log.debug('Part not found.');
    }
  } else {
    log.debug('Ocean not found.');
  }
};

const updateNodeState = (
  oceanList: Ocean[],
  mst_ocean_id: number,
  mst_part_id: number,
  mst_node_id: number,
  mst_story_id: number,
  newState: number,
) => {
  const ocean = oceanList.find((ocean: Ocean) => ocean.mst_ocean_id === mst_ocean_id);

  if (ocean) {
    const part = ocean.part_list.find((part: Part) => part.mst_part_id === mst_part_id);

    if (part) {
      const node = part.node_list.find(
        (node: Node) => node.mst_node_id === mst_node_id && node.mst_story_id === mst_story_id,
      );

      if (node) {
        // Update the state of the node
        node.state = newState;
        log.debug('Node state updated successfully.');
      } else {
        log.debug('Node not found.');
      }
    } else {
      log.debug('Part not found.');
    }
  } else {
    log.debug('Ocean not found.');
  }
};

const updateMonument = (
  monument: Monument,
  augiteObj: Augite,
  hr: number,
  atk: number,
  def: number,
  hp: number,
  sp: number,
) => {
  log.debug('old monumnet', monument);

  monument.augite.push(augiteObj);
  log.debug('augite added successfully to box.');
  monument.hr = monument.hr + hr;
  monument.mlv.atk = monument.mlv.atk + atk;
  monument.mlv.def = monument.mlv.def + def;
  monument.mlv.hp = monument.mlv.hp + hp;
  monument.mlv.sp = monument.mlv.sp + sp;
  log.debug('new monumnet', monument);
};

export const updatePartNoteState = (
  oceanList: Ocean[],
  mst_ocean_id: number,
  mst_part_id: number,
  mst_note_content_id: number,
  newState: number,
) => {
  const ocean = oceanList.find((ocean: Ocean) => ocean.mst_ocean_id === mst_ocean_id);

  if (ocean) {
    const part = ocean.part_list.find((part: Part) => part.mst_part_id === mst_part_id);

    if (part) {
      const note = part.exploration_note.note_contents.find(
        (note: NoteContent) => note.mst_note_content_id === mst_note_content_id,
      );

      if (note) {
        // Update the state of the node
        note.state = newState;
        log.debug('note state updated successfully.');
      } else {
        log.debug('note not found.');
      }
    } else {
      log.debug('Part not found.');
    }
  } else {
    log.debug('Ocean not found.');
  }
};

export const end = async (req: Request, res: Response) => {
  const { session_id, mst_node_id, mst_note_content_id, mst_ocean_id, mst_part_id, mst_story_id } = req.body as StoryEndInput;
  // Use the above values to determine how to increment the island....

  const data = {
    mst_part_id: 0,
    open_list: {
      open_node: [] as OpenNode[],
      open_ocean: [] as { mst_ocean_id: number }[],
      open_part: [] as { mst_part_id: number }[],
    },
    pop_list: [] as PopItem[],
  };

  if (
    mst_ocean_id == 3525753088 &&
    mst_part_id == 3815380063 &&
    mst_node_id == 517825253 &&
    mst_story_id == 1603733826 &&
    mst_note_content_id == 0
  ) {
    data.pop_list.push();
    data.open_list.open_node.push({ mst_node_id: 2278830943 });
    data.mst_part_id = 3815380063;
    const filter = { current_session: session_id };
    const doc = await User.findOne(filter);
    const newNode = {
      is_collection_node: 1,
      mst_node_id: 2278830943,
      mst_story_id: 0,
      state: 1,
    };

    if (!doc) {
      return encryptAndSend({}, res, req, ERROR_CODE.NOT_AUTHENTICATED); //Not authenticated
    }

    updateNodeList(doc.ocean_list, mst_ocean_id, mst_part_id, newNode);
    updateNodeState(doc.ocean_list, mst_ocean_id, mst_part_id, mst_node_id, mst_story_id, 0);
    log.debug(doc.ocean_list);
    const update = { ocean_list: doc.ocean_list };

    await User.findByIdAndUpdate(doc.id, update);
  }

  if (
    mst_ocean_id == 3525753088 &&
    mst_part_id == 3815380063 &&
    mst_node_id == 0 &&
    mst_story_id == 0 &&
    mst_note_content_id == 3758796689
  ) {
    const hr = 0;
    const atk = 0;
    const def = 0;
    const hp = 0;
    const sp = 0;

    const augiteObj = {
      amount: 20,
      mst_augite_id: 2047024966,
      mst_monument_type_id: 3,
    };
    data.pop_list.push({
      item_list: {
        pop_id: 1,
        monument: {
          augite: [augiteObj],
          hr: hr,
          mlv: {
            atk: atk,
            def: def,
            hp: hp,
            sp: sp,
          },
        },
      },
    });

    data.mst_part_id = mst_part_id;
    const filter = { current_session: session_id };
    const doc = await User.findOne(filter);

    if (!doc) {
      return encryptAndSend({}, res, req, ERROR_CODE.NOT_AUTHENTICATED); //Not authenticated
    }

    updateMonument(doc.box!.monument!, augiteObj, hr, atk, def, hp, sp);

    updatePartNoteState(doc.ocean_list, mst_ocean_id, mst_part_id, mst_note_content_id, 3);
    log.debug(doc.ocean_list);
    const update = { ocean_list: doc.ocean_list, box: doc.box };

    await User.findByIdAndUpdate(doc.id, update);
  }
  encryptAndSend(data, res, req);
};
