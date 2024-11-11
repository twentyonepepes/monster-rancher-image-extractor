// Import the Google Cloud client library
import vision from '@google-cloud/vision';
import path from 'path';
// import fs from 'fs/promises';
import fs from 'fs'

// Set the environment variable for credentials
process.env.GOOGLE_APPLICATION_CREDENTIALS = path.resolve('./env/gcp.json');

// Initialize the client
const client = new vision.ImageAnnotatorClient();

// Function to extract text and save it as a .txt file
async function extractAndSaveText(imagePath, outputTxtPath) {
	try {
		// Performs text detection on the image file
		const [result] = await client.textDetection(imagePath);
		const detections = result.textAnnotations;
		if (detections.length > 0) {
			const extractedText = detections[0].description;
			// Save the extracted text to a file
			//   await fs.writeFile(outputTxtPath, extractedText, 'utf-8');
			console.info("output", outputTxtPath)
			fs.writeFileSync(outputTxtPath, extractedText, 'utf-8');
			// fs.writeFileSync(outputTxtPath, extractedText);
			console.log(`Extracted: ${extractedText}`);
		}
	} catch (error) {
		console.error(`Error during text extraction for ${imagePath}:`, error);
	}
}

// Function to process all folders and extract text from images
async function processFolders() {
	//   for (let i = 150; i <= 200; i++) {
	for (let i = 78; i <= 79; i++) {
		console.info(i)
		const folderPath = `./output/${i}`;
		const descriptionImg = path.join(folderPath, 'description.png');
		const nameImg = path.join(folderPath, 'name.png');
		const descriptionTxt = path.join(folderPath, 'description.txt');
		const nameTxt = path.join(folderPath, 'name.txt');

		// Check if the image files exist before processing
		try {
			const descriptionExists = fs.existsSync(descriptionImg);
			const nameExists = fs.existsSync(nameImg);

			if (descriptionExists) {
				await extractAndSaveText(descriptionImg, descriptionTxt, i);
			} else {
				console.info(`File ${descriptionImg} does not exist`);
			}

			if (nameExists) {
				// await extractAndSaveText(nameImg, nameTxt);
				await extractAndSaveText(nameImg, nameTxt, i);
			} else {
				console.info(`File ${nameImg} does not exist`);
			}

		} catch (error) {
			console.error(`Error processing folder ${folderPath}:`, error);
		}
	}
}

processFolders();
