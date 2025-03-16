const fs = require('fs');
const path = require('path');

// Function to get the technology stack from package.json
function getTechStack() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const techStack = [];
  
  // Core technologies
  if (dependencies.react) {
    const version = dependencies.react.replace('^', '').replace('~', '');
    techStack.push(`- React ${version}`);
  }
  
  if (dependencies.next) {
    const version = dependencies.next.replace('^', '').replace('~', '');
    techStack.push(`- Next.js ${version}`);
  }
  
  if (dependencies.typescript) {
    techStack.push(`- TypeScript`);
  }
  
  // Database and authentication
  if (dependencies['@supabase/supabase-js']) {
    techStack.push(`- Supabase for authentication and database`);
  }
  
  // UI and styling
  if (dependencies.tailwindcss) {
    techStack.push(`- Tailwind CSS for styling`);
  }
  
  if (Object.keys(dependencies).some(dep => dep.includes('@radix-ui'))) {
    techStack.push(`- Radix UI for component primitives`);
  }
  
  // Form handling
  if (dependencies['react-hook-form']) {
    techStack.push(`- React Hook Form for form handling`);
  }
  
  // Validation
  if (dependencies.zod) {
    techStack.push(`- Zod for schema validation`);
  }
  
  // State management
  if (dependencies.zustand) {
    techStack.push(`- Zustand for state management`);
  }
  
  if (dependencies['@tanstack/react-query'] || dependencies['react-query']) {
    techStack.push(`- React Query for data fetching`);
  }
  
  // Other notable libraries
  if (dependencies['date-fns']) {
    techStack.push(`- date-fns for date manipulation`);
  }
  
  if (dependencies.sonner) {
    techStack.push(`- Sonner for toast notifications`);
  }
  
  return techStack.join('\n');
}

// Function to update the technology stack in the rule file
function updateTechStack() {
  const rulePath = path.join(__dirname, '..', 'rules', 'coding-rule.mdc');
  
  if (!fs.existsSync(rulePath)) {
    console.error('Rule file not found:', rulePath);
    return;
  }
  
  let content = fs.readFileSync(rulePath, 'utf8');
  
  // Generate the technology stack
  const techStack = getTechStack();
  
  // Replace the technology stack section
  const techStackRegex = /(## Technology Stack\n\n)([\s\S]*?)(\n\n## Code Style and Structure)/;
  content = content.replace(techStackRegex, `$1${techStack}$3`);
  
  // Write the updated content back to the file
  fs.writeFileSync(rulePath, content);
  
  console.log('Technology stack updated successfully!');
}

// Export the function for use in other scripts
module.exports = updateTechStack;

// Run the update if this script is called directly
if (require.main === module) {
  updateTechStack();
} 