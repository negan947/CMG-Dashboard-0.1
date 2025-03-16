const fs = require('fs');
const path = require('path');

// Function to remove the .cursor.rules file from the root directory
function cleanupRules() {
  const rootRulePath = path.join(process.cwd(), '.cursor.rules');
  const correctRulePath = path.join(__dirname, '..', 'rules', 'coding-rule.mdc');
  
  if (fs.existsSync(rootRulePath)) {
    console.log('Found .cursor.rules file in the root directory.');
    
    // Check if the correct file exists
    if (!fs.existsSync(correctRulePath)) {
      console.log('The correct file does not exist. Creating it first...');
      
      // Create the directory if it doesn't exist
      const rulesDir = path.join(__dirname, '..', 'rules');
      if (!fs.existsSync(rulesDir)) {
        fs.mkdirSync(rulesDir, { recursive: true });
        console.log('Created rules directory:', rulesDir);
      }
      
      // Copy the content from the root file to the correct location
      const content = fs.readFileSync(rootRulePath, 'utf8');
      
      // Add the frontmatter to the content
      const contentWithFrontmatter = `---
description: 
globs: 
alwaysApply: true
---
${content}`;
      
      fs.writeFileSync(correctRulePath, contentWithFrontmatter);
      console.log('Copied content to the correct location:', correctRulePath);
    }
    
    // Remove the root file
    fs.unlinkSync(rootRulePath);
    console.log('Removed .cursor.rules file from the root directory.');
    
    console.log('Cleanup completed successfully!');
    console.log('The correct rule file is now at:', correctRulePath);
    console.log('You can update it by running: npm run update-rules');
  } else {
    console.log('No .cursor.rules file found in the root directory. Nothing to clean up.');
  }
}

// Run the cleanup if this script is called directly
if (require.main === module) {
  cleanupRules();
}

module.exports = cleanupRules; 