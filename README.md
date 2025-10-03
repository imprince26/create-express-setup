# create-express-setup

Interactive CLI tool for scaffolding Express.js projects with TypeScript or JavaScript support.

## Features

- Interactive project setup with customizable options
- TypeScript or JavaScript support
- ESM (ECMAScript Modules) or CommonJS module systems
- Professional project structure with organized folders
- Optional ESLint and Prettier configuration
- Environment variables setup with dotenv
- Hot-reload development environment
- Pre-configured build and development scripts

## Installation

Install globally to use the CLI anywhere:

```bash
npm install -g create-express-setup
```

Or use with npx (no installation required):

```bash
npx create-express-setup
```

## Quick Start

Run the CLI and follow the interactive prompts:

```bash
express-setup
```

Or with npx:

```bash
npx create-express-setup
```

## Usage

The CLI will guide you through a series of questions to customize your project:

1. **Project name** - Enter a directory name or use `.` for the current directory
2. **Language** - Choose between TypeScript or JavaScript
3. **Module system** - Select ESM (recommended) or CommonJS
4. **Source directory** - Option to organize code in a `src/` folder
5. **ESLint** - Optional code linting with ESLint v9
6. **Prettier** - Optional code formatting with Prettier
7. **Git ignore** - Automatic `.gitignore` file generation

### Example

```bash
$ express-setup

? Project name: my-api
? Select language: TypeScript
? Select module system: ESM
? Use src directory? Yes
? Setup ESLint? Yes
? Setup Prettier? Yes
? Create .gitignore file? Yes

✓ Project setup complete!

Next steps:
  cd my-api
  npm run dev
```

## CLI Options

### Version

Display the current version:

```bash
express-setup --version
# or
express-setup -v
```

### Help

Show help information:

```bash
express-setup --help
```

## Available Scripts

After generating your project, the following npm scripts will be available:

### Development

```bash
npm run dev
```

Starts the development server with hot-reload enabled. The server will automatically restart when you make changes to your code.

### Build (TypeScript projects only)

```bash
npm run build
```

Compiles TypeScript to JavaScript in the `dist/` directory.

### Production

```bash
npm start
```

Starts the production server using the compiled code from the `dist/` directory.

### Linting (if ESLint selected)

```bash
npm run lint        # Check for linting errors
npm run lint:fix    # Automatically fix linting errors
```

### Formatting (if Prettier selected)

```bash
npm run format
```

Formats all code files according to Prettier configuration.

## Project Configuration

### TypeScript Configuration

TypeScript projects include a `tsconfig.json` with recommended settings:

- Strict mode enabled
- ES2022 target and module support
- Source maps for debugging
- Declaration files generation

### ESLint Configuration

ESLint is configured with the latest v9 flat config format, including:

- Recommended ESLint rules
- TypeScript ESLint for TypeScript projects
- Prettier integration to avoid conflicts

### Environment Variables

A `.env` file is automatically created with common configuration:

```env
PORT=3000
NODE_ENV=development
```

Add your custom environment variables as needed.

## Dependencies

### Core Dependencies

- **express** (^4.21.1) - Web framework
- **dotenv** (^16.4.5) - Environment variable management
- **cors** (^2.8.5) - CORS middleware

### TypeScript Development Dependencies

- **typescript** (^5.7.2)
- **tsx** (^4.19.2) - TypeScript execution for ESM
- **ts-node-dev** (^2.0.0) - TypeScript execution for CommonJS
- **@types/express**, **@types/cors**, **@types/node**

### JavaScript Development Dependencies

- **nodemon** (^3.1.7) - Auto-restart on file changes

### Optional Development Dependencies

- **eslint** (^9.15.0) - Code linting
- **prettier** (^3.3.3) - Code formatting
- **typescript-eslint** (^8.15.0) - TypeScript ESLint rules
- **eslint-config-prettier** (^9.1.0) - ESLint-Prettier integration

## Requirements

- Node.js >= 18.0.0
- npm, yarn, or pnpm

## Folder Structure

The generated project creates the following folder structure inside the `src/` directory (if enabled):

- `config/` - Application configuration files
- `controllers/` - Request handlers and business logic
- `middleware/` - Custom Express middleware
- `models/` - Data models and schemas
- `routes/` - API route definitions
- `services/` - Business logic layer
- `types/` - TypeScript type definitions (TypeScript only)
- `utils/` - Utility functions and helpers

## Use Cases

### Quick Prototyping

Create a new Express API in seconds:

```bash
npx create-express-setup
```

### TypeScript Microservices

Generate a TypeScript-based microservice with full type safety:

```bash
npx create-express-setup
# Choose: TypeScript, ESM, src directory, ESLint, Prettier
```

### JavaScript REST API

Set up a lightweight JavaScript API:

```bash
npx create-express-setup
# Choose: JavaScript, CommonJS, no src directory
```

### Team Projects

Ensure consistent project structure across your team:

```bash
npx create-express-setup
# All team members use the same setup
```

## Troubleshooting

### Module Resolution Errors

If you encounter module resolution errors with TypeScript ESM projects, ensure your imports include the `.js` extension:

```typescript
import router from './routes/users.js'; // Correct
import router from './routes/users'; // May cause errors
```

### Hot Reload Not Working

For ESM TypeScript projects, the CLI uses `tsx` which provides better ESM support. If hot-reload isn't working:

1. Check that your `package.json` has `"type": "module"`
2. Verify your `tsconfig.json` has `"module": "ES2022"`
3. Ensure all imports use the `.js` extension

### npm install Fails

If dependency installation fails during setup, you can manually install:

```bash
cd your-project-name
npm install
```

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.
