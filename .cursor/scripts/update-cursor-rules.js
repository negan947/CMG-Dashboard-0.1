const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Import the update functions
const updateRuleFile = require('./update-rules');
const updateTechStack = require('./update-tech-stack');
const updateUIComponents = require('./update-ui-components');
const cleanupRules = require('./cleanup-rules');

console.log('Updating Cursor Rules...');

// Ensure the rules directory exists
const rulesDir = path.join(__dirname, '..', 'rules');
if (!fs.existsSync(rulesDir)) {
  fs.mkdirSync(rulesDir, { recursive: true });
  console.log('Created rules directory:', rulesDir);
}

// First, clean up any misplaced rules files
console.log('Cleaning up rules files...');
cleanupRules();

// Run the update scripts
try {
  console.log('Updating project structure...');
  updateRuleFile();
  
  console.log('Updating technology stack...');
  updateTechStack();
  
  console.log('Updating UI components...');
  updateUIComponents();
  
  console.log('All updates completed successfully!');
} catch (error) {
  console.error('Error updating rules:', error);
}

// Add a git hook to automatically update rules on commit (optional)
const addGitHook = () => {
  const hooksDir = path.join(process.cwd(), '.git', 'hooks');
  if (!fs.existsSync(hooksDir)) return;
  
  const preCommitPath = path.join(hooksDir, 'pre-commit');
  const hookContent = `#!/bin/sh
# Auto-update Cursor rules before commit
node ${path.join(process.cwd(), '.cursor', 'scripts', 'update-cursor-rules.js')}
git add ${path.join(process.cwd(), '.cursor', 'rules', 'coding-rule.mdc')}
`;

  fs.writeFileSync(preCommitPath, hookContent);
  fs.chmodSync(preCommitPath, '755');
  console.log('Added pre-commit hook to automatically update rules');
};

// Uncomment to add git hook
// addGitHook(); 