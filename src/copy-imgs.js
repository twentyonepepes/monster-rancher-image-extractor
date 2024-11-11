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

// Function to check if a file exists
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Function to copy thumbnails and create img folder
async function copyThumbnails(originalFolder, newFolderPath, sanitizedFolderName) {
  const imgFolderPath = path.join(newFolderPath, 'img');
  await fs.mkdir(imgFolderPath, { recursive: true });

  for (let i = 1; i <= 13; i++) {
    const thumbnailFileName = `thumbnail_${i}.png`;
    const sourceThumbnailPath = path.join(originalFolder, thumbnailFileName);
    const destThumbnailPath = path.join(imgFolderPath, `${sanitizedFolderName}-${i}.png`);

    const exists = await fileExists(sourceThumbnailPath);
    if (exists) {
      try {
        // Copy the thumbnail to the img folder
        await fs.copyFile(sourceThumbnailPath, destThumbnailPath);
        console.log(`Copied ${thumbnailFileName} to ${destThumbnailPath}`);
        
        // Copy thumbnail_8.png to main folder as thumbnail.png
        if (i === 8) {
          const mainThumbnailPath = path.join(newFolderPath, 'thumbnail.png');
          await fs.copyFile(sourceThumbnailPath, mainThumbnailPath);
          console.log(`Copied thumbnail_8.png to ${mainThumbnailPath}`);
        }
      } catch (error) {
        console.error(`Error copying ${thumbnailFileName}:`, error);
      }
    } else {
      console.log(`Thumbnail ${thumbnailFileName} not found in ${originalFolder}, skipping...`);
    }
  }
}

// Function to process all folders in output1
async function processFolders() {
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
        const newFolderPath = path.join('./output-2', sanitizedFolderName);
        await copyThumbnails(originalFolder, newFolderPath, sanitizedFolderName);
      } else {
        console.log(`Folder ${i} does not exist, skipping...`);
      }
    } catch (error) {
      console.error(`Error processing folder ${i}:`, error);
    }
  }
}

processFolders();
