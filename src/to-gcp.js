import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

// GCP credentials file
const BUCKET_NAME = `mb-item-images`;
const FOLDER_NAME = `v1`;
const OUTPUT_DIR = `./output-3`;
const ZIP_FILE = `source.zip`;

// Initialize GCP storage with credentials
const storage = new Storage({
  keyFilename: './env/gcp.json',  // Path to GCP credentials
  timeout: 60000,  // Set timeout to 60 seconds
});

async function uploadFileWithRetry(bucket, filePath, destination, retries = 3) {
  let attempt = 0;
  while (attempt < retries) {
    try {
      await bucket.upload(filePath, {
        destination: destination,
        timeout: 60000,  // Increase the timeout to 60 seconds
      });
      console.log(`Uploaded ${filePath} to ${destination}`);
      return; // Successfully uploaded, exit the loop
    } catch (err) {
      attempt++;
      console.error(`Attempt ${attempt} failed: ${err.message}`);
      if (attempt < retries) {
        console.log(`Retrying upload for ${filePath}...`);
        await new Promise(resolve => setTimeout(resolve, 2000));  // Wait 2 seconds before retrying
      } else {
        throw new Error(`Failed to upload ${filePath} after ${retries} attempts`);
      }
    }
  }
}

async function uploadDirectoryToBucket(bucketName, folderName, localDir) {
  const bucket = storage.bucket(bucketName);

  // Recursively upload files to GCP bucket
  async function uploadRecursive(dir, baseDir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stats = fs.lstatSync(fullPath);

      if (stats.isDirectory()) {
        // If it's a directory, recursively upload its contents
        await uploadRecursive(fullPath, baseDir);
      } else {
        // If it's a file, upload it with retry logic
        const relativePath = path.relative(baseDir, fullPath); // Get the relative path (preserve folder structure)
        const destination = path.join(folderName, relativePath).replace(/\\/g, '/'); // GCP destination path
        
        console.log(`Uploading ${relativePath} to GCP bucket as ${destination}`);
        await uploadFileWithRetry(bucket, fullPath, destination);
      }
    }
  }

  // Start uploading the directory
  await uploadRecursive(localDir, localDir);
  console.log(`Finished uploading the contents of ${localDir} to GCP bucket ${bucketName}/${folderName}`);
}

async function zipDirectory(sourceDir, outPath) {
  const output = fs.createWriteStream(outPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  return new Promise((resolve, reject) => {
    output.on('close', () => {
      console.log(`${archive.pointer()} total bytes zipped`);
      resolve();
    });

    archive.on('error', (err) => reject(err));

    archive.pipe(output);

    // Append files from the source directory but do not include the directory itself
    archive.directory(sourceDir, false);

    archive.finalize();
  });
}

async function sendToGCP() {
  try {
    // Step 1: Upload all files in output-3 to GCP bucket without including the directory output-3
    await uploadDirectoryToBucket(BUCKET_NAME, FOLDER_NAME, OUTPUT_DIR);

    // Step 2: Zip the contents of output-3 into source.zip
    await zipDirectory(OUTPUT_DIR, ZIP_FILE);

    // Step 3: Upload the zip file to the GCP bucket
    const bucket = storage.bucket(BUCKET_NAME);
    console.log(`Uploading ${ZIP_FILE} to GCP bucket as ${FOLDER_NAME}/${ZIP_FILE}`);
    await bucket.upload(ZIP_FILE, {
      destination: `${FOLDER_NAME}/${ZIP_FILE}`,
    });

    console.log(`Finished uploading ${ZIP_FILE} to GCP bucket`);
  } catch (error) {
    console.error('Error during GCP upload:', error);
  }
}

sendToGCP();
