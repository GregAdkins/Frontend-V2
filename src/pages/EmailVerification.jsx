import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader, Mail } from 'lucide-react';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    console.log('Verification token from URL:', token);
    
    if (token) {
      verifyEmail(token);
    } else {
      setVerificationStatus('error');
      setMessage('Invalid verification link. Please check your email and try again.');
    }
  }, [searchParams]);

  const verifyEmail = async (token) => {
    try {
      console.log('Sending verification request with token:', token);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/account/verify-email/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      console.log('Verification response:', { status: response.status, data });

      if (response.ok) {
        if (data.message && data.message.includes('already verified')) {
          setVerificationStatus('already_verified');
          setMessage('Your email is already verified! You can now log in to your account.');
        } else {
          setVerificationStatus('success');
          setMessage(data.message || 'Email verified successfully! You can now log in.');
        }
      } else {
        setVerificationStatus('error');
        
        // Handle specific error cases
        if (data.error) {
          if (data.error.includes('expired')) {
            setMessage('Your verification link has expired. Please request a new verification email below.');
          } else if (data.error.includes('Invalid') || data.error.includes('invalid')) {
            setMessage('This verification link is invalid or has already been used. If your email is not verified, please request a new verification email below.');
          } else {
            setMessage(data.error);
          }
        } else {
          setMessage('Email verification failed. Please try again or request a new verification email.');
        }
      }
    } catch (error) {
      console.error('Verification network error:', error);
      setVerificationStatus('error');
      setMessage('Network error. Please check your connection and try again.');
    }
  };

  const handleResendVerification = async () => {
    if (!email.trim()) {
      alert('Please enter your email address');
      return;
    }

    setIsResending(true);
    try {
      console.log('Resending verification email to:', email);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/account/resend-verification/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();
      console.log('Resend response:', { status: response.status, data });

      if (response.ok) {
        alert(data.message || 'Verification email sent successfully! Please check your inbox.');
        setEmail('');
      } else {
        alert(data.error || 'Failed to send verification email. Please try again.');
      }
    } catch (error) {
      console.error('Resend network error:', error);
      alert('Network error. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center">
          {/* Header with Custom Logos */}
          <div className="flex flex-col items-center space-y-4 mb-6">
            {/* Main 5thSocial Logo */}
            <img 
              src="/5thsocial-logo.png" 
              alt="5th Social" 
              className="h-12 w-auto"
            />
            {/* S Logo */}
            <img 
              src="/s-logo.png" 
              alt="S" 
              className="h-6 w-auto opacity-80"
            />
          </div>

          {verificationStatus === 'loading' && (
            <div>
              <Loader className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Email</h2>
              <p className="text-gray-600">Please wait while we verify your email address...</p>
            </div>
          )}

          {verificationStatus === 'success' && (
            <div>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-900 mb-2">Email Verified!</h2>
              <p className="text-green-700 mb-6">{message}</p>
              <Link
                to="/login"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-block"
              >
                Go to Login
              </Link>
            </div>
          )}

          {verificationStatus === 'already_verified' && (
            <div>
              <CheckCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-blue-900 mb-2">Already Verified!</h2>
              <p className="text-blue-700 mb-6">{message}</p>
              <Link
                to="/login"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-block"
              >
                Go to Login
              </Link>
            </div>
          )}

          {verificationStatus === 'error' && (
            <div>
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-900 mb-2">Verification Issue</h2>
              <p className="text-red-700 mb-6">{message}</p>
              
              {/* Resend verification form */}
              <div className="text-left space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Request new verification email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                
                <button
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isResending ? (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send New Verification Email'
                  )}
                </button>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <Link
                  to="/login"
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;