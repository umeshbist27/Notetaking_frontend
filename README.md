# 📝 NoteTaking App (Frontend)

A beautiful and modern note-taking frontend built with React, TypeScript, Tailwind CSS, and React Query. 
This app lets users create, edit, view, and manage notes with rich text and image support (via TinyMCE + Cloudinary). 
Built to work with a [Node.js/Express/MongoDB backend](#https://notetaking-backend-ogwv.onrender.com).


## Features

-  Rich text editor with TinyMCE
-  Cloudinary image uploads
- React Query for fetching/mutating notes
- JWT-based auth (signup, login)
-  Functional components with React Hooks
- Tailwind CSS for responsive UI
-  Light/dark theming support (optional)
-  Unit tested with React Testing Library + Jest
- Export notes to PDF
- Mobile responsive layout
-  Smart state handling (sidebar, active note)

---

## Tech Stack

| Tech              | Purpose                          |
|------------------|----------------------------------|
| React            | UI rendering                     |
| TypeScript       | Type safety                      |
| Tailwind CSS     | Styling                          |
| React Query      | Server-state management          |
| React Router DOM | Client-side routing              |
| Axios            | HTTP requests                    |
| TinyMCE          | Rich text editor                 |
| Cloudinary       | Image storage                    |
| Jest + RTL       | Unit testing                     |
| Docker           | Containerization                 |
| GitHub Actions   | CI testing  and CD               |


##  Getting Started

##  Prerequisites

- Node.js (v18+ recommended)
- Docker (optional)
- A working backend (see https://notetaking-backend-ogwv.onrender.com)
- TinyMCE API key
- Cloudinary account
- .env file with environment variables

---

### Local Installation
git clone https://github.com/your-username/note-taking-frontend.git
cd note-taking-frontend
npm install 

using docker
-docker-compose up build
-docker-copose -f docker-compose.test.yml run frontend-test

run locally
-npm run dev

.env file 
VITE_API_BASE_URL=http://localhost:5000/api
VITE_TINYMCE_API_KEY=your_tinymce_api_key

## GitHub Actions (CI/CD)
Tests are automatically run via GitHub Actions when you push code.

CI Workflow File: .github/workflows/frontend-test.yml
Deployment will be automatically run via Github Actions 
CD workflow FIle : ..github/workflows/deploy.yml
