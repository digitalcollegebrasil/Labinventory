const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const outputFile = path.join(rootDir, 'project_context.json');

const ignoreDirs = ['node_modules', '.git', 'dist', 'build', '.gemini'];
const ignoreFiles = ['package-lock.json', 'labmanager.sqlite', 'project_context.json', 'generate_project_json.js'];
const allowedExtensions = ['.ts', '.tsx', '.js', '.jsx', '.css', '.html', '.json', '.md'];

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (!ignoreDirs.includes(file)) {
                arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
            }
        } else {
            if (!ignoreFiles.includes(file) && allowedExtensions.includes(path.extname(file))) {
                arrayOfFiles.push(fullPath);
            }
        }
    });

    return arrayOfFiles;
}

try {
    const allFiles = getAllFiles(rootDir);
    const projectData = {};

    allFiles.forEach(file => {
        const relativePath = path.relative(rootDir, file);
        // Normalize path separators to forward slashes
        const normalizedPath = relativePath.split(path.sep).join('/');
        const content = fs.readFileSync(file, 'utf8');
        projectData[normalizedPath] = content;
    });

    fs.writeFileSync(outputFile, JSON.stringify(projectData, null, 2));
    console.log(`Project JSON generated at: ${outputFile}`);
} catch (error) {
    console.error('Error generating project JSON:', error);
}
