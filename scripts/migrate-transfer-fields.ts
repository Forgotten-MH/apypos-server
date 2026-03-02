/**
 * One-time migration: move flat transfer fields into transfer sub-document.
 *
 * Moves mst_himitsu_question_id, himitsu_answer, migration_pass, migration_id
 * from the document root into a `transfer: { ... }` sub-document.
 *
 * Usage: npx tsx scripts/migrate-transfer-fields.ts
 *
 * Safe to run multiple times — only updates documents that still have flat fields.
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = `mongodb://${process.env.DB_HOST ?? 'localhost'}:${process.env.DB_PORT ?? '27017'}/${process.env.DB_NAME ?? 'apypos'}`;

async function migrate() {
  await mongoose.connect(MONGO_URI);
  console.log(`Connected to ${MONGO_URI}`);

  const db = mongoose.connection.db!;
  const collection = db.collection('users');

  // Find documents with flat transfer fields (not yet migrated)
  const cursor = collection.find({
    $or: [
      { mst_himitsu_question_id: { $exists: true } },
      { himitsu_answer: { $exists: true } },
      { migration_pass: { $exists: true } },
      { migration_id: { $exists: true } },
    ],
  });

  let count = 0;
  for await (const doc of cursor) {
    await collection.updateOne(
      { _id: doc._id },
      {
        $set: {
          'transfer.mst_himitsu_question_id': doc.mst_himitsu_question_id,
          'transfer.himitsu_answer': doc.himitsu_answer,
          'transfer.migration_pass': doc.migration_pass,
          'transfer.migration_id': doc.migration_id,
        },
        $unset: {
          mst_himitsu_question_id: '',
          himitsu_answer: '',
          migration_pass: '',
          migration_id: '',
        },
      },
    );
    count++;
  }

  console.log(`Migrated ${count} documents`);
  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
