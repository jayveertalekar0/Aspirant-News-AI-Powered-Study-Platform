import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './state/AuthContext';
import { AppProvider } from './state/AppContext';
import { DarkModeProvider } from './state/DarkModeContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import ArticlePage from './pages/ArticlePage';
import VideosPage from './pages/VideosPage';
import EPaperPage from './pages/EPaperPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import PrivateRoute from './components/PrivateRoute';
import styles from './styles/App.module.css';
import QuizPage from './pages/QuizPage';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <DarkModeProvider>
            <div className={styles.app}>
              <Navbar onToggleSidebar={toggleSidebar} />
              <div className={styles['main-layout']}>
                <Sidebar isOpen={sidebarOpen} />
                <main className={styles.mainContainer}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/article/:id" element={<ArticlePage />} />
                    <Route path="/videos" element={<VideosPage />} />
                    <Route path="/epaper" element={<EPaperPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/quiz" element={<QuizPage />} />
                    <Route path="/profile" element={
                      <PrivateRoute><ProfilePage /></PrivateRoute>
                    } />
                  </Routes>
                </main>
              </div>
            </div>
          </DarkModeProvider>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;