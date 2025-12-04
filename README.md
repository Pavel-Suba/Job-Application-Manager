# Job Application Manager 📝

A modern web application for managing job applications with AI-powered assistance. Track your applications, generate tailored cover letters, optimize your CV, and stay organized throughout your job search.

## ✨ Features

- **Application Tracking**: Manage all your job applications in one place with a sortable table view
- **AI Assistant**: Generate personalized cover letters and optimize your CV using Google's Gemini AI
- **Master Profiles**: Create and manage multiple CV profiles for different job types
- **Document Management**: Link CVs and documents to specific applications
- **Task Tracking**: Add and track tasks for each application
- **Analytics**: Visualize your job search progress with charts and statistics
- **Firebase Integration**: Secure cloud storage with user authentication

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A Google account (for Firebase)
- Gemini API key (get it from [Google AI Studio](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/job-application-manager.git
   cd job-application-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a new project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password and Google Sign-In)
   - Create a Firestore Database
   - Copy your Firebase configuration
   - Update `src/firebase.js` with your Firebase config

4. **Configure environment variables**
   - Create a `.env.local` file in the root directory
   - Add your Gemini API key:
     ```
     VITE_GEMINI_API_KEY=your_gemini_api_key_here
     ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   - Navigate to `http://localhost:5173`

## 🔧 Configuration

### Firebase Security Rules

Set up Firestore security rules to protect user data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{collection}/{document} {
      allow read, write: if request.auth != null && 
                          request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
                       request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### Environment Variables

Create a `.env.local` file with the following:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

## 📚 Usage

### Managing Applications

1. Click **"+ New Application"** to add a job application
2. Fill in company name, position, and other details
3. Click on any cell in the table to edit inline
4. Click the arrow (▶) to open the detailed sidebar

### Using AI Features

1. Navigate to **"AI Assistant"** from the sidebar
2. Select an application
3. Choose to generate a cover letter or optimize your CV
4. Review and edit the AI-generated content
5. Save to your application

### Creating Master Profiles

1. Go to **"Master Profiles"**
2. Click **"+ New Profile"**
3. Choose between structured form or simple text input
4. Fill in your professional information
5. Link profiles to applications when needed

## 🛠️ Built With

- **React** - UI framework
- **Vite** - Build tool
- **Firebase** - Backend and authentication
- **Google Gemini AI** - AI-powered content generation
- **Recharts** - Data visualization

## 📁 Project Structure

```
job-application-manager/
├── src/
│   ├── components/        # Reusable UI components
│   ├── context/          # React context providers
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page components
│   ├── services/         # External services (Gemini AI)
│   ├── firebase.js       # Firebase configuration
│   └── main.jsx          # Application entry point
├── public/               # Static assets
├── .env.local           # Environment variables (not tracked)
└── package.json         # Dependencies
```

## 🔒 Security & Privacy

- All user data is stored securely in Firebase Firestore
- Each user can only access their own data (enforced by security rules)
- API keys are stored in environment variables and never committed to Git
- Firebase configuration values are public (this is normal and safe)

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Google Gemini AI for powering the AI features
- Firebase for backend infrastructure
- The React community for excellent documentation and tools

## 📧 Contact

For questions or suggestions, please open an issue on GitHub.

---

**Note**: This application requires your own Firebase project and Gemini API key. The repository does not include any credentials or user data.
