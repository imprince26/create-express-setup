# Changelog

All notable changes to this project will be documented in this file.

## [1.0.2] - 2025-10-03

### Changed

- **Module System**: Switched to CommonJS for better compatibility
  - Updated `tsconfig.json` to use `"module": "commonjs"` with `"moduleResolution": "node"`
  - Removed `"type": "module"` from package.json to use CommonJS by default
  - Matches configuration pattern used in create-expo-nativewind
- **Dependencies**: Downgraded to CommonJS-compatible versions for stability
  - chalk: `^5.3.0` → `^4.1.2` (CommonJS compatible)
  - inquirer: `^12.1.0` → `^8.2.6` (CommonJS compatible)
  - ora: `^8.1.1` → `^5.4.1` (CommonJS compatible)
  - execa: `^9.5.2` → `^5.1.1` (CommonJS compatible)
  - Added `validate-npm-package-name` `^5.0.1` for project name validation
- **File Operations**: Enhanced with fs-extra package
  - Uses `fs.readJsonSync()` for reliable JSON file reading
  - Native `__dirname` and `__filename` support in CommonJS (no need for `fileURLToPath`)
- **Build Output**: TypeScript now compiles to clean CommonJS format with `require()` statements
- **Scripts**: Simplified development scripts
  - `setup` script changed from `ts-node --esm` to `ts-node` for CommonJS

### Fixed

- Resolved ESM module compatibility issues
- Fixed import/export syntax to work with CommonJS
- Corrected file path handling for better cross-platform support

### Technical Details

- TypeScript target: ES2020
- Module resolution: node (standard Node.js resolution)
- All source code uses ES6 `import` syntax, compiled to CommonJS `require()` for distribution
- Proper shebang (`#!/usr/bin/env node`) for CLI executability

## [1.0.1] - 2025-10-03

### Changed

- Removed jsconfig.json generation for JavaScript projects
- JavaScript projects now only include essential configuration files
- Simplified JavaScript project setup process

## [1.0.0] - 2025-10-03

### Added

- Interactive CLI for Express project setup
- Support for TypeScript and JavaScript
- ESM and CommonJS module systems
- Professional folder structure (models, routes, controllers, middleware, config, utils, services, types)
- Latest ESLint v9.15.0 with flat config
- Prettier v3.3.3 for code formatting
- Beautiful CLI UI with chalk, inquirer, ora
- Automatic .env file generation
- Optional .gitignore creation
- Project can be created in current directory or new directory
- Hot-reload development with ts-node-dev/nodemon
- Pre-configured Express server with health check endpoint
- Complete TypeScript support with latest v5.7.2
- Express v4.21.1 with CORS support

### Features

- Beautiful terminal UI with colors and spinners
- Automatic dependency installation
- Quick setup with sensible defaults
- Production-ready configuration
- Comprehensive documentation
- Ready-to-use development environment

### Packages Used

- chalk v5.3.0 - Terminal styling
- inquirer v12.1.0 - Interactive prompts
- ora v8.1.1 - Terminal spinners
- execa v9.5.2 - Process execution
- commander v12.1.0 - CLI framework
- fs-extra v11.2.0 - Enhanced file operations

---

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
