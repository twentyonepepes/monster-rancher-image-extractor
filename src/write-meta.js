import fs from 'fs';
import path from 'path';
import util from 'util';

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const meta = [];

async function writeMeta() {
  try {
    // Step 1: Read and parse the map.json file
    const mapFilePath = path.resolve('./map.json');
    const mapData = JSON.parse(await readFile(mapFilePath, 'utf8'));

    // Step 2: Iterate over the map.json entries
    for (const [key, value] of Object.entries(mapData)) {
      const paddedKey = parseInt(key, 10); // Convert number to an integer

      // Split value based on the last dash, separating name and number
      const lastDashIndex = value.lastIndexOf('-');
      const namePart = value.substring(0, lastDashIndex);  // Extract everything before the last dash (e.g., "potato")
      
      const slug = `${String(paddedKey).padStart(3, '0')}-${namePart}`;  // Create slug (e.g., 000-potato)
      const metaFilePath = path.resolve(`./output-3/${slug}/meta.txt`);

      // Initialize default values with placeholders
      let name = "???";
      let caption = "???";
      let description = "???";

      // Step 3: Try to read the meta.txt file if it exists
      if (fs.existsSync(metaFilePath)) {
        const metaContent = await readFile(metaFilePath, 'utf8');
        const metaLines = metaContent.split('\n').map(line => line.trim()).filter(Boolean); // Split by line and trim spaces

        // Ensure the file has at least 4 lines (including the number)
        if (metaLines.length >= 4) {
          name = metaLines[1];
          caption = metaLines[2];
          description = metaLines[3];
        } else {
          console.error(`meta.txt for ${slug} does not contain enough lines.`);
        }
      } else {
        console.error(`meta.txt file not found for ${slug}`);
      }

      // Step 4: Add the entry to the meta array (use placeholders if data is missing)
      meta.push({
        slug: slug,
        number: paddedKey, // Store the number as an integer
        name: name,
        caption: caption,
        description: description
      });
    }

    // Step 5: Write the meta array to meta.json
    const outputMetaPath = path.resolve('./meta.json');
    await writeFile(outputMetaPath, JSON.stringify(meta, null, 2), 'utf8');
    console.log(`meta.json file successfully written with ${meta.length} entries.`);
  } catch (error) {
    console.error('Error while writing meta.json:', error);
  }
}

writeMeta();
