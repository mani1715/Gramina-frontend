# GramaMitra Frontend

React frontend for GramaMitra - Smart Rural Job Platform with Voice AI.

## Features

- Mobile-first responsive design
- Telugu + English bilingual support
- Voice-based job posting with AI
- GPS-based location detection
- Icon-driven UI for low-literacy users
- Job search with filters (location, wage, distance)
- Application management
- User profile management

## Deployment on Railway

### 1. Create a new project on Railway

1. Go to [Railway](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select this repository

### 2. Set Environment Variables

In Railway, go to your frontend service → Variables → Add:

```
REACT_APP_BACKEND_URL=https://your-backend-service.railway.app
```

**Important:** Make sure to deploy the backend first and get its URL.

### 3. Configure Build Settings

Railway should auto-detect the Node.js project. The build process will:
1. Run `yarn install` to install dependencies
2. Run `yarn build` to create production build
3. Run `yarn start` to serve the static files

### 4. Deploy

Railway will automatically deploy when you push to your repository.

## Local Development

```bash
# Install dependencies
yarn install

# Create environment file
cp .env.example .env
# Edit .env with your backend URL

# Start development server
yarn dev

# Build for production
yarn build

# Serve production build locally
yarn start
```

## Project Structure

```
frontend/
├── public/           # Static files
├── src/
│   ├── components/   # Reusable UI components
│   │   └── ui/       # shadcn/ui components
│   ├── context/      # React contexts (Auth, Language)
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Utility functions
│   └── pages/        # Page components
│       ├── LandingPage.js
│       ├── LoginPage.js
│       ├── SignupPage.js
│       ├── VerifyOTPPage.js
│       ├── Dashboard.js
│       ├── FindGigPage.js
│       ├── GiveGigPage.js
│       ├── JobDetailPage.js
│       ├── AppliedGigsPage.js
│       ├── ProfilePage.js
│       └── AboutPage.js
├── package.json
├── tailwind.config.js
└── craco.config.js
```

## Pages

- `/` - Landing page with hero section and features
- `/login` - User login
- `/signup` - User registration
- `/verify-otp` - Email OTP verification
- `/dashboard` - User dashboard with quick actions
- `/find-gig` - Search and filter available jobs
- `/give-gig` - Post new job (with voice support)
- `/job/:id` - Job details and apply
- `/applied-gigs` - View applications and posted jobs
- `/profile` - User profile management
- `/about` - About page

## Technologies

- React 19
- React Router 7
- Tailwind CSS 3
- Framer Motion
- shadcn/ui components
- Axios for API calls
- Sonner for toasts
