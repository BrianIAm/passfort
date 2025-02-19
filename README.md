<div align="center">
  <img src="./app-icon.png" alt="PassFort Logo" width="128" height="128"/>
  <h1>PassFort</h1>
  <p>A secure, encrypted, and offline-first password manager</p>
  <p><strong>Your passwords, your control. No cloud. No compromises.</strong></p>

  ![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Mac%20%7C%20Linux-blue)
  ![License](https://img.shields.io/github/license/BrianTib/passfort)
  ![Version](https://img.shields.io/github/v/release/BrianTib/passfort)
  ![Contributions](https://img.shields.io/badge/contributions-soon-yellow)
</div>

Welcome to PassFort! Below, you'll find everything you need to get started, from installation instructions to security details. Dive in and take control of your passwords today!

## Table of contents
- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Versioning](#versioning)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

## Overview

In today's digital world, managing passwords securely is a challenge. Many password managers rely on cloud storage, which can expose your data to risks. PassFort is a free and open-source desktop application designed to solve this problem. Using AES-256 encryption and running completely offline, PassFort ensures your credentials remain private, secure, and local. Take control of your passwords without compromising your privacy.

## Features

- 🔒 **Secure Storage**: AES-256 encryption for all stored passwords.
- 🔑 **Master Password**: Single master password to access and secure all your credentials.
- 🌐 **Cross-Platform**: Available for Windows, macOS, and Linux.
- 🛠️ **Password Generator**: Built-in secure password generation.
- 💾 **Nearly Infinite Password Storage**: Store as many passwords as your system allows.

## Installation

### Quick Start
1. Download the latest release for your OS from the [official releases](https://github.com/BrianTib/passfort/releases) page.
2. Install and launch PassFort.
3. Set up your master password and start managing your passwords securely!

### Minimum System Requirements

- Windows 10/11, MacOS 10.15+, or Linux
- 200MB free disk space
- 2GB RAM minimum

### Building a development environment

If you're directly pulling from the repository to either contribute or build the project locally, follow these steps:

*(P.S. These steps assume that you've already pulled the repo and that you have Rust and pnpm installed)*

1. Build the necessary icons:
  ```bash
  cargo tauri icon
  ```

2. Install front-end dependencies with pnpm:
  ```bash
  pnpm install
  ```

3. Run the application in development mode:
  ```bash
  cargo tauri dev
  ```

## Security

PassFort is built with your security in mind. Here's how we protect your data:

### Encryption
- All passwords are encrypted using [AES-256](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard), the industry standard for secure encryption.

### Master Password Protection
- Your master password is never saved to disk. Instead, a verification file is created using salts to validate your password without storing it.

### Offline-First
- No cloud storage or network connectivity is required. Your data stays local and private.

### Regular Audits
- PassFort undergoes regular security audits by our community members to ensure ongoing protection.

**⚠️ Important:** Your master password cannot be recovered if lost. Please store it securely.

## Contributing

We welcome contributions after the 1000.0.0 release! Whether you're a developer, designer, or security enthusiast, there are many ways to get involved:

- 🛠️ **Code Contributions**: Help us improve the core functionality.
- 🧪 **Testing**: Report bugs or help us test new features.
- 📖 **Documentation**: Improve our guides and documentation.

Please read our [Contributing Guidelines](./.github/CONTRIBUTING.md) to get started.

## License

PassFort is licensed under the GNU General Public License v3.0 - see the [LICENSE](./LICENSE) file for details.

## Support

Love PassFort? Here's how you can support the project:

- 🐛 [Report Issues](https://github.com/BrianTib/passfort/issues)
- 💡 [Request Features](https://github.com/BrianTib/passfort/issues)
- 💖 [Become a Sponsor](https://github.com/sponsors/BrianTib)
- 📧 [Reach out via Email](mailto:bptiburcio@gmail.com)

Thank you to all our sponsors and contributors for making PassFort possible!

## Versioning

PassFort uses [Epoch Semantic Versioning](https://antfu.me/posts/epoch-semver) proposed by Antfu. Here's a quick overview:

- **EPOCH**: Significant or groundbreaking changes.
- **MAJOR**: Minor incompatible API changes.
- **MINOR**: Backwards-compatible functionality.
- **PATCH**: Backwards-compatible bug fixes.

For a detailed explanation, check out the [full documentation](https://antfu.me/posts/epoch-semver).

---

Made with ❤️ by [Brian T.](https://github.com/BrianTib) and (soon) contributors.

⭐ **Star this repo** to show your support and stay updated on new releases!
