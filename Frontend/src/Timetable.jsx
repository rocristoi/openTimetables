import { useLocation, useParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import { hourglass } from 'ldrs';
import { AnimatePresence, motion } from 'framer-motion';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import PrintTimetable from './PrintTimetable';
import { CiShare1 } from "react-icons/ci";
import { auth } from './firebase';
import apiUrl from './config';

const Timetable = () => {
  hourglass.register();
  const { state } = useLocation();
  const { id } = useParams();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [fetchedTimetable, setFetchedTimetable] = useState(null);

  const timetableRef = useRef([]);

  useEffect(() => {
    if (isNaN(id)) {
      setError('Invalid timetable ID');
      setLoading(false);
      return;
    }

    const checkId = async (id) => {
      try {
        const idToken = await auth.currentUser.getIdToken(true);
        const response = await axios.get(`${apiUrl}/check`, {
          params: { idToCheck: id },
          headers: { Authorization: `Bearer ${idToken}` },
        });
        return response.data;
      } catch (err) {
        console.error(err);
        return { value: false };
      }
    };

    const fetchTimetable = async () => {
      const response = await checkId(id);
      if (response.value) {
        try {
          setFetchedTimetable(response);
          setHasPermission(true);
        } catch (err) {
          setError('Failed to fetch timetable');
          setHasPermission(false);
        }
      } else {
        setError('403');
        setHasPermission(false);
      }
      setTimeout(() => {
        setLoading(false);
      }, 1500);
    };

    if (!state?.timetable) {
      fetchTimetable();
    } else {
      setFetchedTimetable(state?.timetable);
      setLoading(false);
      setHasPermission(true);
    }
  }, [id, user, state?.timetable]);

  const exportTimetableAsPDF = async (index, title) => {
    const timetableElement = timetableRef.current[index];
    if (!timetableElement) return;
  
    // Use html2canvas to create the image
    const canvas = await html2canvas(timetableElement, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
  
    // Create new jsPDF instance
    const pdf = new jsPDF("landscape", "mm", "a4");
  
    // Set A4 page dimensions
    const imgWidth = 297; // A4 landscape width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
    // Check if the height exceeds the A4 page size, adjust scaling if necessary
    const maxPageHeight = 210; // A4 landscape height in mm
    if (imgHeight > maxPageHeight) {
      const scaleFactor = maxPageHeight / imgHeight;
      const scaledHeight = imgHeight * scaleFactor;
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, scaledHeight);
    } else {
      // If the content fits within the height, just add it without scaling
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    }
  
    // Save the PDF
    pdf.save(`${title}.pdf`);
  };

  if (error && error !== '403') {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center p-10">
        <div className="flex flex-row items-center gap-2">
          <span className="font-bold text-4xl text-red-500">{error}</span>
          <span>This is an error.</span>
        </div>
      </div>
    );
  }

  if (hasPermission === false || error === '403') {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center p-10">
        <div className="flex flex-row items-center gap-2">
          <span className="font-bold text-4xl text-red-500">403</span>
          <span>This is an error.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-amber-50 to-teal-50 min-h-screen h-full flex flex-col items-center">
      <AnimatePresence>
        {loading && (
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-screen w-screen flex flex-col items-center justify-center p-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.5 } }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
          >
            <l-hourglass size="50" bg-opacity="0.1" speed="1.00" color="black"></l-hourglass>
          </motion.div>
        )}
      </AnimatePresence>
      {!loading && (
        <motion.div
          className="text-black w-full flex flex-col items-center mt-10 mb-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.5 } }}
          exit={{ opacity: 0, transition: { duration: 1 } }}
        >
          <h1 className="text-4xl font-bold">Timetable: {fetchedTimetable?.name}</h1>
          <div className="mt-5 w-full">
            {fetchedTimetable && (
              <div className="flex flex-col items-center justify-center gap-10">
                <h1 className="text-xl font-bold">Please only use this page on desktop devices</h1>
                <div>
                  <motion.div className='flex flex-row gap-2 cursor-pointer justify-center'
                  whileHover={{color: "rgb(59 130 246)"}}
                  initial={{color: "rgb(0 0 0)"}}
                  onClick={() => exportTimetableAsPDF(0, fetchedTimetable?.name)}
                  >
                <h2 className="text-xl font-semibold flex items-center justify-center mb-4">Timetable for the whole school</h2>
                <CiShare1 color='blue' size="1em" />

                </motion.div>
                <PrintTimetable ref={(el) => (timetableRef.current[0] = el)} data={fetchedTimetable.data} clasa="the whole school" type="School" />
                </div>
                {Object.keys(fetchedTimetable.data.classes).map((class_name, index) => (
                  <>
                    <motion.div className='flex flex-row gap-2 cursor-pointer justify-center mt-10'
                  whileHover={{color: "rgb(59 130 246)"}}
                  initial={{color: "rgb(0 0 0)"}}
                  onClick={() => exportTimetableAsPDF(index + 1, class_name)}
                  >
                <h2 className="text-xl font-semibold flex items-center justify-center mb-4">Timetable for {class_name}</h2>
                <CiShare1 color='blue' size="1em" />

                </motion.div>
              
                    <PrintTimetable ref={(el) => (timetableRef.current[index + 1] = el)} data={fetchedTimetable.data} clasa={class_name} type="Class" />
                  </>
                ))}

                {Object.keys(fetchedTimetable.data.teachers).map((teacher_name, index) => (
                  <>
                    <motion.div className='flex flex-row gap-2 cursor-pointer justify-center mt-10'
                      whileHover={{color: "rgb(59 130 246)"}}
                      initial={{color: "rgb(0 0 0)"}}
                      onClick={() => exportTimetableAsPDF(index + 1, teacher_name)}
                      >
                    <h2 className="text-xl font-semibold flex items-center justify-center mb-4">Timetable for {teacher_name}</h2>
                    <CiShare1 color='blue' size="1em" />

                    </motion.div>
                    <PrintTimetable ref={(el) => (timetableRef.current[index + 1] = el)} data={fetchedTimetable.data} clasa={teacher_name} type="Teacher" />
                  </>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Timetable;
