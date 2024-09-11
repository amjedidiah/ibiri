# Ibiri: Unlocking African Financial Potential

Ibiri is an innovative fintech application designed to revolutionize financial inclusion in Africa. Our mission is to empower millions of Africans by providing accessible credit, promoting financial literacy, and bridging the gap between informal and formal financial sectors across the continent.

## Table of Contents

- [Project Overview](#project-overview)
- [Planned Key Features](#planned-key-features)
- [Technology Stack](#technology-stack)
- [Quick Start](#quick-start)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Configuration](#configuration)
- [Project Structure](#project-structure)
- [Development](#development)
- [Architecture](#architecture)
<!-- - [Testing](#testing) -->
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Security](#security)
<!-- - [Contributing](#contributing) -->
- [Roadmap](#roadmap)
- [Changelog](#changelog)
- [License](#license)
- [Acknowledgments](#acknowledgments)
- [Contact](#contact)

## Project Overview

Ibiri addresses the critical need for financial inclusion in Africa. According to the World Bank, as of 2021, about 50% of adults in Sub-Saharan Africa remain unbanked. Ibiri aims to bridge this gap by offering:

- A proprietary AI-driven credit scoring system
- Offline transaction capabilities
- A multi-functional digital wallet
- A marketplace for financial services
- An inclusive, multi-lingual user interface
- Financial education modules
- Goal setting and tracking features
- Blockchain-based security

Our solution provides millions of unbanked and under-banked Africans with access to formal financial services, stimulates local economies, and fosters economic growth across the continent.

## Planned Key Features

- [ ] Dynamic Credit Scoring
- [ ] Offline Transactions
- [ ] Digital Wallet
- [ ] Financial Service Marketplace
- [ ] Inclusive User Interface
- [ ] Financial Education
- [ ] Goal Setting and Tracking
- [ ] Blockchain Security

## Technology Stack

This Nx monorepo project will use the following technologies:

- [ ] **Monorepo Management**: Nx
- [ ] **Frontend (Web)**: Next.js
- [ ] **Mobile**: React Native
- [ ] **Backend**: Node.js
- [ ] **Database**: MongoDB
- [ ] **API**: RESTful API and GraphQL
- [ ] **Authentication**: JWT
- [ ] **Payment Integration**: Paystack
- [ ] **Offline Capabilities**: PWA, Local Storage
- [ ] **AI/ML**: TensorFlow.js
- [ ] **Blockchain**: Ethereum (Smart Contracts)

## Quick Start

For experienced developers, here's how to get Ibiri running quickly:

```bash
git clone https://github.com/amjedidiah/ibiri.git
cd ibiri
yarn install
cp .env.example .env
# Edit .env with your configuration
nx serve web
nx run mobile:start
nx serve api
```

## Getting Started

### Prerequisites

- Node.js (v14.0.0 or later)
- yarn (v1.0.0 or later)
- MongoDB (v4.0 or later)
- Nx CLI (`npm install -g nx`)
- React Native development environment set up

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/amjedidiah/ibiri.git
   cd ibiri
   ```

2. Install dependencies:

   ```bash
   yarn install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   ```

   Edit the `.env` file with your configuration details.

## Configuration

Ibiri uses environment variables for configuration. Key variables will include:

- `DATABASE_URL`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT authentication
- `PAYSTACK_API_KEY`: API key for Paystack integration
<!-- - `MPESA_API_KEY`: API key for M-Pesa integration -->

Refer to `.env.example` for a complete list of required environment variables.

## Project Structure

The Nx monorepo structure for Ibiri will be organized as follows:

```bash
ibiri/
│
├── apps/
│   ├── web/                  # Next.js web application
│   ├── mobile/               # React Native mobile app
│   └── api/                  # Node.js backend API
│
├── libs/
│   ├── shared/               # Shared utilities and components
│   ├── credit-scoring/       # Credit scoring module
│   ├── offline-transactions/ # Offline transaction handling
│   └── blockchain/           # Blockchain integration
│
├── tools/                    # Scripts and tools for development
├── CHANGELOG.md              # Changelog
├── LICENSE                   # License
├── nx.json                   # Nx configuration
├── workspace.json            # Nx workspace configuration
├── package.json              # Root package.json
└── README.md                 # This file
```

## Development

To start the development servers:

1. For the web application:

   ```bash
   nx serve web
   ```

2. For the mobile application:

   ```bash
   nx run mobile:start
   ```

3. For the backend API:

   ```bash
   nx serve api
   ```

To generate a new library or application:

```bash
nx g @nrwl/react:lib my-lib
nx g @nrwl/next:app my-app
```

We use ESLint for code linting and Prettier for code formatting. Run linting with:

```bash
nx lint
```

And format code with:

```bash
nx format:write
```

## Architecture

Ibiri will follow a microservices architecture:

1. Web and Mobile frontends communicate with the backend API.
2. The API server handles requests and communicates with various microservices.
3. Microservices will include: Credit Scoring, Offline Transactions, and Blockchain Integration.
4. All services will share a common database but have separate schemas.

[Include a system architecture diagram here]

<!-- ## Testing

We use Jest for unit and integration testing. Run tests with:

```bash
nx run-many --target=test --all
```

For a specific project:

```bash
nx test web
nx test mobile
nx test api
```

When writing new features, please include relevant unit tests. We aim for at least 80% code coverage. -->

## Deployment

Deployment commands for each application:

1. Deploy the web application:

   ```bash
   nx deploy web
   ```

2. Deploy the mobile application:

   ```bash
   nx deploy mobile
   ```

3. Deploy the backend API:

   ```bash
   nx deploy api
   ```

<!-- We use GitHub Actions for CI/CD. Refer to `.github/workflows` for our pipeline configuration. -->

## Troubleshooting

Common issues and solutions:

1. **Issue**: Unable to connect to MongoDB
   **Solution**: Ensure MongoDB is running and the `DATABASE_URL` in `.env` is correct.

2. **Issue**: Mobile app not connecting to API
   **Solution**: Check that the API URL in the mobile app configuration matches your local or deployed API.

<!-- For more issues, please or open an issue on GitHub. -->

## Security

We take security seriously. If you discover a security vulnerability, please send an e-mail to <ddboy@gmail.com>.

<!-- ## Contributing

We welcome contributions to Ibiri! Please see our [Contributing Guide](CONTRIBUTING.md) for more details on:

- Setting up your development environment
- Coding standards
- Submitting pull requests
- Our code review process -->

## Roadmap

Future plans for Ibiri include:

- Integration with more African payment systems
- Enhanced AI-driven financial advice
- Expansion to francophone African countries
- Development of a merchant platform

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed history of changes to Ibiri.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Nx](https://nx.dev/) for excellent monorepo tooling
- [Next.js](https://nextjs.org/) for powering our web frontend
- [React Native](https://reactnative.dev/) for enabling cross-platform mobile development
- The open-source community for the countless libraries and tools that make this project possible

## Contact

For any queries or support, please contact us at <ddboy@gmail.com>
