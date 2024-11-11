import { exec } from 'child_process';
import path from 'path';

// Resolve paths to ensure compatibility with Windows
const ffmpegPath = path.resolve('lib', 'ffmpeg', 'bin', 'ffmpeg.exe');
const inputFile = path.resolve('data', 'clip-2_0000.mp4');
const outputFile = path.resolve('video-output', 'thumbnail.mp4');

// Doubled crop parameters for full-sized video
// const cropParams = '244:192:360:80';  // width:height:x:y

const x = 180,
y = 20,
w = 122,
h = 116;

// double
const cropParams = `${w*2}:${h*2}:${x*2}:${y*2}`;  // width:height:x:y


async function shrinkVideo() {
  return new Promise((resolve, reject) => {
    // Start at 10 seconds, process for 20 seconds, and apply crop
    const command = `"${ffmpegPath}" -an -ss 10 -i "${inputFile}" -vf "crop=${cropParams}" -preset ultrafast "${outputFile}"`;
    // const command = `"${ffmpegPath}" -ss 10 -i "${inputFile}" -t 20 -vf "crop=${cropParams}" -preset ultrafast "${outputFile}"`;

    // exec(command, (error, stdout, stderr) => {
    //   if (error) {
    //     console.error('Error executing ffmpeg:', error);
    //     console.error('FFmpeg stderr:', stderr);
    //     reject(error);
    //     return;
    //   }
    //   console.log('Video processing complete:', stdout);
    //   resolve();
    // });

    console.info("Starting video processing...");
    console.info(command)
    exec(command, (error, stdout, stderr) => {

      // stdout.on('data', (data) => {
      //   console.log(data);
      // })
      // stderr.on('data', (data) => {
      //   console.error(data);
      // })

      if (error) {
        console.error('Error executing ffmpeg:', error);
        console.error('FFmpeg stderr:', stderr);
        reject(error);
        return;
      }
      console.log('Video processing complete:', stdout);
      resolve();
    });
  });
}

shrinkVideo()
  .then(() => console.log('Video successfully cropped and saved.'))
  .catch(err => console.error('Video processing failed:', err));
