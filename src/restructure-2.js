import fs from 'fs';
import path from 'path';
import util from 'util';

const copyFile = util.promisify(fs.copyFile);
const mkdir = util.promisify(fs.mkdir);
const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);

async function restructure2() {
  // Step 1: Read and parse the map.json file
  const mapFilePath = path.resolve('./map.json');
  const mapData = JSON.parse(await readFile(mapFilePath, 'utf8'));

  // Step 2: Create the output-3 folder
  const output3Dir = path.resolve('./output-3');
  if (!fs.existsSync(output3Dir)) {
    await mkdir(output3Dir);
  }

  // Step 3: Iterate over the map.json entries
  for (const [key, value] of Object.entries(mapData)) {
    // Step 3.1: Split the value into name and number based on the last dash
    const lastDashIndex = value.lastIndexOf('-');
    const namePart = value.substring(0, lastDashIndex); // Extract the name part
    const paddedKey = key.padStart(3, '0'); // Pad the number to 3 digits

    const outputDir = path.join(output3Dir, `${paddedKey}-${namePart}`);

    // Create a folder for each number-name (e.g., 000-dinos-tail/)
    if (!fs.existsSync(outputDir)) {
      await mkdir(outputDir);
    }

    // Step 4: Copy meta.txt from output-2/{value}/meta.txt to output-3/{number-name}/meta.txt
    const metaFilePath = path.resolve('./output-2', value, 'meta.txt');
    const metaDestination = path.join(outputDir, 'meta.txt');
    if (fs.existsSync(metaFilePath)) {
      await copyFile(metaFilePath, metaDestination);
    } else {
      console.log(`meta.txt not found for ${value}, skipping...`);
    }

    // Step 5: Copy img-lg folder from output-2/{value}/ to output-3/{number-name}/images
    const imgLgSource = path.resolve('./output-2', value, 'img-lg');
    const imgDestination = path.join(outputDir, 'images');
    if (fs.existsSync(imgLgSource)) {
      await mkdir(imgDestination);

      const imgFiles = await readdir(imgLgSource);
      for (const file of imgFiles) {
        const newFileName = file.replace('-lg', '');  // Keep the original name structure for images
        const sourceFile = path.join(imgLgSource, file);
        const destFile = path.join(imgDestination, newFileName);

        await copyFile(sourceFile, destFile);
      }
    } else {
      console.log(`img-lg folder not found for ${value}, skipping...`);
    }

    // Step 6: Copy the gif files from video-output/gifs-{size}/ to output-3/{number-name}/
    const gifSizes = ['small', 'medium', 'large', 'xlarge'];
    for (const size of gifSizes) {
      const gifSource = path.resolve(`./video-output/gifs-${size}`, `${key}.gif`);
      const gifDestination = path.join(outputDir, `${paddedKey}-${namePart}-${size}.gif`);

      if (fs.existsSync(gifSource)) {
        await copyFile(gifSource, gifDestination);
      } else {
        console.log(`${size} GIF not found for ${value}, skipping...`);
      }
    }

    // Step 7: Copy the .mp4 file from video-output/clips/{number}.mp4 to output-3/{paddednumber}-{name}.mp4
    const mp4Source = path.resolve(`./video-output/clips`, `${key}.mp4`);
    const mp4Destination = path.join(outputDir, `${paddedKey}-${namePart}.mp4`);

    if (fs.existsSync(mp4Source)) {
      await copyFile(mp4Source, mp4Destination);
    } else {
      console.log(`MP4 file not found for ${value}, skipping...`);
    }
  }

  console.log('Restructuring completed!');
}

restructure2();
