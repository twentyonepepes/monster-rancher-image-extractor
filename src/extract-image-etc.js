import fs from 'fs';
import { createCanvas, loadImage } from 'canvas';
import path from 'path';

// Paths
const datafolder = './data';
const outputfolder = './output';

// Parameters for subjects and counts
const maxSubject = 200;
const maxCount = 13;

// Function to extract a specific fragment of an image
async function extractImageFragment(imagePath, x, y, w, h) {
    const img = await loadImage(imagePath);
	const w2 = w * 2;
	const h2 = h * 2;
    // const canvas = createCanvas(w, h);
	const canvas = createCanvas(w2, h2);
    const ctx = canvas.getContext('2d');

    // Draw the fragment from the original image
    // ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
	ctx.drawImage(img, x, y, w, h, 0, 0, w2, h2);

    return canvas;
}

// Function to save a canvas as a PNG
async function saveImage(canvas, outputPath) {
    // Ensure the output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write the canvas as a PNG file
    const outStream = fs.createWriteStream(outputPath);
    const stream = canvas.createPNGStream();
    stream.pipe(outStream);

    return new Promise((resolve, reject) => {
        outStream.on('finish', () => resolve());
        outStream.on('error', (err) => reject(err));
    });
}

// Function to extract the thumbnail, name, and description for an item
async function extractItemDetails(imagePath, subject, count) {
    // Extract and save thumbnail
	// todo extract larget canvas text isf fine
	const x = 180,
		y = 20,
		w = 122,
		h = 116;
	const thumbnailCanvas = await extractImageFragment(imagePath, x, y, w, h);
    const thumbnailPath = path.join(outputfolder, subject, `thumbnail_${count}.png`);
    await saveImage(thumbnailCanvas, thumbnailPath);

}

async function extractItemDetails2(imagePath, subject, count) {
    // Extract and save thumbnail
	// todo extract larget canvas text isf fine
	const x = 186,
		y = 40,
		w = 110,
		h = 78;
	const thumbnailCanvas = await extractImageFragment(imagePath, x, y, w, h);
    const thumbnailPath = path.join(outputfolder, subject, `thumbnail_${count}_sm.png`);
    await saveImage(thumbnailCanvas, thumbnailPath);

}

// Main function to process all images
async function main() {
    // Read all files in the data folder
    const files = fs.readdirSync(datafolder);

    // Process each .png image
    for (const file of files) {
        if (path.extname(file) === '.png') {
            // Match the filename pattern img_{subject}_{count}.png
            const match = file.match(/^img_(\d+)_(\d+)\.png$/);
            if (match) {
                const subject = match[1];
                const count = match[2];

                // Skip if the subject or count exceeds max allowed values
                if (subject > maxSubject || count > maxCount) {
                    continue;
                }

                const imagePath = path.join(datafolder, file);

                // Generate the details for the image
                try {
					await extractItemDetails2(imagePath, subject, count);
                    await extractItemDetails(imagePath, subject, count);
                    console.log(`Details extracted for ${file}`);
                } catch (err) {
                    console.error(`Failed to extract details for ${file}:`, err);
                }
            }
        }
    }
}

// Run the script
main();
