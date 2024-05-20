import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail } from "firebase/auth";
import { app } from "./firebase"; // Import your Firebase app
import backgroundImage from "../components/bg.jpg"; // Import your background image
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorEmail, setErrorEmail] = useState('');
  const [errorPassword, setErrorPassword] = useState('');
  const [loginError, setLoginError] = useState(null); // State for login error
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0); // State to track login attempts
  const navigate = useNavigate(); // hook to navigate to other pages

  useEffect(() => {
    if (!email.endsWith('@gmail.com') && email !== '') {
      setErrorEmail('Email is not a valid email');
    } else {
      setErrorEmail('');
    }
  }, [email]);

  const handleGoogleSignIn = async () => {
    try {
      const auth = getAuth(app); // Get the authentication instance from Firebase
      const provider = new GoogleAuthProvider(); // Create Google auth provider instance
      await signInWithPopup(auth, provider); // Sign in with Google popup
      setIsLoggedIn(true); // Set isLoggedIn to true upon successful login
    } catch (error) {
      console.error("Error logging in with Google:", error.message);
      // Set the login error state to display the error message
      setLoginError('Error logging in with Google');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email.trim() !== '' && password.trim() !== '' && !errorEmail && !errorPassword) {
      try {
        const auth = getAuth(app); // Get the authentication instance from Firebase
        await signInWithEmailAndPassword(auth, email, password); // Sign in with email and password
        setIsLoggedIn(true); // Set isLoggedIn to true upon successful login
        setLoginAttempts(0); // Reset login attempts on successful login
      } catch (error) {
        console.error("Error logging in:", error.message);
        // Set the login error state to display the error message
        setLoginError('Invalid email or password');
        setLoginAttempts(prevAttempts => prevAttempts + 1); // Increment login attempts
        if (loginAttempts >= 3) {
          // If login attempts exceed 3, prompt the user to reset their password
          setLoginError('Too many failed login attempts. You can reset your password.');
        }
      }
    }
  };

  const handleCreateAccountClick = () => {
    navigate('/register'); // navigate to register page
  };

  const handleResetPasswordClick = async () => {
    try {
      const auth = getAuth(app);
      await sendPasswordResetEmail(auth, email);
      setLoginError('Password reset email sent. Check your inbox.');
    } catch (error) {
      console.error("Error sending password reset email:", error.message);
      setLoginError('Error sending password reset email.');
    }
  };

  return (
    <div
      className='flex flex-col items-center justify-center min-h-screen'
      style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover' }}
    >
        <div
        className='bg-white p-8 rounded-lg shadow-md w-96'
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)', // Adjust opacity here
        }}
        > 

        <h2 className='text-3xl font-semibold mb-4'>Log In</h2>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label htmlFor='email' className='block text-gray-600'>Email</label>
            <input
              id='email'
              onChange={(e) => setEmail(e.target.value)}
              className='w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500'
              placeholder='Your Email'
            />
            {errorEmail && <p className='text-red-500 text-sm mt-1'>{errorEmail}</p>}
          </div>
          <div>
            <label htmlFor='password' className='block text-gray-600'>Password</label>
            <input
              id='password'
              type='password'
              onChange={(e) => setPassword(e.target.value)}
              className='w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500'
              placeholder='Your Password'
            />
            {errorPassword && <p className='text-red-500 text-sm mt-1'>{errorPassword}</p>}
          </div>
          {loginError && <p className='text-red-500 text-sm mt-1'>{loginError}</p>} {/* Display login error message */}
          {loginAttempts >= 3 && (
            <button
              type='button'
              className='text-blue-600 hover:text-blue-800 text-sm'
              onClick={handleResetPasswordClick}
            >
              Forgot your password? Reset it here.
            </button>
          )}
          <button
            type='submit'
            className='w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition duration-300'
          >
            Log In
          </button>
          <button
            type='button'
            className='w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-300'
            onClick={handleCreateAccountClick} // call the function to navigate to register page
          >
            Create Account
          </button>
          <button
            type='button'
            className='w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition duration-300 flex items-center justify-center'
            onClick={handleGoogleSignIn} // call the function to sign in with Google
          >
            <FontAwesomeIcon icon={faGoogle} className='mr-2' /> Sign In with Google
          </button>
        </form>
      </div>
      {isLoggedIn && <Navigate to='/profile' />}
    </div>
  );
};

export default LoginPage;
