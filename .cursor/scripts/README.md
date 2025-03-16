# Cursor Rules Automation Scripts

This directory contains scripts to automatically update the Cursor rules file with the latest project structure, technology stack, and UI components.

## Available Scripts

- `update-cursor-rules.js`: Main script that runs all the update scripts
- `update-rules.js`: Updates the project structure in the rule file
- `update-tech-stack.js`: Updates the technology stack based on package.json
- `update-ui-components.js`: Updates the UI components list based on the files in src/components/ui

## How to Use

### Manual Update

To manually update the Cursor rules, run:

```bash
node .cursor/scripts/update-cursor-rules.js
```

Or use the npm script:

```bash
npm run update-rules
```

### Automatic Update

To automatically update the rules on every commit, uncomment the `addGitHook()` function call in `update-cursor-rules.js`. This will add a pre-commit hook that updates the rules before each commit.

## Script Details

### update-rules.js

This script scans the project directory structure and updates the "Current File Structure" section in the rule file. It:

1. Recursively gets all directories in the project
2. Generates a tree structure with appropriate comments
3. Updates the rule file with the new structure

### update-tech-stack.js

This script reads the package.json file and updates the "Technology Stack" section in the rule file. It:

1. Extracts dependencies and devDependencies from package.json
2. Identifies key technologies being used
3. Updates the rule file with the current technology stack

### update-ui-components.js

This script scans the UI components directory and updates the "Radix UI Components" section in the rule file. It:

1. Reads all .tsx files in the src/components/ui directory
2. Generates a list of available components
3. Updates the rule file with the current components list

### update-cursor-rules.js

This is the main script that runs all the update scripts in sequence. It also provides functionality to add a git hook for automatic updates.
