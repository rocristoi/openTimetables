import SectionWrapper from "./hoc/SectionWrapper"
import { styles } from "./styles"
import animVideo from "./assets/output.webm"
import { motion, useMotionTemplate, useMotionValue } from "framer-motion"
import { useState, useEffect } from "react";
import { fadeIn, textVariant } from "./utils/motion";


const Landing = () => {
    const [hovered, setHovered] = useState(false);
    const [hovered1, setHovered1] = useState(false);
    const [hovered2, setHovered2] = useState(false);
    const [hovered3, setHovered3] = useState(false);
    const [hovered4, setHovered4] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      const checkMobile = () => {
        if (window.innerWidth <= 768) {
          setIsMobile(true); 
        } else {
          setIsMobile(false);
        }
      };
  
      checkMobile();
  
      window.addEventListener('resize', checkMobile);
  
      return () => {
        window.removeEventListener('resize', checkMobile);
      };
    }, []); 

   
    return(
    <div>
        <div className="flex flex-col items-center justify-center text-center ">
        <span className={`bg-gradient-to-r from-slate-900 to-blue-500 bg-clip-text text-transparent lg:mt-0 mt-10 ${styles.heroHeadText}`}>A timetable for all</span>
        <span className={`${styles.heroSubText} lg:px-24 px-10 text-black`}>Open Timetables is a free tool for creating school schedules tailored to Central and Eastern Europe's education system.</span>
        <div className="lg:mt-0 lg:mb-0 mt-20 mb-40">
            <video
                autoPlay
                loop
                muted
                playsInline
                className="transparent-video"
            >
                <source src={animVideo} type="video/webm" />
                Your browser does not support the video tag.
            </video>
        </div>
        </div>
        <div className="flex flex-col items-center justify-center text-center">
        <span className={`text-blue-500  ${styles.heroHeadText}`}>How it works?</span>

        {!isMobile && (
            <div className="mt-20 flex flex-wrap gap-10 justify-center ">
            <motion.div
            className="bg-white h-[250px] w-[450px] rounded-xl shadow-xl flex items-start text-start p-10 flex flex-col cursor-pointer"
            initial={{ backgroundColor: "rgb(255, 255, 255)" }}
            animate={{
              backgroundColor: hovered ? "rgb(59, 130, 246)" : "rgb(255, 255, 255)",
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            variants={fadeIn("right", "spring", 1, 0.75)}
          >
            <motion.span
              className="bg-gradient-to-r from-blue-500 to-slate-900 bg-clip-text text-transparent font-bold lg:text-[30px] sm:text-[26px] xs:text-[20px] text-[16px]"
              animate={{
                color: hovered ? "white" : "transparent",
              }}
              transition={{ duration: 0.3 }}
            >
              #1 Register
            </motion.span>
            <motion.span
              className="text-black font-medium"
              animate={{
                color: hovered ? "white" : "black",
              }}
              transition={{ duration: 0.3 }}
            >
              Create an account on our platform, it's completely free. By creating an account, we can store your data securely. Don't worry, it's fast & easy!
            </motion.span>
          </motion.div>

          <motion.div
            className="bg-white h-[250px] w-[250px] rounded-xl shadow-xl flex flex-col items-center py-10 px-6 cursor-pointer"
            initial={{ backgroundColor: "rgb(255, 255, 255)" }}
            animate={{
              backgroundColor: hovered1 ? "rgb(59, 130, 246)" : "rgb(255, 255, 255)",
            }}
            onMouseEnter={() => setHovered1(true)}
            onMouseLeave={() => setHovered1(false)}
          >
            <motion.span
              className="text-blue-500 font-bold text-[30px]"
              animate={{
                color: hovered1 ? "white" : "",
              }}
              transition={{ duration: 0.3 }}
            >
              #2
            </motion.span>
            <motion.span
              className="text-black font-bold"
              animate={{
                color: hovered1 ? "white" : "black",
              }}
              transition={{ duration: 0.3 }}
            >
              Enter your data
            </motion.span>
            <motion.span
              className="text-black font-medium mt-2"
              animate={{
                color: hovered1 ? "white" : "black",
              }}
              transition={{ duration: 0.3 }}
            >
              School Name
            </motion.span>
            <motion.span
              className="text-black font-medium"
              animate={{
                color: hovered1 ? "white" : "black",
              }}
              transition={{ duration: 0.3 }}
            >
              Teacher Names
            </motion.span>
            <motion.span
              className="text-black font-medium"
              animate={{
                color: hovered1 ? "white" : "black",
              }}
              transition={{ duration: 0.3 }}
            >
              And others...
            </motion.span>
          </motion.div>

          <motion.div
            className="bg-white h-[250px] w-[250px] rounded-xl shadow-xl flex flex-col items-center py-10 px-10 cursor-pointer"
            initial={{ backgroundColor: "rgb(255, 255, 255)" }}
            animate={{
              backgroundColor: hovered2 ? "rgb(59, 130, 246)" : "rgb(255, 255, 255)",
            }}
            onMouseEnter={() => setHovered2(true)}
            onMouseLeave={() => setHovered2(false)}
          >
            <motion.span
              className="text-blue-500 font-bold text-[30px]"
              animate={{
                color: hovered2 ? "white" : "",
              }}
              transition={{ duration: 0.3 }}
            >
              #3
            </motion.span>
            <motion.span
              className="text-black font-bold"
              animate={{
                color: hovered2 ? "white" : "black",
              }}
              transition={{ duration: 0.3 }}
            >
              Submit Your Data
            </motion.span>
            <motion.span
              className="text-black font-medium mt-2"
              animate={{
                color: hovered2 ? "white" : "black",
              }}
              transition={{ duration: 0.3 }}
            >
              Sit back and relax while the computer works
            </motion.span>
          </motion.div>

          <motion.div
            className="bg-white h-[220px] w-[450px] rounded-xl shadow-xl flex items-start text-start p-10 flex flex-col cursor-pointer"
            initial={{ backgroundColor: "rgb(255, 255, 255)" }}
            animate={{
              backgroundColor: hovered3 ? "rgb(59, 130, 246)" : "rgb(255, 255, 255)",
            }}
            onMouseEnter={() => setHovered3(true)}
            onMouseLeave={() => setHovered3(false)}
          >
            <motion.span
              className="bg-gradient-to-r from-blue-500 to-slate-900 bg-clip-text text-transparent font-bold lg:text-[30px] sm:text-[26px] xs:text-[20px] text-[16px]"
              animate={{
                color: hovered3 ? "white" : "transparent",
              }}
              transition={{ duration: 0.3 }}
            >
              #4 Get Timetables
            </motion.span>
            <motion.span
              className="text-black font-medium"
              animate={{
                color: hovered3 ? "white" : "black",
              }}
              transition={{ duration: 0.3 }}
            >
              Our system generates timetables for each class, each professor and one for the whole school. You can use our design or export your data to a PDF and create your own ones.
            </motion.span>
          </motion.div>

          <motion.div
            className="bg-white h-[220px] w-[540px] rounded-xl shadow-xl flex items-start text-start p-10 flex flex-col cursor-pointerx"
            initial={{ backgroundColor: "rgb(255, 255, 255)" }}
            animate={{
              backgroundColor: hovered4 ? "rgb(59, 130, 246)" : "rgb(255, 255, 255)",
            }}
            onMouseEnter={() => setHovered4(true)}
            onMouseLeave={() => setHovered4(false)}
          >
            <motion.span
              className="bg-gradient-to-r from-blue-500 to-slate-900 bg-clip-text text-transparent font-bold lg:text-[30px] sm:text-[26px] xs:text-[20px] text-[16px]"
              animate={{
                color: hovered4 ? "white" : "transparent",
              }}
              transition={{ duration: 0.3 }}
            >
              #5 Share Them
            </motion.span>
            <motion.span
              className="text-black font-medium"
              animate={{
                color: hovered4 ? "white" : "black",
              }}
              transition={{ duration: 0.3 }}
            >
              Share custom PDFs with the whole high school. Your timetables will be hosted for free on our platform. That's the end. Isn't that easy?
            </motion.span>
          </motion.div>
                
          <div className="flex flex-row items-center justify-evenly text-center mt-20 mb-40 gap-20">
        <motion.span className={`text-blue-500 font-bold  lg:text-[60px] sm:text-[50px] xs:text-[50px] text-[40px] lg:leading-[98px] xs:leading-[58px]`}
        >Ready to start?</motion.span>
        <a href="/register">
        <motion.button className="bg-blue-500 rounded-xl w-60 h-16 text-[20px] font-bold"
        whileHover={{backgroundColor: "rgb(0,0,0)", scale: 1.02}}
        whileTap={{scale: 1}}
        >Get Your Timetable

        </motion.button>

        </a>


        </div>
            </div>
            
        )}

      
        {isMobile && (
          <div className="mt-20 flex flex-col items-center gap-10 justify-center ">
        <div
        className="bg-white h-[220px] w-[350px] rounded-xl shadow-xl flex items-start text-start p-10 flex flex-col cursor-pointer"
      >
        <span
          className="bg-gradient-to-r from-blue-500 to-slate-900 bg-clip-text text-transparent font-bold text-[20px]"
        >
          #1 Register
        </span>
        <span
          className="text-black font-medium"
        >
          Create an account on our platform, it's completely free. By creating an account, we can store your data securely. 
        </span>
      </div>

      <div
        className="bg-white h-[220px] w-[350px] rounded-xl shadow-xl flex items-start text-start p-10 flex flex-col cursor-pointer"
      >
        <span
          className="bg-gradient-to-r from-blue-500 to-slate-900 bg-clip-text text-transparent font-bold text-[20px]"
        >
          #2 Enter your data
        </span>
        <span
          className="text-black font-medium"
        >We need to know info about your high school so our system can generate the perfect timetable. Don't worry - it won't take long. 
        </span>
      </div>

      <div
        className="bg-white h-[220px] w-[350px] rounded-xl shadow-xl flex items-start text-start p-10 flex flex-col cursor-pointer"
      >
        <span
          className="bg-gradient-to-r from-blue-500 to-slate-900 bg-clip-text text-transparent font-bold text-[20px]"
        >
          #3 Submit your data
        </span>
        <span
          className="text-black font-medium"
        >Sit back and relax while the computer works. Your timetable won't take long to generate. It usually takes around 5 minutes.
        </span>
      </div>

    

      <div
        className="bg-white h-[220px] w-[350px] rounded-xl shadow-xl flex items-start text-start p-10 flex flex-col cursor-pointer"
      >
        <span
          className="bg-gradient-to-r from-blue-500 to-slate-900 bg-clip-text text-transparent font-bold text-[20px]"
        >
          #4 Get Timetables
        </span>
        <span
          className="text-black font-medium"
        >
          Our system generates timetables for each class, each professor and one for the whole school. You can export each timetable to a PDF.
        </span>
      </div>

    
      <div className="flex flex-row items-center justify-evenly text-center mt-20 mb-10">
        <a href="/register">
        <motion.button className="bg-blue-500 rounded-lg w-48 h-8 text-[16px] font-bold"
        whileHover={{backgroundColor: "rgb(0,0,0)", scale: 1.02}}
        whileTap={{scale: 1}}
        >Get Your Timetable

        </motion.button>

        </a>


        </div>
          

        </div>
        )}
        
                </div>   
    </div>
    )
}

export default SectionWrapper(Landing, "landing")