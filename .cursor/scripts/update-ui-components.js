const fs = require('fs');
const path = require('path');

// Function to get the UI components from the components/ui directory
function getUIComponents() {
  const uiComponentsDir = path.join(process.cwd(), 'src', 'components', 'ui');
  
  if (!fs.existsSync(uiComponentsDir)) {
    console.error('UI components directory not found:', uiComponentsDir);
    return null;
  }
  
  const files = fs.readdirSync(uiComponentsDir);
  
  // Filter for TypeScript files and remove the .tsx extension
  const components = files
    .filter(file => file.endsWith('.tsx'))
    .map(file => file.replace('.tsx', ''))
    .sort();
  
  return components;
}

// Function to update the UI components in the rule file
function updateUIComponents() {
  const rulePath = path.join(__dirname, '..', 'rules', 'coding-rule.mdc');
  
  if (!fs.existsSync(rulePath)) {
    console.error('Rule file not found:', rulePath);
    return;
  }
  
  const components = getUIComponents();
  if (!components) return;
  
  let content = fs.readFileSync(rulePath, 'utf8');
  
  // Generate the components list
  const componentsList = `- Located in \`src/components/ui/\`
- Components include: ${components.join(', ')}
- Always use these components instead of creating new ones for the same purpose`;
  
  // Replace the UI components section
  const componentsRegex = /(### Radix UI Components\n\nThe project uses Radix UI primitives wrapped in custom components:\n\n)([\s\S]*?)(\n\n### Form Handling)/;
  content = content.replace(componentsRegex, `$1${componentsList}$3`);
  
  // Write the updated content back to the file
  fs.writeFileSync(rulePath, content);
  
  console.log('UI components updated successfully!');
}

// Export the function for use in other scripts
module.exports = updateUIComponents;

// Run the update if this script is called directly
if (require.main === module) {
  updateUIComponents();
} 