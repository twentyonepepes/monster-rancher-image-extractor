import path from 'path';
import fs from 'fs/promises';

// Helper function to convert folder number to 2-digit hex
function convertToHex(number) {
  return `0x${number.toString(16).padStart(2, '0')}`;
}

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
  const lgImgFolderPath = path.join(newFolderPath, 'img-lg');
  
  await fs.mkdir(imgFolderPath, { recursive: true });

  // // delete lgImgFolderPath if it exists
  // try {
  //   await fs.rmdir(lgImgFolderPath, { recursive: true });
  // } catch (error) {
  //   console.error(`Error deleting ${lgImgFolderPath}:`, error);
  // }

  // empty lgImgFolderPath if it exists
  const lgImgFolderExists = await fs.access(lgImgFolderPath).then(() => true).catch(() => false);
  if (lgImgFolderExists) {
    const lgImgFiles = await fs.readdir(lgImgFolderPath);
    for (const file of lgImgFiles) {
      const filePath = path.join(lgImgFolderPath, file);
      await fs.unlink(filePath);
    }
  }

  await fs.mkdir(lgImgFolderPath, { recursive: true });
  

  for (let i = 1; i <= 13; i++) {
    const thumbnailFileName = `thumbnail_${i}_sm.png`;
    const sourceThumbnailPath = path.join(originalFolder, thumbnailFileName);
    const destThumbnailPath = path.join(imgFolderPath, `${sanitizedFolderName}-${i}.png`);

    const exists = await fileExists(sourceThumbnailPath);
    if (exists) {
      try {
        // Copy the thumbnail to the img folder
        await fs.copyFile(sourceThumbnailPath, destThumbnailPath);
        
        // Copy thumbnail_8.png to main folder as thumbnail.png
        if (i === 8) {
          const mainThumbnailPath = path.join(newFolderPath, 'thumbnail.png');
          await fs.copyFile(sourceThumbnailPath, mainThumbnailPath);
        }
      } catch (error) {
        console.error(`Error copying ${thumbnailFileName}:`, error);
      }
    }
  }

  
  for (let i = 1; i <= 13; i++) {
    const thumbnailFileName = `thumbnail_${i}.png`;
    const sourceThumbnailPath = path.join(originalFolder, thumbnailFileName);
    // const destThumbnailPath = path.join(imgFolderPath, `${sanitizedFolderName}-${i}.png`);
    const destThumbnailPath = path.join(lgImgFolderPath, `${sanitizedFolderName}-${i}-lg.png`);

    const exists = await fileExists(sourceThumbnailPath);
    if (exists) {
      try {
        // Copy the thumbnail to the img folder
        await fs.copyFile(sourceThumbnailPath, destThumbnailPath);
        
        // Copy thumbnail_8.png to main folder as thumbnail.png
        // if (i === 8) {
        //   const mainThumbnailPath = path.join(newFolderPath, 'thumbnail.png');
        //   await fs.copyFile(sourceThumbnailPath, mainThumbnailPath);
        // }
      } catch (error) {
        console.error(`Error copying ${thumbnailFileName}:`, error);
      }
    }
  }
}

// Function to create the new folder and write meta.txt
async function createNewFolderAndMetaTxt(originalFolder, folderNumber, sanitizedFolderName) {
  try {
    // const nameTxtPath = path.join(originalFolder, 'name-2.txt');
    // const descriptionTxtPath = path.join(originalFolder, 'description-2.txt');

    // // Read the contents of name-2.txt and description-2.txt
    // let name = '';
    // let description = '';

    // try {
    //   name = await fs.readFile(nameTxtPath, 'utf-8');
    // } catch {
    //   // Fallback to the folder number if name-2.txt is missing
    //   name = folderNumber.toString();
    // }

    // try {
    //   description = await fs.readFile(descriptionTxtPath, 'utf-8');
    // } catch {
    //   description = '???';  // Use ??? if description-2.txt is missing
    // }

    // // Create the new folder path in output-2
    const newFolderPath = path.join('./output-2', `${sanitizedFolderName}-${folderNumber}`);
    await fs.mkdir(newFolderPath, { recursive: true });

    // // Create the meta.txt file
    // const hexValue = convertToHex(folderNumber);
    // const metaContent = `${hexValue}\n${name.trim() || '???'}\n${description.trim() || '???'}\n`;
    // const metaTxtPath = path.join(newFolderPath, 'meta.txt');
    // await fs.writeFile(metaTxtPath, metaContent, 'utf-8');

    // Copy thumbnail images and rename
    await copyThumbnails(originalFolder, newFolderPath, sanitizedFolderName);

  } catch (error) {
    console.error(`Error creating folder and meta.txt for folder ${folderNumber}:`, error);
  }
}

// Function to process all folders in output1 and generate map.json
async function processFolders() {
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
        folderMap[i] = `${sanitizedFolderName}-${i}`;

        // Create the new folder, copy thumbnails, and create meta.txt
        await createNewFolderAndMetaTxt(originalFolder, i, sanitizedFolderName);
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

processFolders();
