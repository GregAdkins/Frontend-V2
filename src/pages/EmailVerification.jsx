import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader, Mail } from 'lucide-react';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      verifyEmail(token);
    } else {
      setVerificationStatus('error');
      setMessage('Invalid verification link. Please check your email and try again.');
    }
  }, [searchParams]);

  const verifyEmail = async (token) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/account/verify-email/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok) {
        setVerificationStatus('success');
        setMessage(data.message || 'Email verified successfully! You can now log in.');
      } else {
        setVerificationStatus('error');
        setMessage(data.error || 'Email verification failed. Please try again.');
      }
    } catch (error) {
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
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/account/resend-verification/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || 'Verification email sent successfully!');
        setEmail('');
      } else {
        alert(data.error || 'Failed to send verification email.');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/logo-5thsocial.png" 
              alt="5th Social" 
              className="h-12 w-auto"
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

          {verificationStatus === 'error' && (
            <div>
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-900 mb-2">Verification Failed</h2>
              <p className="text-red-700 mb-6">{message}</p>
              
              {/* Resend verification form */}
              <div className="text-left space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resend verification email
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
                    'Resend Verification Email'
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