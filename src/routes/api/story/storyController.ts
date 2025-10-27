import { Request, Response } from "express";
import { encryptAndSend } from "../../../services/crypto/encryptionHelpers";
import User from "../../../model/user";
const updateNodeList = (oceanList, mst_ocean_id, mst_part_id, newNode) => {
  const ocean = oceanList.find((ocean) => ocean.mst_ocean_id === mst_ocean_id);

  if (ocean) {
    const part = ocean.part_list.find(
      (part) => part.mst_part_id === mst_part_id
    );

    if (part) {
      // Add the new node to the node_list
      part.node_list.push(newNode);
      console.log("Node added successfully.");
    } else {
      console.log("Part not found.");
    }
  } else {
    console.log("Ocean not found.");
  }
};

const updateNodeState = (
  oceanList,
  mst_ocean_id,
  mst_part_id,
  mst_node_id,
  mst_story_id,
  newState
) => {
  const ocean = oceanList.find((ocean) => ocean.mst_ocean_id === mst_ocean_id);

  if (ocean) {
    const part = ocean.part_list.find(
      (part) => part.mst_part_id === mst_part_id
    );

    if (part) {
      const node = part.node_list.find(
        (node) =>
          node.mst_node_id === mst_node_id && node.mst_story_id === mst_story_id
      );

      if (node) {
        // Update the state of the node
        node.state = newState;
        console.log("Node state updated successfully.");
      } else {
        console.log("Node not found.");
      }
    } else {
      console.log("Part not found.");
    }
  } else {
    console.log("Ocean not found.");
  }
};

const updateMonument = (monument, augiteObj, hr, atk, def, hp, sp) => {
  console.log("old monumnet", monument);

  monument.augite.push(augiteObj);
  console.log("augite added successfully to box.");
  monument.hr = monument.hr + hr;
  monument.mlv.atk = monument.mlv.atk + atk;
  monument.mlv.def = monument.mlv.def + def;
  monument.mlv.hp = monument.mlv.hp + hp;
  monument.mlv.sp = monument.mlv.sp + sp;
  console.log("new monumnet", monument);
};

export const updatePartNoteState = (
  oceanList,
  mst_ocean_id,
  mst_part_id,
  mst_note_content_id,
  newState
) => {
  const ocean = oceanList.find((ocean) => ocean.mst_ocean_id === mst_ocean_id);

  if (ocean) {
    const part = ocean.part_list.find(
      (part) => part.mst_part_id === mst_part_id
    );

    if (part) {
      const note = part.exploration_note.note_contents.find(
        (note) => note.mst_note_content_id === mst_note_content_id
      );

      if (note) {
        // Update the state of the node
        note.state = newState;
        console.log("note state updated successfully.");
      } else {
        console.log("note not found.");
      }
    } else {
      console.log("Part not found.");
    }
  } else {
    console.log("Ocean not found.");
  }
};

export const end = async (req: Request, res: Response) => {
  const mst_node_id = req.body.mst_node_id;
  const mst_note_content_id = req.body.mst_note_content_id;
  const mst_ocean_id = req.body.mst_ocean_id;
  const mst_part_id = req.body.mst_part_id;
  const mst_story_id = req.body.mst_story_id;
  // Use the above values to determine how to increment the island....

  const data = {
    mst_part_id: 0,
    open_list: {
      open_node: [],
      open_ocean: [],
      open_part: [],
    },
    pop_list: [
      //   {
      //   item_list:{
      //     pop_id:0,
      //   }
      // }
    ],
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
    const filter = { current_session: req.body.session_id };
    let doc = await User.findOne(filter);
    const newNode = {
      is_collection_node: 1,
      mst_node_id: 2278830943,
      mst_story_id: 0,
      state: 1,
    };

    if (!doc) {
      return encryptAndSend({}, res, req, 2004); //Not authenticated
    }
    
    updateNodeList(doc.ocean_list, mst_ocean_id, mst_part_id, newNode);
    updateNodeState(
      doc.ocean_list,
      mst_ocean_id,
      mst_part_id,
      mst_node_id,
      mst_story_id,
      0
    );
    console.log(doc.ocean_list);
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
    const filter = { current_session: req.body.session_id };
    let doc = await User.findOne(filter);

    if (!doc) {
      return encryptAndSend({}, res, req, 2004); //Not authenticated
    }

    updateMonument(doc.box.monument, augiteObj,hr, atk, def, hp, sp);

    updatePartNoteState(
      doc.ocean_list,
      mst_ocean_id,
      mst_part_id,
      mst_note_content_id,
      3
    );
    console.log(doc.ocean_list);
    const update = { ocean_list: doc.ocean_list, box: doc.box };

    await User.findByIdAndUpdate(doc.id, update);
  }
  encryptAndSend(data, res, req);
};
