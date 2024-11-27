import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { MessageSquare, Video } from 'lucide-react';
import { Button } from './components/Button';
import { ThemeToggle } from './components/ThemeToggle';
import { ChatInterface } from './components/ChatInterface';
import { VideoChat } from './components/VideoChat';
import { useUserStore } from './store/userStore';

function Home() {
  const navigate = useNavigate();
  const { username, setUsername } = useUserStore();

  const handleStart = (path: string) => {
    if (!username.trim()) {
      alert('Please enter your name first');
      return;
    }
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      <div className="container mx-auto px-4 py-16 min-h-screen flex flex-col items-center justify-center">
        <ThemeToggle />
        
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-rose-600 dark:from-indigo-400 dark:to-rose-400 mb-4">
            Random Chat
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Connect instantly with strangers around the world
          </p>

          <div className="max-w-sm mx-auto mb-8">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              maxLength={20}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-rose-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
            <div className="relative space-y-4 sm:space-y-0 sm:flex sm:space-x-4 justify-center">
              <Button 
                variant="primary"
                icon={MessageSquare}
                onClick={() => handleStart('/chat')}
              >
                Start Text Chat
              </Button>
              
              <Button 
                variant="secondary"
                icon={Video}
                onClick={() => handleStart('/video')}
              >
                Start Video Chat
              </Button>
            </div>
          </div>

          <div className="mt-16 text-gray-600 dark:text-gray-400 space-y-2">
            <p className="text-sm">🔒 No sign-up required</p>
            <p className="text-sm">🌐 Connect with people worldwide</p>
            <p className="text-sm">🎭 Completely anonymous</p>
          </div>
        </div>

        <footer className="mt-auto pt-8 text-center text-gray-500 dark:text-gray-400">
          <p className="text-sm">
            By using this service, you agree to our Terms of Service and Privacy Policy
          </p>
        </footer>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<ChatInterface />} />
        <Route path="/video" element={<VideoChat />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;