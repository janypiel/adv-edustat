import { useEffect, useState } from "react";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { app } from "./firebase"; // Import your Firebase app
import backgroundImage from "../components/bg.jpg"; // Import your background image

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorEmail, setErrorEmail] = useState('');
  const [errorPassword, setErrorPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginAttempted, setLoginAttempted] = useState(false);
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate(); // hook to navigate to other pages

  useEffect(() => {
    if (!email.endsWith('@gmail.com') && email !== '') {
      setErrorEmail('Please enter a valid email address');
    } else {
      setErrorEmail('');
    }
  }, [email]);

  useEffect(() => {
    if (password.length < 8 || password.length > 20) {
      setErrorPassword('Password must be between 8 and 20 characters');
    } else if (password.search(/[A-Z]/) < 0) {
      setErrorPassword('Password must contain 1 uppercase letter');
    } else if (password.search(/[0-9]/) < 0) {
      setErrorPassword('Password must contain 1 number');
    } else {
      setErrorPassword('');
    }
  }, [password]);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(user.emailVerified);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email.trim() !== '' && password.trim() !== '' && !errorEmail && !errorPassword) {
      try {
        const auth = getAuth(app); // Get the authentication instance from Firebase
        const userCredential = await createUserWithEmailAndPassword(auth, email, password); // Create user with email and password
        await sendEmailVerification(userCredential.user); // Send email verification to the newly created user
        setLoginError('Please verify your email address before logging in.');
      } catch (error) {
        console.error("Error creating account:", error.message);
        // Handle error creating account, you can set an error state to display to the user
      }
    }
  };

  const handleLoginClick = async () => {
    setLoginAttempted(true);
    try {
      const auth = getAuth(app); // Get the authentication instance from Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password); // Sign in user with email and password
      const user = userCredential.user;
      if (user.emailVerified) {
        setIsLoggedIn(true); // Set isLoggedIn to true if email is verified
      } else {
        setLoginError("Please verify your email address before logging in."); // Set login error if email is not verified
      }
    } catch (error) {
      console.error("Error logging in:", error.message);
      setLoginError("Invalid email or password."); // Set login error for invalid email/password
    }
  };

  const handleLoginRedirect = () => {
    navigate('/'); // navigate to login page
  };

  return (
    <div
      className='flex flex-col items-center justify-center min-h-screen bg-gray-100'
      style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover' }}
    >
      <div
        className='bg-white p-8 rounded-lg shadow-md w-96'
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)', // Adjust opacity here
        }}
      > 
        <h2 className='text-3xl font-semibold mb-4'>Sign Up</h2>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label htmlFor='email' className='block text-gray-600'>Email</label>
            <input
              id='email'
              type='email'
              value={email}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500'
              placeholder='Your Password'
            />
            {errorPassword && <p className='text-red-500 text-sm mt-1'>{errorPassword}</p>}
          </div>
          <button
            type='submit'
            className='w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition duration-300'
            disabled={errorEmail || errorPassword || !(email.trim() && password.trim())}
          >
            Sign Up
          </button>
          <p className='text-gray-600 text-center mt-2 cursor-pointer' onClick={handleLoginRedirect}>
            Have an account? Log In
          </p>
        </form>
      </div>
      {isLoggedIn && <p>Please verify your email address. A verification link has been sent to your email.</p>}
      {loginError && <p>{loginError}</p>}
      {(loginAttempted || isLoggedIn) && !errorEmail && !errorPassword && (
        <p>Please verify your email address before logging in. If you haven't received the verification email, please check your spam folder.</p>
      )}
    </div>
  );
};

export default RegisterPage;