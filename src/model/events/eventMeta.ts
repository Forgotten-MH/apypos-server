import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const NodeInfoSchema = new Schema({
  beginner_node_id: { type: Number, default: 0 },
  hard_polar_node_id: { type: Number, default: 0 },
  kari_polar_node_id: { type: Number, default: 0 },
  new_multi_node_id: { type: Number, default: 0 },
  normal_polar_node_id: { type: Number, default: 0 },
});

const eventSchema = new Schema({
  big_node_order_array: {
    type: [
      {
        big_node_id: { type: Number, required: true },
      },
    ],
    default: [],
  },
  next_day_start: { type: Date },
  next_latest_node_infos: {
    type: NodeInfoSchema,
    default: {
      beginner_node_id: 0,
      hard_polar_node_id: 0,
      kari_polar_node_id: 0,
      new_multi_node_id: 0,
      normal_polar_node_id: 0,
    },
  },
  now_latest_node_info_remain: { type: Date },
  now_latest_node_infos: {
    type: NodeInfoSchema,
    default: {
      beginner_node_id: 0,
      hard_polar_node_id: 0,
      kari_polar_node_id: 0,
      new_multi_node_id: 0,
      normal_polar_node_id: 0,
    },
  },
});

const Event = model('Event', eventSchema);
export default Event;
