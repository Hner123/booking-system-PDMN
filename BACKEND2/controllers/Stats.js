import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ListJsonFiles = (req, res) => {
  try {
    const cacheDir = path.join(__dirname, "../cache");
    const files = fs.readdirSync(cacheDir);

    const jsonFiles = files
      .filter(file => file.endsWith('.json'))
      .map(file => file.slice(0, -5));

    res.json({ jsonFiles });
  } catch (error) {
    console.error("Failed to read cache directory:", error);
    res.status(500).json({ error: "Failed to read the cache directory" });
  }
};