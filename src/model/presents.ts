import augiteSchema from "./items/augite";
import equipmentSchema from "./items/equipment";
import growthItemSchema from "./items/growth_item";
import limitedSchema from "./items/limited";
import matatabiSchema from "./items/matatabi";
import materialSchema from "./items/material";
import paymentSchema from "./items/payment";
import pointSchema from "./items/point";
import powerSchema from "./items/power";
import otomoSchema from "./sidekicks/otomo";
import partnerSchema from "./sidekicks/partner";

const mongoose = require("mongoose");

const ContentSchema = new mongoose.Schema(
  {
    equipments: [equipmentSchema],
    payments: [paymentSchema],
    points: [pointSchema],
    powers: [powerSchema],
    growth_items: [growthItemSchema],
    limiteds: [limitedSchema],
    matatabis: [matatabiSchema],
    materials: [materialSchema],
    monument: {
      augite: [augiteSchema],
      hr: Number,
      mlv: {
        atk: Number,
        def: Number,
        hp: Number,
        sp: Number,
      },
    },

    otomos: [otomoSchema],
    partners: [partnerSchema],
    zenny: Number,
    //TODO add schema for these...
    collections: [mongoose.Schema.Types.Mixed],
    pcoins: [mongoose.Schema.Types.Mixed],
    stamp_sets: [mongoose.Schema.Types.Mixed],
  },
  { _id: false }
);

const PresentSchema = new mongoose.Schema({
  uu_id: { type: String, required: true },
  content: { type: ContentSchema, required: true },
  created: { type: Number, default: 0 },
  expires_in: { type: Number, default: 0 },
  message: { type: String, default: "" },
  received: { type: Number, default: 0 },
  start: { type: Number, default: 0 },
  valid: { type: Number, default: 0 },
});

const Present = mongoose.model("Present", PresentSchema);

export default Present;
