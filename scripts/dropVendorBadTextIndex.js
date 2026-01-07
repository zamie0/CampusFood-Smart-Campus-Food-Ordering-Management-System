// scripts/dropVendorBadTextIndex.js
// Detect and drop any text index on the 'vendors' collection that includes the 'categories' field.
// Usage: node scripts/dropVendorBadTextIndex.js

import dotenv from 'dotenv';
import { connectToDatabase } from '../config/db.js';

dotenv.config();

(async () => {
  try {
    const { db, conn } = await connectToDatabase();
    const col = db.collection('vendors');

    const indexes = await col.indexes();
    const toDrop = indexes.filter((idx) => {
      if (!idx || !idx.key) return false;
      const keys = Object.keys(idx.key);
      const includesCategories = keys.includes('categories');
      const isText = Boolean(idx.weights) || keys.some((k) => idx.key[k] === 'text');
      return includesCategories && isText;
    });

    if (toDrop.length === 0) {
      console.log('No text indexes including "categories" found on vendors collection. Nothing to drop.');
    } else {
      for (const idx of toDrop) {
        console.log(`Dropping index: ${idx.name} ->`, idx.key);
        await col.dropIndex(idx.name);
      }
      console.log('Finished dropping problematic text index(es).');
    }

    // Optional: Ensure a helpful multikey index for categories array (fast $in/$all queries)
    // Comment out if you do not want this extra index.
    try {
      await col.createIndex({ categories: 1 });
      console.log('Ensured multikey index on categories: { categories: 1 }');
    } catch (e) {
      console.warn('Could not ensure categories index (may already exist):', e.message);
    }

    await conn.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error dropping index:', err);
    process.exit(1);
  }
})();
