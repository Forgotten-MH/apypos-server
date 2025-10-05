const mongoose = require("mongoose");

const BossSchema = new mongoose.Schema(
  {
    mEnemyID: String,
    mAreaNo: String,
    mFieldSkillPackId: String,
  },
  { _id: false }
);

const RewardItemSchema = new mongoose.Schema(
  {
    mItemHash: String,
    mProbScale: String,
    mRewardType: String,
  },
  { _id: false }
);

const QuestDataSchema = new mongoose.Schema({
  mQuestID: String,
  mQuestType: String,
  mMapID: String,
  mDayNight: String,
  mSortieType: String,
  mTimeLimit: String,
  mTargetTime: String,
  mHideInfo: String,
  mSpWepFlag: String,
  mQuestName: String,
  mDamageMultiplier: String,
  mBossList: [BossSchema],
  mRewardItemList: [RewardItemSchema],
  mSrankRequireId: String,
  mDangerLevel: String,
  mIsUnavailablePowerUp: String,
  mbUnableAuto: String,
  mbUnableRewardIncrease: String,
  mbDangerLvWarning: String,
  mbRandomBlock: String,
  mBlocks: [Number],
  mbUseNewDamageCalc: String,
  mDefineId: String,
});

const RewardItemTableEntrySchema = new mongoose.Schema(
  {
    mItemHash: String,
    mItemValue: String,
    mItemLevel: String,
  },
  { _id: false }
);

const RewardItemTableSchema = new mongoose.Schema(
  {
    mAutoDelete: String,
    classref_: {
      mpArray: [RewardItemTableEntrySchema],
    },
  },
  { _id: false }
);

const RewardDataSchema = new mongoose.Schema(
  {
    mFixedItemTableID: String,
    mRewardItemTable: RewardItemTableSchema,
  },
  { _id: false }
);

const QuestSheet = mongoose.model("QuestSheet", QuestDataSchema);
export default QuestSheet;
