import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

// FFmpeg binary path
const ffmpegPath = path.resolve('lib', 'ffmpeg', 'bin', 'ffmpeg.exe');

// Settings
const START_TIME = 1.3; // Start time in seconds (0 means from the beginning)
const RECORD_TIME = 3.4; // Record time in seconds (3.8 seconds for testing)
// const SCALE_FACTOR = 0.25; // Scale factor (0.5 to reduce the size)
const SCALE_FACTOR = 0.5; // Scale factor (0.5 to reduce the size)
const FRAME_RATE = 15; // Frame rate for the GIF
const MAX_FILES = 200; // Process only the first 10 files for testing

// Path to input and output folders
const inputFolder = path.resolve('video-output', 'clips');
const outputFolder = path.resolve('video-output', 'gifs-medium');

// Ensure the output directory exists
if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder, { recursive: true });
}

// Function to generate a palette for a given MP4
async function generatePalette(inputFile, paletteFile) {
  return new Promise((resolve, reject) => {
    const command = `"${ffmpegPath}" -ss ${START_TIME} -t ${RECORD_TIME} -i "${inputFile}" -vf "fps=${FRAME_RATE},scale=iw*${SCALE_FACTOR}:-1,palettegen" "${paletteFile}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Error generating palette:', error);
        console.error('FFmpeg stderr:', stderr);
        reject(error);
        return;
      }
      console.log(`Generated palette: ${paletteFile}`);
      resolve();
    });
  });
}

// Function to convert a single MP4 to a GIF using a palette
async function convertSingleMp4ToGif(inputFile, outputFile, paletteFile) {
  return new Promise((resolve, reject) => {
    const command = `"${ffmpegPath}" -ss ${START_TIME} -t ${RECORD_TIME} -i "${inputFile}" -i "${paletteFile}" -filter_complex "[0:v] fps=${FRAME_RATE},scale=iw*${SCALE_FACTOR}:-1 [x]; [x][1:v] paletteuse" "${outputFile}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Error converting to GIF:', error);
        console.error('FFmpeg stderr:', stderr);
        reject(error);
        return;
      }
      console.log(`Converted: ${inputFile} -> ${outputFile}`);
      resolve();
    });
  });
}

// Main function to convert the first 10 MP4s in the folder to GIFs
async function convertToGif() {
  // Get list of all .mp4 files in the input folder and limit to first 10 files
  const files = fs.readdirSync(inputFolder).filter(file => file.endsWith('.mp4')).slice(0, MAX_FILES);

  for (const file of files) {
    const inputFile = path.resolve(inputFolder, file);
    const outputFile = path.resolve(outputFolder, file.replace('.mp4', '.gif'));
    const paletteFile = path.resolve(outputFolder, file.replace('.mp4', '-palette.png'));

    try {
      // Step 1: Generate the palette
      await generatePalette(inputFile, paletteFile);

      // Step 2: Convert MP4 to GIF using the palette
      await convertSingleMp4ToGif(inputFile, outputFile, paletteFile);

      // Step 3: Clean up the palette file
      fs.unlinkSync(paletteFile);
      console.log(`Deleted palette file: ${paletteFile}`);

    } catch (err) {
      console.error(`Failed to convert ${file}`, err);
    }
  }

  console.log('Finished converting the first MP4 files to GIFs');
}

convertToGif();
