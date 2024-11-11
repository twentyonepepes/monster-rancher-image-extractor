import path from 'path';
import fs from 'fs/promises';

// Function to process description.txt: keep the first line break and remove others
async function processDescriptionFile(descriptionTxtPath, descriptionOutputPath) {
  try {
    const descriptionContent = await fs.readFile(descriptionTxtPath, 'utf-8');
    // Split into lines, keep the first line as is, join the rest by removing additional line breaks
    const lines = descriptionContent.split(/\r?\n/);
    const processedContent = lines[0] + '\n' + lines.slice(1).join(' ').trim();
    await fs.writeFile(descriptionOutputPath, processedContent, 'utf-8');
    console.log(`Processed description and saved to ${descriptionOutputPath}`);
  } catch (error) {
    console.error(`Error processing ${descriptionTxtPath}:`, error);
  }
}

// Function to process name.txt: keep only the first line and save as name-2.txt
async function processNameFile(nameTxtPath, nameOutputPath) {
  try {
    const nameContent = await fs.readFile(nameTxtPath, 'utf-8');
    // Keep only the first line
    const firstLine = nameContent.split('\n')[0].trim();
    await fs.writeFile(nameOutputPath, firstLine, 'utf-8');
    console.log(`Processed name and saved to ${nameOutputPath}`);
  } catch (error) {
    console.error(`Error processing ${nameTxtPath}:`, error);
  }
}

// Function to process all folders
async function processFolders() {
  for (let i = 0; i <= 200; i++) {
    const folderPath = `./output/${i}`;
    const descriptionTxt = path.join(folderPath, 'description.txt');
    const nameTxt = path.join(folderPath, 'name.txt');
    const descriptionOutput = path.join(folderPath, 'description-2.txt');
    const nameOutput = path.join(folderPath, 'name-2.txt');

    // Check if the description and name files exist before processing
    try {
      const descriptionExists = await fs.access(descriptionTxt).then(() => true).catch(() => false);
      const nameExists = await fs.access(nameTxt).then(() => true).catch(() => false);

      if (descriptionExists) {
        await processDescriptionFile(descriptionTxt, descriptionOutput);
      } else {
		//  where the file would go, write `???`
		await fs.writeFile(descriptionOutput, '???', 'utf-8');
	  }

      if (nameExists) {
        await processNameFile(nameTxt, nameOutput);
      } else {
		//  where the file would go, write `???`
		await fs.writeFile(nameOutput, '???', 'utf-8');
	  }

    } catch (error) {
      console.error(`Error processing folder ${folderPath}:`, error);
    }
  }
}

processFolders();
