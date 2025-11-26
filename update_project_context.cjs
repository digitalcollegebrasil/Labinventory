const fs = require('fs');
const path = require('path');

const projectContextPath = path.join(__dirname, 'project_context.json');
const filesToUpdate = [
    'services/api.ts',
    'contexts/AuthContext.tsx',
    'components/LoginPage.tsx',
    'components/SignUpPage.tsx',
    'types.ts'
];

try {
    const projectContext = JSON.parse(fs.readFileSync(projectContextPath, 'utf8'));

    filesToUpdate.forEach(filePath => {
        const fullPath = path.join(__dirname, filePath);
        if (fs.existsSync(fullPath)) {
            const content = fs.readFileSync(fullPath, 'utf8');
            projectContext[filePath] = content;
            console.log(`Updated ${filePath}`);
        } else {
            console.warn(`File not found: ${filePath}`);
        }
    });

    fs.writeFileSync(projectContextPath, JSON.stringify(projectContext, null, 2), 'utf8');
    console.log('Successfully updated project_context.json');
} catch (error) {
    console.error('Error updating project_context.json:', error);
}
