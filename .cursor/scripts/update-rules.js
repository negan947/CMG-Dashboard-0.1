const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Function to get all directories recursively
function getAllDirectories(dirPath, arrayOfDirs = []) {
  const files = fs.readdirSync(dirPath);

  arrayOfDirs.push(dirPath);

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      if (
        !file.startsWith('.') && 
        file !== 'node_modules' &&
        file !== '.next'
      ) {
        getAllDirectories(dirPath + "/" + file, arrayOfDirs);
      }
    }
  });

  return arrayOfDirs;
}

// Function to generate directory tree structure
function generateDirectoryTree(baseDir = 'src', maxDepth = 4) {
  if (!fs.existsSync(baseDir)) {
    console.error(`Base directory '${baseDir}' does not exist.`);
    return baseDir + '/';
  }

  const dirs = getAllDirectories(baseDir)
    .map(dir => dir.replace(/\\/g, '/'))
    .filter(dir => dir !== baseDir)
    .sort();
  
  const tree = { [baseDir]: {} };
  
  dirs.forEach(dir => {
    const parts = dir.split('/');
    if (parts.length > maxDepth + 1) return; // Skip if too deep
    
    let current = tree;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }
  });
  
  // Function to generate tree string
  function generateTreeString(obj, prefix = '', isLast = true, depth = 0) {
    if (!obj) return '';
    
    const keys = Object.keys(obj);
    if (keys.length === 0 || depth >= maxDepth) return '';
    
    let result = '';
    
    keys.forEach((key, index) => {
      const isLastItem = index === keys.length - 1;
      const newPrefix = prefix + (isLast ? '    ' : '│   ');
      
      // Get comment for directory if available
      let comment = '';
      if (key === 'app') comment = ' # Next.js app router pages';
      else if (key === 'auth') comment = ' # Authentication pages';
      else if (key === 'login') comment = ' # Login page';
      else if (key === 'register') comment = ' # Registration page';
      else if (key === 'reset-password') comment = ' # Password reset';
      else if (key === 'update-password') comment = ' # Password update';
      else if (key === 'callback') comment = ' # Auth callback handling';
      else if (key === 'dashboard') comment = ' # Dashboard pages';
      else if (key === 'clients') comment = ' # Client management';
      else if (key === 'invoices') comment = ' # Invoice management';
      else if (key === 'settings') comment = ' # User and agency settings';
      else if (key === 'components') comment = ' # Reusable UI components';
      else if (key === 'ui') comment = ' # UI component library (Radix UI)';
      else if (key === 'lib') comment = ' # Utility functions and shared code';
      else if (key === 'hooks') comment = ' # Custom React hooks';
      else if (key === 'context') comment = ' # React context providers';
      else if (key === 'services') comment = ' # Service layer for API calls';
      else if (key === 'features') comment = ' # Feature-specific code';
      else if (key === 'layouts') comment = ' # Layout components';
      else if (key === 'styles') comment = ' # Global styles';
      else if (key === 'config') comment = ' # Configuration files';
      
      result += `${prefix}${isLastItem ? '└── ' : '├── '}${key}/${comment}\n`;
      result += generateTreeString(obj[key], newPrefix, isLastItem, depth + 1);
    });
    
    return result;
  }
  
  return `${baseDir}/\n${generateTreeString(tree[baseDir], '', true)}`;
}

// Function to update the rule file
function updateRuleFile() {
  // ONLY update the file in the .cursor/rules directory, not in the root
  const rulePath = path.join(__dirname, '..', 'rules', 'coding-rule.mdc');
  
  // Check if the root .cursor.rules file exists and warn about it
  const rootRulePath = path.join(process.cwd(), '.cursor.rules');
  if (fs.existsSync(rootRulePath)) {
    console.warn('Warning: Found .cursor.rules file in the root directory. This file is not used by Cursor.');
    console.warn('The correct file is at: ' + rulePath);
    console.warn('Consider removing the root .cursor.rules file to avoid confusion.');
  }
  
  if (!fs.existsSync(rulePath)) {
    console.error('Rule file not found:', rulePath);
    return;
  }
  
  let content = fs.readFileSync(rulePath, 'utf8');
  
  // Generate the directory tree
  const directoryTree = generateDirectoryTree();
  
  // Replace the file structure section
  const fileStructureRegex = /(### File Structure\n\n```\n)([\s\S]*?)(```)/;
  content = content.replace(fileStructureRegex, `$1${directoryTree}$3`);
  
  // Write the updated content back to the file
  fs.writeFileSync(rulePath, content);
  
  console.log('Rule file updated successfully at:', rulePath);
}

// Export the function for use in other scripts
module.exports = updateRuleFile;

// Run the update if this script is called directly
if (require.main === module) {
  updateRuleFile();
} 