
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const newScope = process.argv[2];

if (!newScope) {
    console.error("❌ Usage: node rename-project.js <your-npm-username>");
    console.error("Example: node rename-project.js vanshcode");
    process.exit(1);
}

const targetScope = `@${newScope}`;
const oldScope = '@agentcontract';

console.log(`\n🔄 Renaming project from ${oldScope} to ${targetScope}...\n`);

function getAllFiles(dirPath, arrayOfFiles) {
    let files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            if (file !== 'node_modules' && file !== 'dist' && file !== '.git') {
                arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
            }
        } else {
            if (file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.json') || file.endsWith('.md')) {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        }
    });

    return arrayOfFiles;
}

const rootDir = path.resolve(__dirname, '..');
const files = getAllFiles(rootDir);

let modifiedCount = 0;

files.forEach(file => {
    // Skip this script itself
    if (file.includes('rename-project.js')) return;
    if (file.includes('package-lock.json')) return; // We will regenerate this

    try {
        let content = fs.readFileSync(file, 'utf8');
        if (content.includes(oldScope)) {
            const newContent = content.split(oldScope).join(targetScope);
            fs.writeFileSync(file, newContent, 'utf8');
            console.log(`✅ Updated: ${path.relative(rootDir, file)}`);
            modifiedCount++;
        }
    } catch (err) {
        console.error(`❌ Error processing ${file}: ${err.message}`);
    }
});

console.log(`\n✨ Renamed scope in ${modifiedCount} files.`);
console.log(`\n📦 Installing dependencies to update lockfiles...`);

try {
    execSync('npm install', { stdio: 'inherit', cwd: rootDir });
    console.log(`\n✅ Done! You can now run: npm publish --workspaces --access public`);
} catch (e) {
    console.error("\n❌ 'npm install' failed. Please run it manually.");
}
