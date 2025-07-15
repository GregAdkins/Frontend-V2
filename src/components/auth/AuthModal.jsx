import React from 'react';
import RegisterForm from './RegisterForm';
import LoginForm from './LoginForm';
import { useState } from "react";

const AuthModal = ({ isOpen, onClose }) => {
  const [currentView, setCurrentView] = useState('login');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
        >
          <div className="w-6 h-6" />
        </button>

        {currentView === 'login' ? (
          <LoginForm
            onSwitchToRegister={() => setCurrentView('register')}
            onClose={onClose}
          />
        ) : (
          <RegisterForm
            onSwitchToLogin={() => setCurrentView('login')}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
};

export default AuthModal;