import { BrowserRouter, Route, Routes } from 'react-router'
import Landing from './Landing'
import Navbar from './Navbar'
import Footer from './Footer'
import Signup from './Signup'
import Login from './Login'
import Dashboard from './Dashboard'
import { PrivateRoute } from './hoc/PrivateRoute'
import Create from './Create'
import Timetable from './Timetable'


const App = () => {

  return (
      <BrowserRouter>
        <Routes>
          <Route path='/' element={
            <div className={` w-full h-full `}>
              <div className='bg-gradient-to-b from-amber-50 via-amber-50 to-teal-50 '>
            <Navbar/>
            <Landing/>
             </div>
             <div className='bg-gradient-to-b from-teal-50  to-[#FFF8E1]'>
             <Footer />
             </div>
            </div>
            }/>
              <Route path="/register" element={
                <div className='bg-gradient-to-b from-amber-50  to-teal-50 '>
                  <Signup />
                </div>
                
                } />
              <Route path="/login" element={
                <div className='bg-gradient-to-b from-amber-50  to-teal-50 '>
                  <Login />
                </div>
                
                } />
                 <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <div className='bg-gradient-to-b from-amber-50 to-teal-50'>
                      <Dashboard />
                      </div>
                    </PrivateRoute>
                  }
                />
                 <Route
                  path="/dashboard/create"
                  element={
                    <PrivateRoute>
                      <div className='bg-gradient-to-b from-amber-50 to-teal-50'>
                      <Create />
                      </div>
                    </PrivateRoute>
                  }
                  
                />
          <Route
            path="/timetable/:id"
            element={
              <PrivateRoute>
                <div className="bg-gradient-to-b from-amber-50 to-teal-50 min-h-screen h-full">
                  <Timetable />
                </div>
              </PrivateRoute>
            }
          />

        <Route path="/terms" element={
          <div className="bg-gradient-to-b from-amber-50 to-teal-50 min-h-screen p-6 flex flex-col items-center">
              <div className="max-w-4xl w-full bg-white shadow-lg rounded-lg p-8">
                <h1 className="text-3xl font-bold text-blue-500 text-center mb-4">Terms and Conditions</h1>
                <p className="text-sm text-gray-600 text-center mb-6">
                  Last Updated: December 28, 2024
                </p>

                <section className="mb-6">
                  <h2 className="text-xl font-semibold text-blue-500 mb-2">Introduction</h2>
                  <p className="text-gray-700 leading-relaxed">
                    Welcome to <strong>openTimetables</strong>. By using our web app, you agree to comply with these Terms and Conditions. Please read them carefully.
                  </p>
                </section>

                <section className="mb-6">
                  <h2 className="text-xl font-semibold  text-blue-500 mb-2">Data Collection and Use</h2>
                  <p className="text-gray-700 leading-relaxed">
                    We collect and store user-created timetables, passwords, and other relevant data. This data is handled in compliance with the General Data Protection Regulation (GDPR) and Romanian data protection laws. You have the right to access, update, or delete your data at any time.
                  </p>
                </section>

                <section className="mb-6">
                  <h2 className="text-xl font-semibold  text-blue-500 mb-2">User Responsibilities</h2>
                  <p className="text-gray-700 leading-relaxed">
                    Users are responsible for maintaining the security of their accounts and passwords. Do not share sensitive account information with others.
                  </p>
                </section>

                <section className="mb-6">
                  <h2 className="text-xl font-semibold  text-blue-500 mb-2">Disclaimer</h2>
                  <p className="text-gray-700 leading-relaxed">
                    openTimetables is provided on an "as-is" basis. We are not responsible for any loss or damage caused by misuse of our services. <span className='text-red-500'>Please note: this website was developed only by a single person and may present bugs that can cause data leaks. As long as this disclaimer is here, we recommend that you do not share sensitive information on this website. </span>
                  </p>
                </section>

                <footer className="text-center mt-6">
                  <p className="text-gray-600 text-sm">
                    If you have any questions or concerns, contact the developer at <a href="mailto:cristi@cristoi.ro" className="text-blue-500 underline">cristi@cristoi.ro</a>.
                  </p>
                </footer>
              </div>
            </div>
                
                } />

        <Route path="/privacy" element={
         <div className="bg-gradient-to-b from-amber-50 to-teal-50 min-h-screen p-6 flex flex-col items-center">
         <div className="max-w-4xl w-full bg-white shadow-lg rounded-lg p-8">
           <h1 className="text-3xl font-bold text-blue-500 text-center mb-4">Privacy Policy</h1>
           <p className="text-sm text-gray-600 text-center mb-6">
             Last Updated: December 28, 2024
           </p>
       
           <section className="mb-6">
             <h2 className="text-xl font-semibold text-blue-500 mb-2">Introduction</h2>
             <p className="text-gray-700 leading-relaxed">
               At <strong>openTimetables</strong>, we prioritize your privacy and comply with the General Data Protection Regulation (GDPR) and Romanian data protection laws. This Privacy Policy outlines how we collect, use, and protect your data. By using our website, you agree to this policy.
             </p>
           </section>
       
           <section className="mb-6">
             <h2 className="text-xl font-semibold text-blue-500 mb-2">Data Collection</h2>
             <p className="text-gray-700 leading-relaxed">
               We collect and store the following information:
             </p>
             <ul className="list-disc list-inside text-gray-700 leading-relaxed">
               <li>User-created timetables</li>
               <li>Email addresses and passwords (encrypted)</li>
               <li>Authentication tokens</li>
             </ul>
             <p className="mt-2 text-gray-700 leading-relaxed">
               Our website uses <strong>Firebase Authentication</strong> to manage user sign-ins securely.
             </p>
           </section>
       
           <section className="mb-6">
             <h2 className="text-xl font-semibold text-blue-500 mb-2">Data Usage</h2>
             <p className="text-gray-700 leading-relaxed">
               We use the collected data exclusively for:
             </p>
             <ul className="list-disc list-inside text-gray-700 leading-relaxed">
               <li>Providing and maintaining our services</li>
               <li>Improving the functionality and performance of openTimetables</li>
               <li>Ensuring user account security</li>
             </ul>
           </section>
       
           <section className="mb-6">
             <h2 className="text-xl font-semibold text-blue-500 mb-2">Data Protection</h2>
             <p className="text-gray-700 leading-relaxed">
               We are committed to protecting your data through:
             </p>
             <ul className="list-disc list-inside text-gray-700 leading-relaxed">
               <li>Encryption of sensitive data, including passwords</li>
               <li>Access controls to restrict unauthorized access</li>
               <li>Regular updates and security patches to our systems</li>
             </ul>
           </section>
       
           <section className="mb-6">
             <h2 className="text-xl font-semibold text-blue-500 mb-2">User Rights</h2>
             <p className="text-gray-700 leading-relaxed">
               As per GDPR, you have the right to:
             </p>
             <ul className="list-disc list-inside text-gray-700 leading-relaxed">
               <li>Access your personal data</li>
               <li>Request data correction or deletion</li>
               <li>Withdraw consent for data processing</li>
               <li>File a complaint with your local data protection authority</li>
             </ul>
             <p className="mt-2 text-gray-700 leading-relaxed">
               To exercise these rights, contact us at <a href="mailto:cristi@cristoi.ro" className="text-blue-500 underline">cristi@cristoi.ro</a>.
             </p>
           </section>
       
           <section className="mb-6">
             <h2 className="text-xl font-semibold text-blue-500 mb-2">Cookies and Tracking</h2>
             <p className="text-gray-700 leading-relaxed">
               openTimetables uses essential cookies for site functionality. We do not use tracking or advertising cookies.
             </p>
           </section>
       
           <section className="mb-6">
             <h2 className="text-xl font-semibold text-blue-500 mb-2">Open-Source Commitment</h2>
             <p className="text-gray-700 leading-relaxed">
               This website is open-source, and the code is publicly available on GitHub. Transparency is integral to our service. Visit the repository <a href="https://github.com/rocristoi/openTimetables" className="text-blue-500 underline" target="_blank" rel="noopener noreferrer">here</a>.
             </p>
           </section>
       
           <footer className="text-center mt-6">
             <p className="text-gray-600 text-sm">
               For further inquiries, reach out at <a href="mailto:cristi@cristoi.ro" className="text-blue-500 underline">cristi@cristoi.ro</a>.
             </p>
           </footer>
         </div>
       </div>
       
                
                } />

        </Routes>
      </BrowserRouter>
  )
}

export default App
