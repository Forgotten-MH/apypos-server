import mongoose from "mongoose";
const { Schema } = mongoose;

const equipmentSchema = new Schema({
  //Default Fields
  equipment_id: String, //Id which can be anything ideally weapon_id_instance_number
  created: Number, //Time created
  mst_equipment_id: Number, //WD,AD,OD prefixed equipment
  favorite: Number, // if marked as a favoirte
  //Equipment Fields
  elv: Number, //Equipment Level for Armour and Weapons
  slv: Number, //Martial Arts level
  potential: Number, //Plus value secret technique release
  is_complete_auto_potential_composite: Number, 
  auto_potential_composite: Number,
  //Charm Fields OD_*
  awaked: Number, 
  is_awake: Number, //is awake 
  endAwakeCount: Number, 
  endAwakeRemain: Number, //time left
  end_remain: Number, //time valid till
  start_remain: Number, //time till start
  evolve_start_time: Number,
});

export default equipmentSchema;
