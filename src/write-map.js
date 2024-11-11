import path from 'path';
import fs from 'fs/promises';

// Helper function to generate a sanitized folder name or fallback to the folder number
function sanitizeFolderName(name, fallbackName) {
  if (!name) return fallbackName;
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')  // Remove special characters
    .replace(/\s+/g, '-');        // Replace spaces with hyphens
}

// Function to create the map of old folder names to new folder names
async function createFolderMap() {
  const folderMap = {};

  for (let i = 0; i <= 200; i++) {
    const originalFolder = `./output/${i}`;
    try {
      // Check if the folder exists
      const folderExists = await fs.access(originalFolder).then(() => true).catch(() => false);

      if (folderExists) {
        const nameTxtPath = path.join(originalFolder, 'name-2.txt');
        let name = '';

        try {
          name = await fs.readFile(nameTxtPath, 'utf-8');
        } catch {
          name = i.toString();  // Fallback to folder number if name is missing
        }

        const sanitizedFolderName = sanitizeFolderName(name.trim(), i.toString());

        // Add the mapping to the folderMap object
        folderMap[i] = sanitizedFolderName;

      } else {
        console.log(`Folder ${i} does not exist, skipping...`);
      }
    } catch (error) {
      console.error(`Error processing folder ${i}:`, error);
    }
  }

  // Write the folderMap to a map.json file
  const mapJsonPath = path.join('./output-2', 'map.json');
  await fs.writeFile(mapJsonPath, JSON.stringify(folderMap, null, 2), 'utf-8');
  console.log(`map.json file created at ${mapJsonPath}`);
}

createFolderMap();
