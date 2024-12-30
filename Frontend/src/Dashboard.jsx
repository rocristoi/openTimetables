import { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';
import { useAuth } from './AuthContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import apiUrl from './config';
import { bouncy } from 'ldrs';

const Dashboard = () => {
  bouncy.register()
  const { user } = useAuth();
  const [timetableCount, setTimetableCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const idToken = await  auth.currentUser.getIdToken(true);
          const response = await axios.get(`${apiUrl}/timetables`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        setTimetableCount(response.data.length || 0);  
        setData(response.data);
        console.log(response.data)
      } catch (err) {
        console.error(err);
        setError('Failed to fetch timetable data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();  
      
      const intervalId = setInterval(fetchData, 30000); 
      
      return () => clearInterval(intervalId);  
    }

  }, [user]);  


  const logoutUser = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (!user) {
    return <p>You must be logged in!</p>;
  }


  return (
<div className="h-screen w-screen flex flex-col ">
  <AnimatePresence>
    {loading && (
      <motion.div
        className="absolute inset-0 flex items-center justify-center bg-opacity-40 bg-gray-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.5 } }}
        exit={{ opacity: 0, transition: { duration: 0.1 } }}
      >
        <l-hourglass size="50" speed="1.00" color="#3b82f6"></l-hourglass>
      </motion.div>
    )}
  </AnimatePresence>
  
  {!loading && (
    <div className="h-screen w-screen flex flex-col  text-gray-100 p-10">
    <div className="mb-8">
      <h1 className="text-4xl font-extrabold text-black mb-2">Welcome Back</h1>
      <p className="text-gray-600">
        Logged in as <span className="text-blue-500 font-bold">{user.email}</span>. <span className='text-black font-bold cursor-pointer'
        onClick={logoutUser}
        >Logout?</span>
      </p>
      <p className="text-gray-400 mt-1">
        Manage your timetables or create new ones effortlessly.
      </p>
    </div>
  
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <motion.div
        className="col-span-1 h-56 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex flex-col items-center justify-center shadow-xl"
        whileHover={{ scale: 1.03 }}
      >
        <h2 className="text-2xl font-bold text-white">Timetables Created</h2>
        <p className="text-6xl font-black text-white mt-4">{error ? "0" : timetableCount}</p>
        <p className="text-gray-300 mt-2">Click the '+' button to create more.</p>
      </motion.div>
  
      <div className="col-span-2 flex flex-wrap gap-6">
        {data && data.reverse().map((timetable) => (
          <Link
            key={timetable.id}
            to={timetable.data == null ? `` : `/timetable/${timetable.id}`}
            state={{ timetable }}
            className={`w-[250px] bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center justify-center ${timetable.data == null ? `cursor-not-allowed	hover:bg-gray-800` : `cursor-pointer  hover:bg-gray-700`}  transition`}
          >
            {timetable.data == null ? (
              <>
            <div className='flex flex-row gap-2 items-center justify-center'>
            <h3 className="text-lg font-bold text-white text-center">{timetable.name}</h3>
            <l-bouncy
              size="20"
              speed="1.75" 
              color="white" 
            ></l-bouncy>
            </div>
            <p className="text-sm text-gray-400 text-center mt-4">Creeating this timetable <br /> Please wait</p>


            </>
            ) : (
              <>
              <h3 className="text-lg font-bold text-white text-center">{timetable.name}</h3>
              <p className="text-sm text-gray-400 mt-4">View this timetable</p>

              </>
            )}
          </Link>
        ))}
  
        <Link to="/dashboard/create">
          <motion.div
            className="w-[250px] h-56 bg-gray-800 rounded-xl shadow-lg flex items-center justify-center text-gray-300 hover:text-gray-50 hover:bg-gray-700 transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-4xl font-bold">+</span>
          </motion.div>
        </Link>
      </div>
    </div>
  
    <div className="absolute bottom-0 text-black text-center py-4">
      <p>Open Timetables, {new Date().getFullYear()} | Open Source, Built with ❤️ in Romania</p>
    </div>
  </div>
  )}
</div>
  );
};

export default Dashboard;
