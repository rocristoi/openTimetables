import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { motion } from "framer-motion";
import { useAuth } from './AuthContext';
import { useNavigate } from "react-router-dom";
import highseas from './assets/highlogo.svg'
export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]); 

  const getErrorMessage = (code) => {
    switch (code) {
      case "auth/invalid-email":
        return "The email address is not valid. Please check and try again.";
      case "auth/email-already-in-use":
        return "This email is already in use. Please use a different one.";
      case "auth/weak-password":
        return "Your password should be at least 6 characters long.";
      case "auth/user-not-found":
        return "No user found with this email address. Please sign up.";
      case "auth/wrong-password":
        return "The password is incorrect. Please try again.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please try again later.";
      default:
        return "An unknown error occurred. Please try again.";
    }
  };
  
  const handleSignup = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate('/dashboard')
    } catch (err) {
        const customError = getErrorMessage(err.code); 
        setError(customError);  
    }
  };

  const handleTestSignin = async () => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, 'cool.user@hackclub.com', 'test123');
    const user = userCredential.user;
    const idToken = await auth.currentUser.getIdToken(); 

    localStorage.setItem('authToken', idToken);

    navigate('/dashboard'); 
  } catch (err) {
    const customError = getLoginErrorMessage(err.code);
    setError(customError);
  }
};

  
    return (
      <div className="h-screen w-screen flex items-center justify-center">
          <motion.div className="absolute top-0 mt-4 h-[100px] w-[550px] bg-white rounded-xl flex flex-row items-center px-8 p-2 shadow shadow-lg shadow-fuchsia-200 "
               initial={{ opacity: 0, y: -20}}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.2, delay: 1 }}
            >
                <div className="w-1/3">
                  <img src={highseas} className="w-25 h-20" />
                </div>  
                <div className="w-2/3 flex flex-col text-black ">
                <span> <span className="font-bold">Psst.. </span>Here from high seas?</span>
                <span className="text-blue-900 font-bold cursor-pointer"
               onClick={handleTestSignin}>Press here to log in, to test things out</span>
                </div>
            </motion.div>

        <motion.div
          className="w-[400px] h-auto bg-white border shadow-lg rounded-2xl flex flex-col p-8 items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-gray-800 font-extrabold text-[32px] mb-2">Welcome</h1>
          <p className="text-gray-600 font-medium text-[14px] text-center mb-8">
            Please register to access <span className="text-blue-500">Open Timetables</span>
          </p>
  
          <input
            type="email"
            placeholder="Email Address"
            onChange={(e) => setEmail(e.target.value)}
            className="w-3/4 p-3 text-gray-800 bg-gray-100 rounded-lg mb-4 outline-none focus:ring-2 focus:ring-blue-300"
          />
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            className="w-3/4 p-3 text-gray-800 bg-gray-100 rounded-lg mb-6 outline-none focus:ring-2 focus:ring-blue-300"
          />
  
          <a href="/login" className="text-gray-500 text-sm mb-4 hover:underline">
            Already have an account? <span className="text-blue-500">Log in</span>
          </a>
  
          <motion.button
            onClick={handleSignup}
            className="w-3/4 bg-blue-500 text-white py-3 rounded-lg font-semibold shadow-md transition-all duration-300 ease-in-out hover:bg-blue-600 hover:shadow-lg"
            whileTap={{ scale: 0.95 }}
          >
            Sign Up
          </motion.button>
  
          {error && (
            <p className="text-red-500 mt-4 text-sm text-center">{error}</p>
          )}
        </motion.div>
      </div>
    );
}