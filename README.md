# GigMate - README

## Overview

GigMate is a comprehensive gig management platform designed to help users efficiently manage their freelance projects. The platform allows users to create, categorize, and track gigs, whether they are school projects or business gigs. With integrated task automation and budget breakdown features, GigMate streamlines the project management process, making it easier for users to stay organized and on track.

## Features

### Gig Management

- **Create New Gigs**: Users can create a new gig and categorize it as either a School Project or a Business Gig.
- **Detailed Input Fields**: The platform provides fields to add essential details such as gig name, description, features, and timeline.
- **Dropdown for Gig Type**: Users can select the type of gig (School Project or Business Gig) from a dropdown menu.

### Task Automation with Gemini API

- **API Integration**: When a gig is submitted for review, the details are sent to the Gemini API.
- **Task Generation**: The API response is parsed to generate actionable and trackable tasks for project completion.
- **Automated Price Estimation**: The platform automatically estimates the gig's price based on the type:
  - **School Projects**: GH₵1500 - GH₵2500
  - **Business Gigs**: GH₵4000+

### Budget Breakdown

- **Cost Breakdown Display**: Users can view a detailed cost breakdown of the project, including estimated costs for each actionable task.

### Git Repository Integration

- **Link GitHub Repository**: Users can link a GitHub repository to the project after accepting the estimation and tasks.
- **Commit Tracking**: The platform displays the last commit for each project and checks if it aligns with the tasks.

### Dashboard Overview

- **Initial Dashboard**: Users are presented with a summary of ongoing gigs.
- **Gig Details**: The dashboard includes the following details for each gig:
  - Project name
  - Type (school/business)
  - Timeline
  - Current status (on track or behind schedule)
  - Last commit details if a repository is linked

## Tech Stack

GigMate is built using the following technologies:

- **Frontend**:

  - React Native: For building the mobile application.
  - Expo: For rapid development and deployment of the React Native app.
  - TypeScript: For type safety and improved developer experience.

- **Backend**:

  - Gemini API: For task automation and price estimation.

- **State Management**:

  - React Context API: For managing global state across the application.

- **Database**:

  - AsyncStorage: For local data storage of gigs and tasks.

- **Styling**:
  - React Native StyleSheet: For styling components in the application.

## Getting Started

To get started with GigMate, clone the repository and install the necessary dependencies:

```bash
git clone https://github.com/yourusername/gigmate.git
cd gigmate
npm install
```

Then, run the application:

```bash
npm start
```

## Contributing

Contributions are welcome! If you have suggestions for improvements or new features, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
