<div align="center">
  <img src="./app-icon.png" alt="PassFort Logo" width="128" height="128"/>
  <h1>PassFort</h1>
  <p>A secure, encrypted, and offline-first password manager</p>

![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Mac%20%7C%20Linux-blue)
![License](https://img.shields.io/github/license/BrianTib/passfort)
![Version](https://img.shields.io/github/v/release/BrianTib/passfort)
![Contributions](https://img.shields.io/badge/contributions-soon-yellow)
</div>

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

PassFort is a free and open-source desktop application that helps you securely manage and store passwords. Using AES-256 encryption and running completely offline, PassFort ensures your credentials remain private, secure and local.

## Features

- **Secure Storage**: AES-256 encryption for all stored passwords.
- **Master Password**: Single master password to obfuscate, access and further secure all your credentials.
- **Cross-Platform**: Available for Windows, macOS, and Linux.
- **Password Generator**: Built-in secure password generation.
- **Nearly Infinite Password Storage**: However many passwords can be stored is entirely determined by your system storage.

## Installation

### Minimum System Requirements

- Windows 10/11, MacOS 10.15+, or Linux
- 200MB free disk space
- 2GB RAM minimum

### Download

The easiest way to install PassFort is from our [official releases](https://github.com/BrianTib/passfort/releases) page. Pick the release that best matches your operating system.

### Building a development environment

If you're directly pulling from the repository to either contribute or build the project locally, follow these steps:

*(P.S. These steps assume that you've already pulled the repo and that you have Rust and pnpm installed)*

1. Since all of the icon variations are no longer pushed to GitHub to save resources, use the following command to build all the necessary icons: `cargo tauri icon`

2. Install front-end dependencies with pnpm: `pnpm install`

3. Run the application in development mode: `cargo tauri dev`

## Security

1. All passwords are encrypted using [AES-256](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard)

2. Your master password is never saved to disk by the application. Instead, a verification file is created which contains various salts that are used to determine whether a given password is the initial master password without having to store the password itself.

3. No cloud storage or network connectivity required to access, create or delete any of your stored passwords

4. Regular security audits and updates by our community members

***Your master password cannot be recovered if lost!***

## **Contributing**

Contributions will be welcome after the 1000.0.0 release. Please read our [Contributing Guidelines](./.github/CONTRIBUTING.md) for more information.

## **License**

PassFort is licensed under the GNU General Public License v3.0 - see the [LICENSE](./LICENSE) file for details.

## **Support**

- 🐛 [Report Issues](https://github.com/BrianTib/passfort/issues)
- 💡 [Feature Requests](https://github.com/BrianTib/passfort/issues)

- 📧 [Become a sponsor! (Reach me personally by e-mail)](bptiburcio@gmail.com)

## Versioning

PassFort uses [Epoch Semantic Versioning](https://antfu.me/posts/epoch-semver) proposed by Antfu for handling it's many versions. Briefly put, the format is as follows:

```
{EPOCH * 1000 + MAJOR}.MINOR.PATCH

EPOCH: Increment when you make significant or groundbreaking changes.
MAJOR: Increment when you make minor incompatible API changes.
MINOR: Increment when you add functionality in a backwards-compatible manner.
PATCH: Increment when you make backwards-compatible bug fixes.
```

---

Made with ❤️ by [Brian T.](https://github.com/BrianTib) and (soon) contributors.
