# Movie Recommendation System - Frontend

This repository hosts the frontend application of the Movie Recommendation System. Built with Next.js, it provides a dynamic, server-rendered UI for personalized movie recommendations.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Setup](#setup)
- [Usage](#usage)
- [Folder Structure](#folder-structure)
- [Contributing](#contributing)


### Overview

This frontend application is designed to offer a personalized and user-friendly experience for discovering movies based on individual preferences. It features content-based filtering and is part of a service-oriented architecture that interacts with a Flask backend API and Supabase database.

### Key Features

- **Dynamic Recommendations**: Personalized movie suggestions based on user interests.
- **Efficient Browsing**: Intuitive interface with filters for genres and themes.
- **Secure Authentication**: NextAuth integration for user login and authentication.
- **Responsive Design**: Optimized for desktop and mobile devices.

### Technology Stack

- **Frontend Framework**: Next.js (React-based, optimized for server-side rendering)
- **Authentication**: NextAuth for secure multi-method user sign-in
- **Styling**: CSS, TailwindCSS (optional, if used in the project)

### Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/frontend-movie-recommendation.git
   cd frontend-movie-recommendation
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create a `.env.local` file**:
   Populate it with the required environment variables, such as:

   ```plaintext
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

### Usage

1. **Sign In**:
   Users can log in using Google, GitHub, or email.
   
2. **Browse Movies**:
   Explore movie recommendations on the homepage, which dynamically updates based on user preferences.
   
3. **Search and Filter**:
   Browse through genres or themes to find content tailored to user tastes.

### Folder Structure

- `pages/`: Contains all the main pages and API routes.
- `components/`: Reusable UI components such as movie cards, navigation bars, etc.
- `utils/`: Utility functions, such as API calls.
- `styles/`: CSS files for global and component-specific styling.

### Contributing

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Open a pull request once you’re ready for review.
