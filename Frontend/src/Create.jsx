
import { useAuth } from './AuthContext';
import { GrConfigure } from "react-icons/gr";
import { CiLocationOn } from "react-icons/ci";
import { SiGoogleclassroom } from "react-icons/si";
import { LiaMapPinSolid } from "react-icons/lia";
import { FaChalkboardTeacher } from "react-icons/fa";
import { MdOutlineSubject } from "react-icons/md";
import { PiArticleNyTimesBold } from "react-icons/pi";
import { MdAccessTime } from "react-icons/md";
import { GrDocumentConfig } from "react-icons/gr";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useEffect } from 'react'; 
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { auth } from './firebase';
import apiUrl from './config';


const Create = () => {
    const { user } = useAuth();
    const [schoolName, setSchoolName] = useState()
    const [addFloorInput, setAddFloorInput] = useState();
    const [floorRoomMapping, setFloorRoomMapping] = useState({});
    const [mapVisible, setMapVisible] = useState(false);
    const [rooms, setRooms] = useState();
    const [classInput, setClassInput] = useState();
    const [classes, setClasses] = useState([]);
    const [mapStatus, setMapStatus] = useState([]);
    const [roomList, setRoomList] = useState([]);
    const [selectedRooms, setSelectedRooms] = useState([]);
    const [roomClassMapping, setRoomClassMapping] = useState({})
    const [teacherInput, setTeacherInput] = useState()
    const [teachers, setTeachers] = useState({})
    const [subject, setSubject] = useState()
    const [tchSelectVisible, setTchSelectVisible] = useState()
    const [selectedTeachers, setSelectedTeachers] = useState([]);
    const [teacherSubjectMapping, setTeacherSubjectMapping] = useState({})
    const [selectedClass, setSelectedClass] = useState()
    const [selectedPred, setSelectedPred] = useState()
    const [userTimeSlotMapping, setUserTimeslotMapping] = useState({})
    const [curriculumMapping, setCurriculumMapping] = useState({})
    const [timeSlotsMapping, setTimeSlotsMapping] = useState({});
    const [selectedDays, setSelectedDays] = useState([]);
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [breakTime, setBreakTime] = useState(0); // In minutes
    const [selectedQuirksClass, setSelectedQuirksClass] = useState();
    const [selectedQuirksSubject, setSelectedQuirksSubject] = useState();
    const [quirksJson, setQuirksJson] = useState()
    const [popupVisible, setPopupVisible] = useState(false);
    const [buttonEnabled, setButtonEnabled] = useState(false);
    const [schoolHour, setSchoolHour] = useState()
    const [error, setError] = useState([])
    const [customPopup, setCustomPopup] = useState(false)
    const [selectedCustomSubject, setSelectedCustomSubject] = useState()
    const [numberOfHours, setNumberOfHours] = useState()
    const [alreadyCustomizedSubjects, setAlreadyCustomizedSubjects] = useState([])
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate(); 
    const popupVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1 },
      };



    if (!user) {
      return <p>You must be logged in!</p>;
    }
  
    // Sidebar items
    const sidebarItems = [
      { icon: GrConfigure, label: "Configuration" },
      { icon: CiLocationOn, label: "Locations" },
      { icon: SiGoogleclassroom, label: "Class Rooms" },
      { icon: LiaMapPinSolid, label: "Mapping" },
      { icon: FaChalkboardTeacher, label: "Teachers" },
      { icon: MdOutlineSubject, label: "Subjects + Specialities" },
      { icon: PiArticleNyTimesBold, label: "Curriculum" },
      { icon: MdAccessTime, label: "Time Slots" },
      { icon: GrDocumentConfig, label: "Quirks" },
    ];

     const [selectedSection, setSelectedSection] = useState("Configuration");

     const handleAddFloorClick = () => {
         if (!addFloorInput) return; 
         if(addFloorInput in floorRoomMapping) {
            setAddFloorInput()    
            return
        };
         setMapVisible(true); 
     };
 
     const handleAddRoomsClick = () => {
         if (!addFloorInput || !rooms) return; // Ensure both floor and rooms input are provided
 
         // Update floor-room mapping
         setFloorRoomMapping((prevMapping) => ({
           ...prevMapping,
           [addFloorInput]: rooms.split(",").map(room => room.trim()), // Map room names to floor
         }));
 
         // Clear the inputs
         setAddFloorInput('');
         setRooms('');
         setMapVisible(false); // Hide the rooms input once rooms are added
     };
 
     // Log floorRoomMapping whenever it updates
     useEffect(() => {
         console.log(floorRoomMapping);
     }, [floorRoomMapping]);  // Dependency array tracks when floorRoomMapping changes

     useEffect(() => {
        if (selectedSection === "Mapping") {
          if (Object.keys(floorRoomMapping).length > 0 && classes.length > 0) {
            const totalLength = Object.values(floorRoomMapping).reduce(
              (sum, array) => sum + array.length,
              0
            );
      
            if (totalLength >= classes.length) {
              setMapStatus([true]); // Success state
            } else {
              setMapStatus([false, "There are too many classes. Try adding more rooms."]);
            }
          } else {
            setMapStatus([false, "Please set up classes and rooms first!"]);
          }
        }
      }, [selectedSection, floorRoomMapping, classes]); // Proper dependencies



     const handleAddClassClick = () => {
        if (!classInput || classes.includes(classInput.trim())) return;
    
        setClasses((prevClasses) => [...prevClasses, classInput.trim()]);
    
        setTimeout(() => {
            setClassInput('');
        }, 50);
    };

    useEffect(() => {
        const updatedRooms = Object.entries(floorRoomMapping).flatMap(
          ([floor, rooms]) => 
            rooms
              .map((room) => `${floor},${room}`) 
              .filter((room) => !(room in roomClassMapping)) 
        );
        setRoomList(updatedRooms); 
    }, [floorRoomMapping, roomClassMapping]); 



    const handleRoomSelect = (room, clasa) => {
        if (!room || roomList.indexOf(room) === -1 || room in roomClassMapping || selectedRooms.includes(room)) {
            return; 
        }
    
        setRoomClassMapping((prevMapping) => ({
            ...prevMapping,
            [clasa]: room,
        }));
    
        setSelectedRooms((prevSelectedRooms) => [...prevSelectedRooms, room]);
    
        setTimeout(() => {
            setRoomList((prevRoomList) =>
                prevRoomList.filter(
                    (item) => 
                        !selectedRooms.includes(item) && 
                        !Object.values(roomClassMapping).includes(item) 
                )
            );
        }, 0); 
    };
    
    

    const handleTeacherAddClick = () => {
        if (!teacherInput || teacherInput[0] in teachers) return;
        let newTeacherInput = teacherInput.split(',')
        setTeachers((prevMapping) => ({
            ...prevMapping,
            [newTeacherInput[0]]: newTeacherInput[1],
        }));
        setTimeout(() => {
            setTeacherInput('');
        }, 50);
    }

    const handleAddSubjectClick = () => {
        if (!subject || subject in teacherSubjectMapping) return;
        setTchSelectVisible(true);
    }

    const handleTeacherCardClick = (teacher) => {
        setSelectedTeachers((prevSelected) => {
            if (prevSelected.includes(teacher)) {
                return prevSelected.filter((t) => t !== teacher);
            } else {
                return [...prevSelected, teacher];
            }
        });
    };

    const handleAddSubjectAndTeachersClick = () => {
        setTeacherSubjectMapping((prevMapping) => ({
            ...prevMapping,
            [subject]: selectedTeachers,
        }));
        setTchSelectVisible(false)
        setSelectedTeachers([])
        setTimeout(() => {
            setSubject('');
        }, 50);

    }

    const handleClassClick = (clasa) => {
        setSelectedPred()
        setSelectedClass(clasa)
    }

    
    
    
    const handleDelete = (deleteKey) => {
        setCurriculumMapping((prevMapping) => {
            const updatedcc = { ...prevMapping }; 
            delete updatedcc[deleteKey]; 
            return updatedcc; 
        });
    };
    
    const handleCustomClick = (predefined) => {
        setSelectedPred(predefined);
        setCustomPopup(true);
        
    }
    // Example Data
    const handlePredClick = (predefined) => {
        setSelectedPred(predefined);
        
        switch (predefined) {
            case "mi":
                if (selectedClass in curriculumMapping) {
                    handleDelete(selectedClass); 
                }
                setCurriculumMapping((prevMapping) => ({
                    ...prevMapping,
                    [selectedClass]: {
                        "Limba Engleză": 2,
                        "Matematică": 4,
                        "Istorie": 2,
                        "Sport": 2,
                        "Limba Franceza": 2,
                        "Limba Romana": 3,
                        "Religie": 1,
                        "Fizica": 2,
                        "Chimie": 2,
                        "Biologie": 2,
                        "Geografie": 1,
                        "TIC": 2,
                        "Informatica": 3,
                        "Soc-U": 1
                    }
                }));
                break;  
                
                case "sn":
                    if (selectedClass in curriculumMapping) {
                        handleDelete(selectedClass); 
                    }
                    setCurriculumMapping((prevMapping) => ({
                        ...prevMapping,
                        [selectedClass]: {
                            "Limba Engleză": 1,
                            "Matematică": 4,
                            "Istorie": 2,
                            "Sport": 2,
                            "Limba Franceza": 2,
                            "Limba Romana": 3,
                            "Religie": 1,
                            "Fizica": 2,
                            "Chimie": 2,
                            "Biologie": 2,
                            "Geografie": 1,
                            "TIC": 2,
                            "Informatica": 3,
                            "Soc-U": 1
                        }
                    }));
                    break;  
                    
                    case "ss":
                        if (selectedClass in curriculumMapping) {
                            handleDelete(selectedClass); 
                        }
                        setCurriculumMapping((prevMapping) => ({
                            ...prevMapping,
                            [selectedClass]: {
                                "Limba Engleză": 2,
                                "Matematică": 4,
                                "Istorie": 2,
                                "Sport": 2,
                                "Limba Franceza": 3,
                                "Limba Romana": 3,
                                "Religie": 1,
                                "Fizica": 2,
                                "Chimie": 2,
                                "Biologie": 2,
                                "Geografie": 1,
                                "TIC": 2,
                                "Informatica": 3,
                                "Soc-U": 1
                            }
                        }));
                        break;  
                        
                        default:
                            break; 
                        }
                    };
                    
                    const generateTimeSlots = (start, end, interval, breakDuration) => {
                        const slots = [];
                        let [startHour, startMinute] = start.split(':').map(Number);
                        const [endHour, endMinute] = end.split(':').map(Number);
                    
                        let startTotalMinutes = startHour * 60 + startMinute;
                        const endTotalMinutes = endHour * 60 + endMinute;
                    
                        while (startTotalMinutes + interval <= endTotalMinutes) {
                            const endTotalSlotMinutes = startTotalMinutes + interval;
                    
                            const endSlotHour = Math.floor(endTotalSlotMinutes / 60);
                            const endSlotMinute = endTotalSlotMinutes % 60;
                    
                            slots.push(
                                `${String(Math.floor(startTotalMinutes / 60)).padStart(2, '0')}:${String(startTotalMinutes % 60).padStart(2, '0')}-` +
                                `${String(endSlotHour).padStart(2, '0')}:${String(endSlotMinute).padStart(2, '0')}`
                            );
                    
                            startTotalMinutes = endTotalSlotMinutes + breakDuration;
                        }
                        return slots;
                    };
                    
                
                    const handleAddSlots = () => {
                        if (!startTime || !endTime || !schoolHour || selectedDays.length === 0) {
                            alert('Please fill all fields: start time, end time, interval, and selected days.');
                            return;
                        }
                    
                        const interval = parseInt(schoolHour, 10);
                        if (isNaN(interval) || interval <= 0) {
                            alert('Please enter a valid interval in minutes for school hours.');
                            return;
                        }
                    
                        const newMapping = { ...timeSlotsMapping };
                        const newUserMapping = { ...userTimeSlotMapping };
                        selectedDays.forEach(day => {
                            const slots = generateTimeSlots(`${startTime}`, `${endTime}`, parseInt(interval), parseInt(breakTime));
                    
                            slots.forEach(slot => {
                                const key = `${day}:${slot}`;
                                
                                if (!newUserMapping[day] || !newUserMapping[day].includes(slot)) {
                                    newMapping[key] = schoolHour;
                                    setUserTimeslotMapping((prevMapping) => ({
                                        ...prevMapping,
                                        [day]: prevMapping[day] ? [...prevMapping[day], slot] : [slot],
                                    }));
                                } else {
                                    alert(`The time slot ${slot} on ${day} already exists.`);
                                }
                            });
                        });
                    
                        setTimeSlotsMapping(newMapping);
                        setStartTime('');
                        setEndTime('');
                        setSelectedDays([]);
                        setSchoolHour('');
                        setBreakTime(0);
                    };
                    const handleQuirksClassClick = (clasa) => {
                        setSelectedQuirksClass(clasa)
                        
                    }
                    
                    const handleQuirksSubjectClick = (subject) => {
                        setSelectedQuirksSubject(subject)
                    }
                    
                    const handleQuirkAdd = (teacher) => {
                        if(!(`${selectedQuirksClass}, ${selectedQuirksSubject}` in setQuirksJson)) {
                            setQuirksJson((prevMapping) => ({
                                ...prevMapping,
                                [`${selectedQuirksClass}, ${selectedQuirksSubject}`]: [teacher],
                            }));
                        };
                        setTimeout(() => {
                            setSelectedQuirksClass();
                            setSelectedQuirksSubject();
                        }, 50);
                        
                    }
                    
                    
                    const sortTimeSlotsByDay = (timeSlots) => {
                        const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
                        
                        const sortedEntries = Object.entries(timeSlots).sort(([keyA], [keyB]) => {
                            const dayA = keyA.split(':')[0];  
                            const dayB = keyB.split(':')[0];
                            
                            return dayOrder.indexOf(dayA) - dayOrder.indexOf(dayB);
                        });
                        
                        return Object.fromEntries(sortedEntries);
                    };
                    
                    const handleCreateClick = async () => {
                        setLoading(true);
                        const timestamp = new Date().toISOString();
                        const subjects = Object.keys(teacherSubjectMapping);
                        
                        const sortedTimeSlots = sortTimeSlotsByDay(timeSlotsMapping);
                        
                        const finalJson = {
                            "timestamp": timestamp,
                            "school_name": schoolName,
                            "school_hour": schoolHour,
                            "location_room": floorRoomMapping,
                            "levels": classes,
                            "subjects": subjects,
                            "curriculum": curriculumMapping,
                            "preferred_teachers": quirksJson,
                            "teachers": teachers,
                            "specialties": teacherSubjectMapping,
                            "class_rooms": roomClassMapping,
                            "time_slots": sortedTimeSlots
                        };
                        
                        console.log("Sending JSON:", finalJson);
                        
                        try {
                            const idToken = await auth.currentUser.getIdToken(true);
                        
                            const response = await axios.post(`${apiUrl}/solve`, finalJson, {
                                headers: {
                                    Authorization: `Bearer ${idToken}`, 
                                    'Content-Type': 'application/json', 
                                },
                            });
                        
                            if (response.status >= 200 && response.status < 300) {
                                setPopupVisible(true);
                            } else {
                                setError([true, "The data you've submitted is invalid"]);
                            }
                        } catch (error) {
                            setError([true, "There is a problem with the server, please try again later."]);
                        } finally {
                            setLoading(false);
                        }
                    };
                    
                    useEffect(() => {
                        if (selectedSection === "Configuration") {
                            if (
                                schoolHour && schoolHour.trim() !== "" &&
                                schoolName && schoolName.trim() !== "" &&
                                user?.email && 
                                Object.keys(floorRoomMapping).length > 0 && 
                                Array.isArray(classes) && classes.length > 0 && 
                                Object.keys(teacherSubjectMapping).length > 0 && 
                                Object.keys(curriculumMapping).length > 0 && 
                                Object.keys(teachers).length > 0 && 
                                Object.keys(roomClassMapping).length > 0 && 
                                Object.keys(timeSlotsMapping).length > 0 
                            ) {
                                setButtonEnabled(true);
                            } else {
                                setButtonEnabled(false);
                            }
                        }
                    }, [
                        selectedSection,
                        user?.email,
                        floorRoomMapping,
                        classes,
                        teacherSubjectMapping,
                        curriculumMapping,
                        teachers,
                        roomClassMapping,
                        timeSlotsMapping,
                        schoolHour, 
                        schoolName,
                    ]);
                    
                    const handleAddSubjectAndHoursClick = () => {
                        if (!selectedCustomSubject || !numberOfHours || isNaN(numberOfHours)) return;
                    
                        setAlreadyCustomizedSubjects((prevSubjects) => [...prevSubjects, selectedCustomSubject]);
                    
                        setCurriculumMapping((prevMapping) => ({
                            ...prevMapping,
                            [selectedClass]: {
                                ...prevMapping[selectedClass], 
                                [selectedCustomSubject]: parseInt(numberOfHours),
                            },
                        }));
                    
                        setTimeout(() => {
                            setSelectedCustomSubject('');
                            setNumberOfHours('');
                        }, 10);
                    
                        const remainingSubjects = Object.keys(teacherSubjectMapping).filter(
                            (element) => !alreadyCustomizedSubjects.includes(element)
                        );
                        if (remainingSubjects.length == 0) {
                            setTimeout(() => {
                                handleCloseCustomPopup();
                            }, 10);

                        }
                    };

                    const handleCloseCustomPopup = () => {
                            setAlreadyCustomizedSubjects([]);
                            setCustomPopup(false);

                    }
                    
                    const handleCustomSubjectClick = (subject) => {
                        setSelectedCustomSubject(subject);
                    };


                    const renderContent = () => {
                        switch (selectedSection) {
                            case "Configuration":
                                return (
                                    <div className='flex flex-col items-center justify-center '>
                    <span className='text-black text-2xl font-bold'>Welcome</span>
                    <span className='text-black'>On this page, you'll set up your timetable</span>
                    <span className='text-black'>After completing all info, come back here and click on create</span>
                    <span className='text-black'>It is mandatory to complete the steps in the order shown in the sidebar (top to bottom)</span>

                    <div className='mt-10 flex flex-row gap-6 items-center justify-center '>
                        <div className='flex flex-col items-center gap-2'>
                        <span className='text-black text-xs'>Enter the school's name</span>
                        <input
                            type="text"
                            value={schoolName}
                            onChange={(e) => setSchoolName(e.target.value)}
                            placeholder="School Name"
                            className="rounded-md text-black bg-white p-2 w-60 focus:outline-none placeholder-gray "
                            />
                        </div>
                        <div className='flex flex-col items-center gap-2'>
                        <span className='text-black text-xs'>Enter the school's hour duration</span>

                            <input
                            type="number"
                            value={schoolHour}
                            onChange={(e) => setSchoolHour(e.target.value)}
                            placeholder="School Hour"
                            className="rounded-md text-black bg-white p-2 w-60 focus:outline-none placeholder-gray "
                            />
                        </div>

                    </div>
                    <button
                    className={`w-40 h-10 rounded-xl mt-10 ${
                        buttonEnabled ? 'bg-blue-500' : 'bg-gray-300 cursor-not-allowed'
                    }`}
                    onClick={handleCreateClick}
                    disabled={!buttonEnabled}
                    >
                 {loading ? 'Loading...' : 'Create'}
                    </button>
            </div>
          );
          case "Locations":
              return (
                  <div className='h-full'>
                <div className='flex flex-col items-center  h-1/2'>
                    <span className='text-black text-2xl font-bold'>Locations</span>
                    <span className='text-black'>Make a list with locations in your school.</span>
                    <span className='text-black'>You will have to set up at least one floor/building first.</span>
                    <span className='text-black'>After that, input your room names separated by a comma as shown..</span>

                    <div className='mt-10 flex items-center flex-row'>
                        <input
                            type="text"
                            value={addFloorInput}
                            onChange={(e) => setAddFloorInput(e.target.value)}
                            placeholder="Floor/Building Name"
                            className="rounded-l-md text-black bg-white p-2 w-60 focus:outline-none placeholder-gray"
                        />
                        <button onClick={handleAddFloorClick} className='bg-white w-20 h-10 text-blue-500 rounded-r-md'>Add</button>
                    </div>
                    {mapVisible && (
                        <div className='mt-2 flex items-center flex-row'>
                            <input
                                type="text"
                                value={rooms}
                                onChange={(e) => setRooms(e.target.value)}
                                placeholder="Room 1,Room 2,"
                                className="rounded-l-md text-black bg-white p-2 w-60 focus:outline-none placeholder-gray"
                            />
                            <button onClick={handleAddRoomsClick} className='bg-white w-20 h-10 text-blue-500 rounded-r-md'>Add </button>
                        </div>
                    )}

                   
                </div>
                <div className='flex flex-wrap gap-2 '>
                {floorRoomMapping && (
                        Object.entries(floorRoomMapping).map(([floor, rooms]) => (
                            <div key={floor} className="mt-10 text-black bg-white rounded-xl  flex flex-col items-center p-8">
                              <h3 className="text-lg font-bold">{floor}</h3>
                              <ul className="list-disc ml-5">
                                {rooms.map((room, index) => (
                                  <li key={index}>{room}</li>
                                ))}
                              </ul>
                            </div>
                          ))
                    )}
                    </div>
                </div>
            );
        case "Class Rooms":
          return(
            <div className='h-full'>
            <div className='flex flex-col items-center  h-1/2'>
                <span className='text-black text-2xl font-bold'>Class Rooms</span>
                <span className='text-black'>Make a list with class names.</span>
                <span className='text-black'>For example: IX-A, IX-B</span>

                <div className='mt-10 flex items-center flex-row'>
                    <input
                        type="text"
                        value={classInput}
                        onChange={(e) => setClassInput(e.target.value)}
                        placeholder="Class Name to add"
                        className="rounded-l-md text-black bg-white p-2 w-60 focus:outline-none placeholder-gray"
                    />
                    <button onClick={handleAddClassClick} className='bg-white w-20 h-10 text-blue-500 rounded-r-md'>Add</button>
                </div>

               
            </div>
            <div className='flex flex-wrap gap-2 '>
            {classes && (
                    classes.map((clasa) => (
                        <div key={clasa} className="mt-10 text-black bg-white rounded-xl  flex flex-col items-center p-8">
                          <h3 className="text-lg font-bold">{clasa}</h3>
                          <ul className="list-disc ml-5">
                          </ul>
                        </div>
                      ))
                )}
                </div>
            </div>
          )
        case "Mapping":
          return(
            <div className='h-full'>
            <div className='flex flex-col items-center '>
                <span className='text-black text-2xl font-bold'>Class Mapping</span>
                <span className='text-black'>Here, you will have to map each class to a location (room)</span>
                <span className='text-black'>Each class should have an available room</span>
                <span className={mapStatus[0] == false ? "text-red-500" : "text-black"} >{mapStatus[0] == false ? mapStatus[1] : "Ready"}</span>

            </div>
            <div className='flex flex-col flex-wrap gap-4 mt-10'>
            {mapStatus[0] && classes && (
                    classes.map((clasa) => (
                        <div key={clasa} className=" text-black flex items-center gap-2">
                          <h3 className="text-xl font-bold">{clasa}: </h3>
                          {clasa in roomClassMapping && (
                            <span>{roomClassMapping[clasa]}</span>
                          )}
                          {!(clasa in roomClassMapping) && (
                          <select
                                onChange={(e) => handleRoomSelect(e.target.value, clasa)}
                                className="bg-white rounded-md p-2 focus:outline-none"
                                >
                                <option value="">Select a room</option>
                                {roomList.map((room, index) => (
                                    <option key={index} value={room}>
                                    {room}
                                    </option>
                                ))}
                                </select>
                          )}
                        </div>
                      ))
                )}
                </div>
            </div>
          )
        case "Teachers":
          return (
            <div className='h-full'>
            <div className='flex flex-col items-center  h-1/2'>
                <span className='text-black text-2xl font-bold'>Teachers</span>
                <span className='text-black font-bold'>Add teachers here. Please follow the format</span>
                <span className='text-black'>Add their name and their working hours separated by a comma.</span>


                <div className='mt-6 flex items-center flex-row'>
                    <input
                        type="text"
                        value={teacherInput}
                        onChange={(e) => setTeacherInput(e.target.value)}
                        placeholder="John Doe,40"
                        className="rounded-l-md text-black bg-white p-2 w-60 focus:outline-none placeholder-gray"
                    />
                    <button onClick={handleTeacherAddClick} className='bg-white w-20 h-10 text-blue-500 rounded-r-md'>Add</button>
                </div>

               
            </div>
            <div className='flex flex-wrap gap-2 '>
            {teachers && (
                     Object.entries(teachers).map(([teacher, workingHours]) => (
                        <div key={teacher} className="mt-10 text-black bg-white rounded-xl  flex flex-col items-center p-8">
                            <div className='flex flex-row items-center  gap-2'>
                                <FaChalkboardTeacher className='w-5 h-5'/>
                          <h3 className="text-lg font-bold">{teacher}</h3>
                            </div>
                          <span>{workingHours} hrs/week</span>
                          <ul className="list-disc ml-5">
                          </ul>
                        </div>
                      ))
                )}
                </div>
            </div>
          )
        case "Subjects + Specialities":
            return (
                <div className='h-full'>
                <div className='flex flex-col items-center  h-2/3'>
                    <span className='text-black text-2xl font-bold'>Subjects / Specialities</span>
                    <span className='text-black'>Here you will set up subjects in your school along with choosing who teaches them.</span>
                    <span className='text-black'>Please enter a subject first..</span>

                    <div className='mt-10 flex items-center flex-row'>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Subject Name"
                            className="rounded-l-md text-black bg-white p-2 w-60 focus:outline-none placeholder-gray"
                        />
                        <button onClick={handleAddSubjectClick} className='bg-white w-20 h-10 text-blue-500 rounded-r-md'>Add</button>
                    </div>
                    {teachers && tchSelectVisible && (
                        <div className='mt-10'>
                            <div className='flex flex-col text-center'>

                            <span className='text-black'>Click on teachers that teach {subject}</span>
 
                            <div className='flex flex-wrap gap-4 justify-center'>
                     {Object.entries(teachers).map(([teacher, workingHours]) => (
                    <motion.div
                    key={teacher}
                    className="mt-10 text-black bg-white rounded-xl flex flex-col items-center p-8 cursor-pointer"
                    style={{
                        backgroundColor: selectedTeachers.includes(teacher) ? 'rgb(59 130 246)' : 'rgb(255,255,255)'  // Check if teacher is selected
                    }}
                    whileHover={{
                        backgroundColor: 'rgb(59 130 246)'  // Blue when hovering over the card
                    }}
                    onClick={() => handleTeacherCardClick(teacher)} 
                >
                    <div className='flex flex-row items-center gap-2'>
                        <FaChalkboardTeacher className='w-5 h-5'/>
                        <h3 className="text-lg font-bold">{teacher}</h3>
                    </div>
                    <span>{workingHours} hrs/week</span>
                    <ul className="list-disc ml-5"></ul>
                </motion.div>
                      ))}
                      
                      </div>
                      <span className='text-blue-500 mt-10 cursor-pointer font-black'
                            onClick={() => handleAddSubjectAndTeachersClick()}
                            >Once done, click here</span>
                        </div>
                        </div>
                )}


                </div>
                <div className='flex flex-wrap gap-2 text-sm'>
                        {teacherSubjectMapping && (
                                Object.entries(teacherSubjectMapping).map(([subject, teachers]) => (
                                    <div key={subject} className="mt-10 text-black bg-white rounded-xl  flex flex-col items-center p-4">
                                    <h3 className="text-lg font-bold">{subject}</h3>
                                    <ul className="list-disc ml-5">
                                        {teachers.map((teachers, index) => (
                                        <li key={index}>{teachers}</li>
                                        ))}
                                    </ul>
                                    </div>
                                ))
                            )}
                            </div>
                </div>
            );
        case "Curriculum":
            if(customPopup) {
                return (
                    <div className='h-full'>
                    <div className='flex flex-col items-center  h-1/2'>
                        <span className='text-black text-2xl font-bold'>Custom Curriculum for class {selectedClass}</span>
                        <span className='text-black'>For each subject, you will have to set a number of hours.</span>
                        <span className='text-black'>Please select a subject first</span>
                        <span className='text-red-500 text-sm cursor-pointer'
                        onClick={handleCloseCustomPopup}
                        >Click here to close</span>
                        <div className='flex flex-wrap gap-4 '>
                         {teacherSubjectMapping && 
                         (

                        Object.keys(teacherSubjectMapping).filter(element => !alreadyCustomizedSubjects.includes(element)).map((subject) => (
                            <motion.div key={subject} className="mt-10 text-black bg-white rounded-xl  flex flex-col items-center p-8 cursor-pointer"
                            onClick={() => handleCustomSubjectClick(subject)}
                            style={{
                                backgroundColor: selectedCustomSubject == subject ? 'rgb(59 130 246)' : 'rgb(255,255,255)'  
                            }}
                            whileHover={{
                                backgroundColor: 'rgb(59 130 246)'  
                            }}
                            >
                              <h3 className="text-lg font-bold">{subject}</h3>
                              <ul className="list-disc ml-5">
                              </ul>
                            </motion.div>
                          ))
                    )}
                    </div>
                    {selectedCustomSubject && (
                        <div className='mt-10 flex flex-col items-center'>
                            <span className='text-black font-bold'>Input a number of hours</span>
                            <div className='mt-4 flex items-center justify-center flex-col gap-5'>
                                <input
                                type="number"
                                value={numberOfHours}
                                onChange={(e) => setNumberOfHours(e.target.value)}
                                placeholder="5"
                                className="rounded-md text-black bg-white p-2 w-20 focus:outline-none placeholder-gray"
                            />
                            <button onClick={handleAddSubjectAndHoursClick} className='bg-white w-20 h-10 text-blue-500 rounded-r-md'>Add</button>
                            </div>
                        </div>
                    )}
                     </div>
                     <div className='flex flex-wrap gap-2 text-xs mt-4'>
                            {curriculumMapping && (
                                    Object.entries(curriculumMapping).map(([className, subjects]) => (
                                        <div key={className} className="mt-10 text-black bg-white rounded-xl  flex flex-col items-center p-4">
                                        <h3 className="text-lg font-bold">{className}</h3>
                                        <ul className="list-disc ml-5">
                                            {Object.entries(subjects).map(([subject, hours], index) => (
                                            <li key={subject}>{subject}: {hours}</li>
                                            ))}
                                        </ul>
                                        </div>
                                    ))
                                )}
                                </div>
                    </div>
                )
            } else {
            return (
                <div className='h-full'>
                <div className='flex flex-col items-center  h-1/2'>
                    <span className='text-black text-2xl font-bold'>Curriculum</span>
                    <span className='text-black'>For each class, you will have to set a number of hours for each subject.</span>
                    <span className='text-black'>Please select a class first..</span>
                    <div className='flex flex-wrap gap-4 '>
                     {classes && (
                    classes.map((clasa) => (
                        <motion.div key={clasa} className="mt-10 text-black bg-white rounded-xl  flex flex-col items-center p-8 cursor-pointer"
                        onClick={() => handleClassClick(clasa)}
                        style={{
                            backgroundColor: selectedClass == clasa ? 'rgb(59 130 246)' : 'rgb(255,255,255)'  
                        }}
                        whileHover={{
                            backgroundColor: 'rgb(59 130 246)' 
                        }}
                        >
                          <h3 className="text-lg font-bold">{clasa}</h3>
                          <ul className="list-disc ml-5">
                          </ul>
                        </motion.div>
                      ))
                )}
                </div>
                {selectedClass && (
                    <div className='mt-10 flex flex-col items-center'>
                        <span className='text-black font-bold'>Select a predefined option</span>
                        <div className='mt-4 flex flex-row gap-5'>
                            <motion.div className='h-20 w-44 bg-white rounded-xl flex items-center justify-center cursor-pointer'
                            onClick={() => handlePredClick("mi")}
                            style={{
                                backgroundColor: selectedPred == "mi" ? 'rgb(59 130 246)' : 'rgb(255,255,255)' 
                            }}
                            whileHover={{
                                backgroundColor: 'rgb(59 130 246)' 
                            }}
                            >
                                <span className='text-black font-black'>Mate-Info</span>
                            </motion.div>
                            <motion.div className='h-20 w-44 bg-white rounded-xl flex items-center justify-center cursor-pointer'
                            onClick={() => handlePredClick("sn")}
                            style={{
                                backgroundColor: selectedPred == "sn" ? 'rgb(59 130 246)' : 'rgb(255,255,255)' 
                            }}
                            whileHover={{
                                backgroundColor: 'rgb(59 130 246)' 
                            }}
                            >
                                <span className='text-black font-black'>Stiinte ale Naturii</span>
                            </motion.div>
                            <motion.div className='h-20 w-44 bg-white rounded-xl flex items-center justify-center cursor-pointer'
                            onClick={() => handlePredClick("ss")}
                            style={{
                                backgroundColor: selectedPred == "ss" ? 'rgb(59 130 246)' : 'rgb(255,255,255)' 
                            }}
                            whileHover={{
                                backgroundColor: 'rgb(59 130 246)'  
                            }}
                            >
                                <span className='text-black font-black'>Stiinte Sociale</span>
                            </motion.div>

                            <motion.div className='h-20 w-44 bg-white rounded-xl flex items-center justify-center cursor-pointer'
                            onClick={() => handleCustomClick("custom")}
                            style={{
                                backgroundColor: selectedPred == "custom" ? 'rgb(59 130 246)' : 'rgb(255,255,255)'  
                            }}
                            whileHover={{
                                backgroundColor: 'rgb(59 130 246)'  
                            }}
                            >
                                <span className='text-black font-black'>Custom</span>
                            </motion.div>
                        </div>
                    </div>
                )}
                 </div>
                 <div className='flex flex-wrap gap-2 text-xs'>
                        {curriculumMapping && (
                                Object.entries(curriculumMapping).map(([className, subjects]) => (
                                    <div key={className} className="mt-10 text-black bg-white rounded-xl  flex flex-col items-center p-4">
                                    <h3 className="text-lg font-bold">{className}</h3>
                                    <ul className="list-disc ml-5">
                                        {Object.entries(subjects).map(([subject, hours], index) => (
                                        <li key={subject}>{subject}: {hours}</li>
                                        ))}
                                    </ul>
                                    </div>
                                ))
                            )}
                            </div>
                </div>
            );       
        } 
        case "Time Slots":
            return (
        <div className="h-full bg-gray-100  rounded-md">
            <div className="flex flex-col items-center">

                <span className='text-black text-2xl font-bold'>Time Slots Setup</span>
                        <span className='text-black mb-10'>Configure school hours and break times easily.</span>

                <div className="mb-6">
                    <label className="text-xl text-black mb-2">Select Days</label>
                    <div className="flex gap-4">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                            <label key={day} className="flex items-center text-black">
                                <input
                                    type="checkbox"
                                    value={day}
                                    checked={selectedDays.includes(day)}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setSelectedDays(prev =>
                                            e.target.checked
                                                ? [...prev, value]
                                                : prev.filter(d => d !== value)
                                        );
                                    }}
                                    className="mr-2"
                                />
                                {day}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="mb-6 w-full">
                    <div className="mb-4 flex justify-between">
                        <label className="text-black text-xl">Start Time</label>
                        <label className="text-black text-xl">End Time</label>
                    </div>
                    <div className="flex justify-between gap-6">
                        <input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full text-black bg-white p-2 rounded-md focus:outline-none"
                        />
                        <input
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="w-full text-black bg-white p-2 rounded-md focus:outline-none"
                        />
                    </div>
                </div>

                <div className="mb-6 w-full">
                    <div className="mb-4 flex justify-between">
                    </div>
                    <div className="flex flex-col justify-center items-center gap-2">
                    <label className="text-black text-xl">Break Time (minutes)</label>

                        <input
                            type="number"
                            value={breakTime}
                            onChange={(e) => setBreakTime(e.target.value)}
                            className="w-1/5 text-black bg-white p-2 rounded-md focus:outline-none"
                            placeholder="e.g., 10"
                        />
                    </div>
                </div>

                <button
                    onClick={handleAddSlots}
                    className="bg-blue-500 text-white py-3 px-10 rounded-lg hover:bg-blue-600 transition duration-300">
                    Add Time Slots
                </button>
            </div>

            <div className="mt-8 flex flex-wrap gap-4 justify-center">
            {userTimeSlotMapping &&
                Object.entries(userTimeSlotMapping)
                    .sort(([dayA], [dayB]) => {
                    const daysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
                    return daysOrder.indexOf(dayA) - daysOrder.indexOf(dayB);
                    })
                    .map(([day, slots]) => {
                    return (
                        <div key={day} className="bg-white text-black p-4 rounded-lg shadow-md w-64">
                        <h3 className="font-bold"> {day} - {slots.length} Hours</h3>
                        <span>Interval: {slots[0].split('-')[0]}-{slots[slots.length-1].split("-")[1]}</span>
                        </div>
                    );
                    })}
            </div>
        </div>
    );
        case "Quirks":
            return (
                <div className='h-full'>
                <div className='flex flex-col items-center  h-5/6'>
                    <span className='text-black text-2xl font-bold'>Quirks</span>
                    <span className='text-black'>You can set up preferred teachers for each class.</span>
                    <span className='text-black'>Please select a class first.</span>
                    <div className='flex flex-wrap gap-4 '>
                     {classes && (
                    classes.map((clasa) => (
                        <motion.div key={clasa} className="mt-10 text-black bg-white rounded-xl  flex flex-col items-center p-8 cursor-pointer"
                        onClick={() => handleQuirksClassClick(clasa)}
                        style={{
                            backgroundColor: selectedQuirksClass == clasa ? 'rgb(59 130 246)' : 'rgb(255,255,255)'  
                        }}
                        whileHover={{
                            backgroundColor: 'rgb(59 130 246)'  
                        }}
                        >
                          <h3 className="text-lg font-bold">{clasa}</h3>
                          <ul className="list-disc ml-5">
                          </ul>
                        </motion.div>
                      ))
                )}
                </div>
                {selectedQuirksClass && (
                    <div className='mt-10 flex flex-col items-center'>
                        <span className='text-black font-bold'>Select a Subject</span>
                        <div className='mt-4 flex flex-wrap items-center justify-center gap-5'>                  
                        {curriculumMapping && (
                                Object.entries(curriculumMapping[selectedQuirksClass]).map(([subject, hours]) => (
                                    <motion.div
                                    key={subject}
                                    className="h-10 w-40 bg-white rounded-xl flex items-center justify-center cursor-pointer text-black"
                                    onClick={() => handleQuirksSubjectClick(subject)}
                                    style={{
                                        backgroundColor: selectedQuirksSubject == subject ? 'rgb(59 130 246)' : 'rgb(255,255,255)'  
                                    }}
                                    whileHover={{
                                        backgroundColor: 'rgb(59 130 246)'  
                                    }}
                                    >
                                    <span>{subject}</span>
                                    </motion.div>
                                ))
                                )}

                    
                        </div>
                    </div>
                )}
                 {selectedQuirksSubject && (
                    <div className='mt-10 flex flex-col items-center'>
                        <span className='text-black font-bold'>Select a Teacher</span>
                        <div className='mt-4 flex flex-wrap items-center justify-center gap-5'>                  
                        {teachers && (
                                Object.entries(teachers).map(([teacher, workingHours]) => (
                                    <div key={teacher} className="h-10 w-max p-4 bg-white rounded-xl flex items-center justify-center cursor-pointer text-black"
                                    onClick={() => handleQuirkAdd(teacher)}
                                    >
                                        <div className='flex flex-row items-center  gap-2'>
                                    <h3 className="text-lg font-bold">{teacher}</h3>
                                        </div>
                                    </div>
                                ))
                            )}

                    
                        </div>
                    </div>
                )}
                 </div>
                 <div className='flex flex-wrap gap-2 text-xs'>
                        {quirksJson && (
                            Object.entries(quirksJson).map(([classAndSubject, teacher]) => (
                                <div key={teacher} className="h-10 w-max p-4 bg-white rounded-xl flex items-center justify-center cursor-pointer text-black"
                                onClick={() => handleQuirkAdd(teacher)}
                                >
                                <h3 className="text-xs font-medium">{classAndSubject} - {teacher[0]}</h3>
                                </div>
                                ))
                        )}
                            </div>
                </div>
            );        
        default:
          return <p>Select a section to view content.</p>;
      }
    };
  
    return (
        <div className="h-screen w-screen flex flex-col relative">
          <div className="flex-grow mx-10 my-20">
            <div className="h-[calc(100vh-120px)] w-full bg-white rounded-xl bg-opacity-40 shadow-lg flex flex-row overflow-hidden">
              <div className="w-1/4 flex flex-col">
                {sidebarItems.map(({ icon: Icon, label }, index) => (
                  <motion.div
                    key={label}
                    onClick={() => setSelectedSection(label)}
                    initial={{ backgroundColor: "rgb(255,255,255)" }}
                    whileHover={{ backgroundColor: "rgb(238, 238, 238)" }}
                    animate={{
                      backgroundColor:
                        selectedSection === label
                          ? "rgb(238, 238, 238)"
                          : "rgb(255, 255, 255)",
                    }}
                    transition={{
                      duration: 0.1,
                      ease: "easeInOut",
                    }}
                    className={`cursor-pointer h-[calc(100%/9)] flex flex-row p-4 items-center gap-3 shadow ${
                      index === 0 ? "rounded-tl-xl" : ""
                    } ${index === 8 ? "rounded-bl-xl" : ""}`}
                  >
                    <Icon className="invert w-5 h-5" />
                    <span className="text-md text-black font-medium">{label}</span>
                  </motion.div>
                ))}
              </div>
    
              <div className="w-3/4 bg-gray-100 rounded-r-xl p-6">
                {renderContent()}
              </div>
            </div>
          </div>
    
          {popupVisible && (
            <>
              <motion.div
                className="fixed inset-0 bg-black bg-opacity-50 z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setPopupVisible(false)}
              />
    
              <motion.div
                className="fixed inset-0 flex items-center justify-center z-20"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={popupVariants}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white p-6 rounded-lg shadow-lg w-1/3 text-black">
                  <h2 className="text-lg font-bold mb-4">Done!</h2>
                  <p className="mb-6">
                  Your timetable has been successfully uploaded to the server. The system will now process and create it, which may take around 5 minutes depending on its complexity.</p>
                  <button
                    onClick={() =>  navigate('/dashboard')}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    Back to dashboard
                  </button>
                </div>
              </motion.div>
            </>
          )}
           {error[0] && (
            <>
              <motion.div
                className="fixed inset-0 bg-black bg-opacity-50 z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setPopupVisible(false)}
              />
    
              <motion.div
                className="fixed inset-0 flex items-center justify-center z-20"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={popupVariants}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white p-6 rounded-lg shadow-lg w-1/3 text-black">
                  <h2 className="text-lg font-bold mb-4">Error 😔</h2>
                  <p className="mb-6">
                  We've encountered an error when trying to create your timetable <br /><span className='text-red-500'>{error[1]}</span></p>
                  <button
                    onClick={() =>  setError([false])}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    Try again
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </div>
      );
  };
  
  export default Create;