import { MSICreator } from 'electron-wix-msi';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Step 1: Instantiate the MSICreator
const msiCreator = new MSICreator({
  appDirectory: path.resolve('dist/win-unpacked/'),
  description: 'OneTick - Point of sale software',
  exe: 'POS',
  name: 'POS',
  manufacturer: 'OneTick Technologies',
  version: '1.0.0',
  outputDirectory: '/outputInstaller',
  appIconPath: path.resolve(__dirname,'assets/images/appIcon.ico'),
});

// Step 2: Create a .wxs template file
const supportBinaries = await msiCreator.create();

// // 🆕 Step 2a: optionally sign support binaries if you
// // sign you binaries as part of of your packaging script
// supportBinaries.forEach(async (binary) => {
//   // Binaries are the new stub executable and optionally
//   // the Squirrel auto updater.
//   await signFile(binary);
// });


const sb = supportBinaries.supportBinaries;

// 🆕 Step 2a: optionally sign support binaries if you
// sign you binaries as part of of your packaging script
sb.forEach(async (binary) => {
    // Binaries are the new stub executable and optionally
    // the Squirrel auto updater.
    await signFile(binary);
  });

// Step 3: Compile the template to a .msi file
await msiCreator.compile();