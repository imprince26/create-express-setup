#!/usr/bin/env node

import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'path';

interface SetupAnswers {
  projectName: string;
  language: 'TypeScript' | 'JavaScript';
  moduleSystem: 'ESM' | 'CommonJS';
  useSrcDirectory: boolean;
  useEslint: boolean;
  usePrettier: boolean;
  createGitignore: boolean;
}

const folders = [
  'models',
  'routes',
  'middleware',
  'controllers',
  'config',
  'utils',
  'services',
  'types',
];

async function main() {
  console.log(chalk.bold.cyan('\nExpress Project Setup CLI\n'));

  const answers = await inquirer.prompt<SetupAnswers>([
    {
      type: 'input',
      name: 'projectName',
      message: 'Project name:',
      default: '.',
      validate: (input: string) => {
        if (input.trim().length === 0) {
          return 'Project name cannot be empty';
        }
        return true;
      },
    },
    {
      type: 'list',
      name: 'language',
      message: 'Select language:',
      choices: ['TypeScript', 'JavaScript'],
      default: 'TypeScript',
    },
    {
      type: 'list',
      name: 'moduleSystem',
      message: 'Select module system:',
      choices: ['ESM', 'CommonJS'],
      default: 'ESM',
    },
    {
      type: 'confirm',
      name: 'useSrcDirectory',
      message: 'Use src directory?',
      default: true,
    },
    {
      type: 'confirm',
      name: 'useEslint',
      message: 'Setup ESLint?',
      default: true,
    },
    {
      type: 'confirm',
      name: 'usePrettier',
      message: 'Setup Prettier?',
      default: true,
    },
    {
      type: 'confirm',
      name: 'createGitignore',
      message: 'Create .gitignore file?',
      default: true,
    },
  ]);

  await setupProject(answers);
}

async function setupProject(answers: SetupAnswers) {
  const isCurrentDir = answers.projectName === '.';
  const projectPath = isCurrentDir ? process.cwd() : path.join(process.cwd(), answers.projectName);

  // Create project directory
  if (!isCurrentDir) {
    const spinner = ora('Creating project directory...').start();
    try {
      await fs.ensureDir(projectPath);
      spinner.succeed(chalk.green('Project directory created'));
    } catch (error) {
      spinner.fail(chalk.red('Failed to create project directory'));
      throw error;
    }
  }

  // Create folder structure
  const baseDir = answers.useSrcDirectory ? path.join(projectPath, 'src') : projectPath;
  const structureSpinner = ora('Creating folder structure...').start();

  try {
    await fs.ensureDir(baseDir);
    for (const folder of folders) {
      await fs.ensureDir(path.join(baseDir, folder));
    }
    structureSpinner.succeed(chalk.green('Folder structure created'));
  } catch (error) {
    structureSpinner.fail(chalk.red('Failed to create folder structure'));
    throw error;
  }

  // Create package.json
  await createPackageJson(projectPath, answers);

  // Create tsconfig.json
  if (answers.language === 'TypeScript') {
    await createTsConfig(projectPath, answers);
  }

  // Create .env file
  await createEnvFile(projectPath);

  // Create .gitignore
  if (answers.createGitignore) {
    await createGitignore(projectPath);
  }

  // Create index file
  await createIndexFile(baseDir, answers);

  // Create ESLint and Prettier configs
  if (answers.useEslint) {
    await createEslintConfig(projectPath, answers);
  }
  if (answers.usePrettier) {
    await createPrettierConfig(projectPath);
  }

  // Install dependencies
  await installDependencies(projectPath, answers);

  console.log(chalk.bold.green('\n✅ Project setup complete!\n'));
  console.log(chalk.cyan('Next steps:'));
  if (!isCurrentDir) {
    console.log(chalk.white(`  cd ${answers.projectName}`));
  }
  console.log(chalk.white('  npm run dev\n'));
}

async function createPackageJson(projectPath: string, answers: SetupAnswers) {
  const spinner = ora('Creating package.json...').start();

  const isTypeScript = answers.language === 'TypeScript';
  const isESM = answers.moduleSystem === 'ESM';
  const srcDir = answers.useSrcDirectory ? 'src/' : '';
  const ext = isTypeScript ? 'ts' : 'js';
  const outExt = 'js';

  const scripts: Record<string, string> = {};

  // Dev script - handle different module systems
  if (isTypeScript) {
    if (isESM) {
      // TypeScript + ESM: use tsx for better ESM support
      scripts.dev = `tsx watch ${srcDir}index.${ext}`;
    } else {
      // TypeScript + CommonJS: standard ts-node-dev
      scripts.dev = `ts-node-dev --respawn --transpile-only ${srcDir}index.${ext}`;
    }
  } else {
    // JavaScript: use nodemon
    scripts.dev = `nodemon ${srcDir}index.${ext}`;
  }

  // Start script
  if (isESM) {
    scripts.start = `node dist/index.${outExt}`;
  } else {
    scripts.start = `node dist/index.${outExt}`;
  }

  if (isTypeScript) {
    scripts.build = 'tsc';
  }

  if (answers.useEslint) {
    scripts.lint = 'eslint .';
    scripts['lint:fix'] = 'eslint . --fix';
  }

  if (answers.usePrettier) {
    scripts.format = 'prettier --write "**/*.{ts,js,json,md}"';
  }

  const dependencies = {
    express: '^4.21.1',
    dotenv: '^16.4.5',
    cors: '^2.8.5',
  };

  const devDependencies: Record<string, string> = {
    '@types/node': '^22.9.0',
  };

  if (isTypeScript) {
    devDependencies['@types/express'] = '^5.0.0';
    devDependencies['@types/cors'] = '^2.8.17';
    devDependencies['typescript'] = '^5.7.2';

    // Use tsx for ESM, ts-node-dev for CommonJS
    if (isESM) {
      devDependencies['tsx'] = '^4.19.2';
    } else {
      devDependencies['ts-node-dev'] = '^2.0.0';
    }
  } else {
    devDependencies['nodemon'] = '^3.1.7';
  }

  if (answers.useEslint) {
    devDependencies['eslint'] = '^9.15.0';
    devDependencies['@eslint/js'] = '^9.15.0';
    if (isTypeScript) {
      devDependencies['typescript-eslint'] = '^8.15.0';
    }
    if (answers.usePrettier) {
      devDependencies['eslint-config-prettier'] = '^9.1.0';
    }
  }

  if (answers.usePrettier) {
    devDependencies['prettier'] = '^3.3.3';
  }

  const packageJson = {
    name: answers.projectName === '.' ? path.basename(projectPath) : answers.projectName,
    version: '1.0.0',
    description: 'Express application',
    main: isESM ? undefined : `dist/index.${outExt}`,
    type: isESM ? 'module' : 'commonjs',
    scripts,
    keywords: [],
    author: '',
    license: 'ISC',
    dependencies,
    devDependencies,
  };

  // Remove undefined values
  Object.keys(packageJson.scripts).forEach((key) => {
    if (packageJson.scripts[key as keyof typeof packageJson.scripts] === undefined) {
      delete packageJson.scripts[key as keyof typeof packageJson.scripts];
    }
  });

  await fs.writeJSON(path.join(projectPath, 'package.json'), packageJson, { spaces: 2 });
  spinner.succeed(chalk.green('package.json created'));
}

async function createTsConfig(projectPath: string, answers: SetupAnswers) {
  const spinner = ora('Creating tsconfig.json...').start();

  const isESM = answers.moduleSystem === 'ESM';
  const rootDir = answers.useSrcDirectory ? 'src' : '.';

  const tsConfig = {
    compilerOptions: {
      target: 'ES2022',
      module: isESM ? 'ES2022' : 'commonjs',
      lib: ['ES2022'],
      outDir: 'dist',
      rootDir: rootDir,
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      resolveJsonModule: true,
      moduleResolution: isESM ? 'bundler' : 'node',
      declaration: true,
      declarationMap: true,
      sourceMap: true,
      types: ['node'],
    },
    include: [answers.useSrcDirectory ? 'src/**/*' : '**/*'],
    exclude: ['node_modules', 'dist'],
  };

  await fs.writeJSON(path.join(projectPath, 'tsconfig.json'), tsConfig, { spaces: 2 });
  spinner.succeed(chalk.green('tsconfig.json created'));
}

async function createEnvFile(projectPath: string) {
  const spinner = ora('Creating .env file...').start();

  const envContent = `# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=myapp
# DB_USER=postgres
# DB_PASSWORD=password

# JWT Secret
# JWT_SECRET=your-secret-key
# JWT_EXPIRES_IN=7d

# API Keys
# API_KEY=your-api-key
`;

  await fs.writeFile(path.join(projectPath, '.env'), envContent);
  spinner.succeed(chalk.green('.env file created'));
}

async function createGitignore(projectPath: string) {
  const spinner = ora('Creating .gitignore...').start();

  const gitignoreContent = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Build output
dist/
build/
*.tsbuildinfo

# Environment variables
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Logs
logs/
*.log

# Testing
coverage/
.nyc_output/

# Misc
.cache/
.temp/
.tmp/
`;

  await fs.writeFile(path.join(projectPath, '.gitignore'), gitignoreContent);
  spinner.succeed(chalk.green('.gitignore created'));
}

async function createIndexFile(baseDir: string, answers: SetupAnswers) {
  const spinner = ora('Creating index file...').start();

  const isTypeScript = answers.language === 'TypeScript';
  const isESM = answers.moduleSystem === 'ESM';
  const ext = isTypeScript ? 'ts' : 'js';

  let indexContent = '';

  if (isESM) {
    indexContent = `import express${isTypeScript ? ', { Request, Response }' : ''} from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req${isTypeScript ? ': Request' : ''}, res${isTypeScript ? ': Response' : ''}) => {
  res.json({ 
    message: 'Welcome to Express API',
    status: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req${isTypeScript ? ': Request' : ''}, res${isTypeScript ? ': Response' : ''}) => {
  res.json({ status: 'OK', uptime: process.uptime() });
});

// Start server
app.listen(PORT, () => {
  console.log(\`Server is running on http://localhost:\${PORT}\`);
  console.log(\`Environment: \${process.env.NODE_ENV || 'development'}\`);
});

export default app;
`;
  } else {
    indexContent = `const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Express API',
    status: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', uptime: process.uptime() });
});

// Start server
app.listen(PORT, () => {
  console.log(\`Server is running on http://localhost:\${PORT}\`);
  console.log(\`Environment: \${process.env.NODE_ENV || 'development'}\`);
});

module.exports = app;
`;
  }

  await fs.writeFile(path.join(baseDir, `index.${ext}`), indexContent);
  spinner.succeed(chalk.green('index file created'));
}

async function createEslintConfig(projectPath: string, answers: SetupAnswers) {
  const spinner = ora('Creating ESLint configuration...').start();

  const isTypeScript = answers.language === 'TypeScript';
  const isESM = answers.moduleSystem === 'ESM';

  let eslintConfig = '';

  if (isTypeScript) {
    eslintConfig = `import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  prettier,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    ignores: ['dist/', 'node_modules/', '*.config.js'],
  }
);
`;
  } else {
    eslintConfig = `import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';

export default [
  eslint.configs.recommended,
  prettier,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: '${isESM ? 'module' : 'script'}',
      globals: {
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    ignores: ['dist/', 'node_modules/', '*.config.js'],
  },
];
`;
  }

  await fs.writeFile(path.join(projectPath, 'eslint.config.js'), eslintConfig);
  spinner.succeed(chalk.green('ESLint configuration created'));
}

async function createPrettierConfig(projectPath: string) {
  const spinner = ora('Creating Prettier configuration...').start();

  const prettierConfig = {
    semi: true,
    trailingComma: 'es5',
    singleQuote: true,
    printWidth: 100,
    tabWidth: 2,
    useTabs: false,
    arrowParens: 'always',
    endOfLine: 'lf',
  };

  await fs.writeJSON(path.join(projectPath, '.prettierrc'), prettierConfig, { spaces: 2 });

  const prettierIgnore = `node_modules/
dist/
build/
coverage/
*.min.js
package-lock.json
yarn.lock
pnpm-lock.yaml
`;

  await fs.writeFile(path.join(projectPath, '.prettierignore'), prettierIgnore);
  spinner.succeed(chalk.green('Prettier configuration created'));
}

async function installDependencies(projectPath: string, answers: SetupAnswers) {
  const spinner = ora('Installing dependencies (this may take a minute)...').start();

  try {
    const isCurrentDir = answers.projectName === '.';
    const projectName = isCurrentDir ? path.basename(projectPath) : answers.projectName;

    spinner.text = `Installing dependencies in ${projectName}...`;

    await execa('npm', ['install'], {
      cwd: projectPath,
      stdio: 'inherit',
    });

    spinner.succeed(chalk.green('Dependencies installed successfully'));
  } catch (error: any) {
    spinner.fail(chalk.red('Failed to install dependencies'));
    console.log(chalk.yellow('\nPlease run manually:'));
    if (answers.projectName !== '.') {
      console.log(chalk.white(`  cd ${answers.projectName}`));
    }
    console.log(chalk.white('  npm install\n'));
    console.log(chalk.gray(`Error: ${error.message}`));
  }
}

export default main;
