import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

// Resolve paths to ensure compatibility with Windows
const ffmpegPath = path.resolve('lib', 'ffmpeg', 'bin', 'ffmpeg.exe');
const inputFile = path.resolve('video-output', 'thumbnail.mp4');
const outputDir = path.resolve('video-output', 'clips');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Define time intervals in milliseconds
const INIT_GAP = 4600; // Initial delay (in ms)
// const INIT_GAP = 3300; // Initial delay (in ms)
const RECORD_LENGTH = 7000; // Record length (in ms)
// const RECORD_LENGTH = 9000; // Record length (in ms)
const REGULAR_GAP = 8570; // Regular delay between recordings (in ms)
// const REGULAR_GAP = 6570; // Regular delay between recordings (in ms)
// const REGULAR_GAP = 6600; // Regular delay between recordings (in ms)
const MAX = 200; // Number of slices for debugging

// Helper function to convert milliseconds to FFmpeg time format (hh:mm:ss.ms)
function msToTime(ms) {
  const date = new Date(ms);
  const h = String(date.getUTCHours()).padStart(2, '0');
  const m = String(date.getUTCMinutes()).padStart(2, '0');
  const s = String(date.getUTCSeconds()).padStart(2, '0');
  const msFraction = String(date.getUTCMilliseconds()).padStart(3, '0');
  return `${h}:${m}:${s}.${msFraction}`;
}

async function sliceVideo() {
  let currentStart = INIT_GAP; // Start after initial delay

  for (let i = 0; i < MAX; i++) {
    const outputClip = path.resolve(outputDir, `${i}.mp4`);

    // Calculate start time in hh:mm:ss.ms
    const startTime = msToTime(currentStart);

    // Command to slice the video
    const command = `"${ffmpegPath}" -i "${inputFile}" -ss ${startTime} -t ${RECORD_LENGTH / 1000} "${outputClip}"`;

    console.log(`Executing: ${command}`);

    try {
      await new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error slicing video ${i}:`, stderr);
            reject(error);
            return;
          }
          console.log(`Slice ${i} created: ${outputClip}`);
          resolve();
        });
      });

      // Move to the next start time (add the record length and regular gap)
      currentStart += RECORD_LENGTH + REGULAR_GAP;
    } catch (err) {
      console.error('Error occurred during slicing:', err);
      break; // Stop if there's an error
    }
  }
}

sliceVideo()
  .then(() => console.log('Video slicing complete.'))
  .catch(err => console.error('Video slicing failed:', err));
