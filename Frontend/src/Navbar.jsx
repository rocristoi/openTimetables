import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react'
import navLogo from './assets/logo_small.png';

const Navbar = ({setRegisterVisible}) => {
    const [hasScrolledPast, setHasScrolledPast] = useState(false);
    const breakpoint = 10;
    const handleButtonClick = () => {
        setRegisterVisible(true);
      };
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
      
    useEffect(() => {
        const handleScroll = () => {
          if (window.scrollY > breakpoint) {
            setHasScrolledPast(true);
          } else {
            setHasScrolledPast(false);
          }
        };
    
        window.addEventListener('scroll', handleScroll);
        return () => {
          window.removeEventListener('scroll', handleScroll);
        };
      }, []);



      if(isMobile) {
        return (
          <motion.nav className={"transition-all w-full flex flex-row justify-center items-center items-center h-24 fixed top-0 z-50 px-10"}
          style={{
            backgroundColor: hasScrolledPast ? 'rgb(255, 248, 225)' : 'transparent', 
          }}
          transition={{
            backgroundColor: { duration: 0.5, ease: 'easeInOut' }, 
          }}
          >
              <div className='flex flex-row items-center justify-between w-[1200px]'>
          <div className="flex flex-row items-center">
              <img
              src={navLogo}
              alt="logo"
              className="w-20 h-20 object-contain"
              />

          </div>
                      <div className='flex flex-row gap-4'>
                      <div className="text-blue-500 flex flex-row justify-center items-center gap-10 ">
          

                      </div>
                      <div className="text-amber-50 flex flex-row justify-center items-center gap-10 ">
                         <a href="/register"> <motion.button className='h-10 w-24 bg-blue-500 flex flex-row justify-center items-center rounded-full'
                          whileHover={{scale: 1.05}}
                          whileTap={{scale: 0.99}}
                          >
                          <span className='font-bold text-[15px]'>REGISTER</span>
                          </motion.button></a>

                      </div>
                      </div>
                      </div>
                      </motion.nav>
        )
      } else {
        return (
          <motion.nav className={"transition-all w-full flex flex-row justify-center items-center items-center h-24 fixed top-0 z-50"}
          style={{
            backgroundColor: hasScrolledPast ? 'rgb(255, 248, 225)' : 'transparent', 
          }}
          transition={{
            backgroundColor: { duration: 0.5, ease: 'easeInOut' }, 
          }}
          >
              <div className='flex flex-row items-center justify-between w-[1200px]'>
          <div className="flex flex-row items-center">
              <img
              src={navLogo}
              alt="logo"
              className="w-20 h-20 object-contain"
              />

          </div>
                      <div className='flex flex-row gap-4'>
                      <div className="text-blue-500 flex flex-row justify-center items-center gap-10 ">
                         <a href="/dashboard"> <motion.button className='h-10 w-48 bg-transparent border border-blue-500 flex flex-row justify-center items-center rounded-full'
                          whileHover={{scale: 1.05}}
                          whileTap={{scale: 0.99}}
                          >
                          <span className='font-bold'>OPEN DASHBOARD</span>
                          </motion.button></a>

                      </div>
                      <div className="text-amber-50 flex flex-row justify-center items-center gap-10 ">
                         <a href="/register"> <motion.button className='h-10 w-28 bg-blue-500 flex flex-row justify-center items-center rounded-full'
                          whileHover={{scale: 1.05}}
                          whileTap={{scale: 0.99}}
                          >
                          <span className='font-bold'>REGISTER</span>
                          </motion.button></a>

                      </div>
                      </div>
                      </div>
                      </motion.nav>


)
      }
 
}

export default Navbar