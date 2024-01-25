# Support App

The Support App is a full-stack application built with Next.js, TypeScript, and Microsoft Fluent UI. The platform enables users to securely log in, create and view support cases, comment on them, and manage their account information.

## Getting Started

Follow these instructions to get your copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Ensure you have the following installed:

- Node.js: Install from [Node.js](https://nodejs.org/)
- Git: Install from [Git](https://git-scm.com/)

### Installation

To set up your development environment:

1. Clone the repository:
   ```bash
   git clone https://github.com/diegoallies/databalk-assignment.git
   cd databalk-assignment
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- **Login Page**: Secure login with validation.
- **Dashboard**: Overview of cases with the ability to manage them.
- **Support Case Creation**: Create new cases with title, description, and attachments.
- **Case Detail Page**: Detailed view with comments functionality.
- **User Authentication**: Implemented using Next.js libraries.
- **Database Integration**: Included SQLite database within the codebase.
- **API Endpoints**: Handle user operations and case management.
- **Authorization**: Users access and modify only their data.

## Technology Stack

- **[Next.js](https://nextjs.org/)**: The React framework for production.
- **[TypeScript](https://www.typescriptlang.org/)**: JavaScript with syntax for types.
- **[Microsoft Fluent UI](https://developer.microsoft.com/en-us/fluentui#/)**: A collection of UX design frameworks.

## Project Structure

- `pages/`: Page components including API route handlers.
- `components/`: Reusable React components.
- `public/`: Static assets such as images.
- `styles/`: CSS and styling files.
- `lib/`: Utility and helper functions.
- `database/`: SQLite database files including schema migrations.

## Security

We employ best practices for security, such as hashing passwords and using JWT for session management.

## Contributing

For contributions, please submit a pull request with a clear description of the changes you've made.

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/diegoallies/databalk-assignment/blob/main/LICENSE) file for details.

## Author

- **Diego Allies**
