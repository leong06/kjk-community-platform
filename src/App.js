import React, { useEffect, useState } from 'react';
     import { BrowserRouter as Router, Link, Route, Routes, useNavigate, useParams } from 'react-router-dom';
     import axios from 'axios';
     import './App.css';

     function App() {
       const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

       useEffect(() => {
         if (darkMode) {
           document.documentElement.classList.add('dark');
           localStorage.setItem('darkMode', 'true');
         } else {
           document.documentElement.classList.remove('dark');
           localStorage.setItem('darkMode', 'false');
         }
       }, [darkMode]);

       return (
         <Router>
           <div className={`min-h-screen flex flex-col ${darkMode ? 'dark bg-gray-900' : 'bg-secondary'}`}>
             <Routes>
               <Route path="/" element={<Home darkMode={darkMode} setDarkMode={setDarkMode} />} />
               <Route path="/module/:id" element={<ModuleDetails darkMode={darkMode} setDarkMode={setDarkMode} />} />
               <Route path="/register" element={<Register darkMode={darkMode} setDarkMode={setDarkMode} />} />
               <Route path="/login" element={<Login darkMode={darkMode} setDarkMode={setDarkMode} />} />
               <Route path="/upload" element={<Upload darkMode={darkMode} setDarkMode={setDarkMode} />} />
               <Route path="/profile/:username" element={<Profile darkMode={darkMode} setDarkMode={setDarkMode} />} />
               <Route path="/edit-profile" element={<EditProfile darkMode={darkMode} setDarkMode={setDarkMode} />} />
             </Routes>
           </div>
         </Router>
       );
     }

     function Home({ darkMode, setDarkMode }) {
       const [user, setUser] = useState(null);
       const [modules, setModules] = useState([]);
       const [menuOpen, setMenuOpen] = useState(false);
       const navigate = useNavigate();

       useEffect(() => {
         axios
           .get('http://localhost:5000/api/user', { withCredentials: true })
           .then((response) => setUser(response.data.user))
           .catch((error) => console.error('Error checking user:', error));

         axios
           .get('http://localhost:5000/api/modules')
           .then((response) => setModules(response.data))
           .catch((error) => console.error('Error fetching modules:', error));
       }, []);

       const handleLogout = async () => {
         try {
           await axios.post('http://localhost:5000/api/logout', {}, { withCredentials: true });
           setUser(null);
           setMenuOpen(false);
           navigate('/');
         } catch (error) {
           alert('Error logging out');
         }
       };

       return (
         <div className="flex-1">
           <nav className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 shadow-md">
             <h1 className="text-2xl font-bold text-primary dark:text-blue-400">Közösségi platform</h1>
             <div className="relative">
               <button
                 onClick={() => setMenuOpen(!menuOpen)}
                 className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
               >
                 <svg className="w-6 h-6 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                 </svg>
               </button>
               {menuOpen && (
                 <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10">
                   {user ? (
                     <>
                       <div className="px-4 py-2 text-gray-800 dark:text-gray-200">
                         Welcome, {user.username}!
                       </div>
                       <Link
                         to={`/profile/${user.username}`}
                         onClick={() => setMenuOpen(false)}
                         className="block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                       >
                         Profile
                       </Link>
                       <Link
                         to="/upload"
                         onClick={() => setMenuOpen(false)}
                         className="block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                       >
                         Upload Module
                       </Link>
                       <button
                         onClick={handleLogout}
                         className="block w-full text-left px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                       >
                         Logout
                       </button>
                     </>
                   ) : (
                     <>
                       <Link
                         to="/register"
                         onClick={() => setMenuOpen(false)}
                         className="block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                       >
                         Register
                       </Link>
                       <Link
                         to="/login"
                         onClick={() => setMenuOpen(false)}
                         className="block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                       >
                         Login
                       </Link>
                     </>
                   )}
                 </div>
               )}
             </div>
           </nav>
           <div className="container mx-auto p-4">
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
               {modules.map((module) => (
                 <Link
                   to={`/module/${module.id}`}
                   key={module.id}
                   className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition"
                 >
                   <h3 className="text-lg font-semibold text-primary dark:text-blue-400">{module.title}</h3>
                   <p className="text-gray-600 dark:text-gray-300 line-clamp-2">{module.description}</p>
                   <p className="text-sm text-gray-500 dark:text-gray-400">By {module.author}</p>
                   <a
                     href={module.file_path}
                     download
                     onClick={(e) => e.stopPropagation()}
                     className="inline-block mt-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700"
                   >
                     Download
                   </a>
                 </Link>
               ))}
             </div>
           </div>
           <Footer darkMode={darkMode} setDarkMode={setDarkMode} />
         </div>
       );
     }

     function Register({ darkMode, setDarkMode }) {
       const [username, setUsername] = useState('');
       const [password, setPassword] = useState('');
       const navigate = useNavigate();

       const handleRegister = async (e) => {
         e.preventDefault();
         try {
           await axios.post('http://localhost:5000/api/register', { username, password });
           alert('Registered successfully');
           navigate('/login');
         } catch (error) {
           alert(error.response?.data?.error || 'Error registering');
         }
       };

       return (
         <div className="container mx-auto p-4 flex-1">
           <h2 className="text-2xl font-bold text-primary dark:text-blue-400 mb-4">Register</h2>
           <form onSubmit={handleRegister} className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
             <input
               type="text"
               placeholder="Username"
               value={username}
               onChange={(e) => setUsername(e.target.value)}
               className="w-full p-2 mb-4 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
             />
             <input
               type="password"
               placeholder="Password"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               className="w-full p-2 mb-4 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
             />
             <button
               type="submit"
               className="w-full p-2 bg-primary text-white rounded-md hover:bg-blue-700"
             >
               Register
             </button>
             <Link to="/" className="block mt-4 text-center text-primary dark:text-blue-400">
               Back to Home
             </Link>
           </form>
           <Footer darkMode={darkMode} setDarkMode={setDarkMode} />
         </div>
       );
     }

     function Login({ darkMode, setDarkMode }) {
       const [username, setUsername] = useState('');
       const [password, setPassword] = useState('');
       const navigate = useNavigate();

       const handleLogin = async (e) => {
         e.preventDefault();
         try {
           await axios.post(
             'http://localhost:5000/api/login',
             { username, password },
             { withCredentials: true }
           );
           navigate('/');
         } catch (error) {
           alert(error.response?.data?.error || 'Error logging in');
         }
       };

       return (
         <div className="container mx-auto p-4 flex-1">
           <h2 className="text-2xl font-bold text-primary dark:text-blue-400 mb-4">Login</h2>
           <form onSubmit={handleLogin} className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
             <input
               type="text"
               placeholder="Username"
               value={username}
               onChange={(e) => setUsername(e.target.value)}
               className="w-full p-2 mb-4 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
             />
             <input
               type="password"
               placeholder="Password"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               className="w-full p-2 mb-4 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
             />
             <button
               type="submit"
               className="w-full p-2 bg-primary text-white rounded-md hover:bg-blue-700"
             >
               Login
             </button>
             <Link to="/" className="block mt-4 text-center text-primary dark:text-blue-400">
               Back to Home
             </Link>
           </form>
           <Footer darkMode={darkMode} setDarkMode={setDarkMode} />
         </div>
       );
     }

     function Upload({ darkMode, setDarkMode }) {
       const [title, setTitle] = useState('');
       const [description, setDescription] = useState('');
       const [longDescription, setLongDescription] = useState('');
       const [file, setFile] = useState(null);
       const [images, setImages] = useState([]);
       const navigate = useNavigate();

       const handleUpload = async (e) => {
         e.preventDefault();
         const formData = new FormData();
         formData.append('title', title);
         formData.append('description', description);
         formData.append('long_description', longDescription);
         if (file) formData.append('file', file);
         images.forEach((img) => formData.append('images', img));
         try {
           await axios.post('http://localhost:5000/api/modules', formData, {
             headers: { 'Content-Type': 'multipart/form-data' },
             withCredentials: true,
           });
           alert('Module uploaded');
           navigate('/');
         } catch (error) {
           alert(error.response?.data?.error || 'Error uploading');
         }
       };

       return (
         <div className="container mx-auto p-4 flex-1">
           <h2 className="text-2xl font-bold text-primary dark:text-blue-400 mb-4">Upload Module</h2>
           <form onSubmit={handleUpload} className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
             <input
               type="text"
               placeholder="Title"
               value={title}
               onChange={(e) => setTitle(e.target.value)}
               className="w-full p-2 mb-4 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
             />
             <textarea
               placeholder="Short Description"
               value={description}
               onChange={(e) => setDescription(e.target.value)}
               className="w-full p-2 mb-4 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
             />
             <textarea
               placeholder="Long Description"
               value={longDescription}
               onChange={(e) => setLongDescription(e.target.value)}
               className="w-full p-2 mb-4 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600 h-32"
             />
             <input
               type="file"
               accept=".zip"
               onChange={(e) => setFile(e.target.files[0])}
               className="w-full p-2 mb-4"
             />
             <input
               type="file"
               accept="image/*"
               multiple
               onChange={(e) => setImages([...e.target.files])}
               className="w-full p-2 mb-4"
             />
             <button
               type="submit"
               className="w-full p-2 bg-primary text-white rounded-md hover:bg-blue-700"
             >
               Upload
             </button>
             <Link to="/" className="block mt-4 text-center text-primary dark:text-blue-400">
               Cancel
             </Link>
           </form>
           <Footer darkMode={darkMode} setDarkMode={setDarkMode} />
         </div>
       );
     }

     function Profile({ darkMode, setDarkMode }) {
       const { username } = useParams();
       const [user, setUser] = useState(null);
       const [modules, setModules] = useState([]);
       const [currentUser, setCurrentUser] = useState(null);
       const [menuOpen, setMenuOpen] = useState(false);
       const navigate = useNavigate();

       useEffect(() => {
         axios
           .get(`http://localhost:5000/api/users/${username}`)
           .then((response) => {
             setUser(response.data.user);
             setModules(response.data.modules);
           })
           .catch((error) => {
             alert('User not found');
             navigate('/');
           });

         axios
           .get('http://localhost:5000/api/user', { withCredentials: true })
           .then((response) => setCurrentUser(response.data.user))
           .catch((error) => console.error('Error checking user:', error));
       }, [username, navigate]);

       if (!user) return <div className="text-center p-4 dark:text-white">Loading...</div>;

       return (
         <div className="flex-1">
           <nav className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 shadow-md">
             <h1 className="text-2xl font-bold text-primary dark:text-blue-400">Közösségi platform</h1>
             <div className="relative">
               <button
                 onClick={() => setMenuOpen(!menuOpen)}
                 className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
               >
                 <svg className="w-6 h-6 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                 </svg>
               </button>
               {menuOpen && (
                 <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10">
                   <Link
                     to="/"
                     onClick={() => setMenuOpen(false)}
                     className="block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                   >
                     Home
                   </Link>
                   {currentUser && currentUser.username === username && (
                     <Link
                       to="/edit-profile"
                       onClick={() => setMenuOpen(false)}
                       className="block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                     >
                       Edit Profile
                     </Link>
                   )}
                 </div>
               )}
             </div>
           </nav>
           <div className="container mx-auto p-4">
             <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
               {user.profile_picture ? (
                 <img
                   src={`http://localhost:5000${user.profile_picture}`}
                   alt={`${user.username}'s profile`}
                   className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                 />
               ) : (
                 <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                   <span className="text-gray-500 dark:text-gray-300 text-2xl">{user.username[0].toUpperCase()}</span>
                 </div>
               )}
               <h2 className="text-xl font-semibold text-center text-primary dark:text-blue-400 mb-2">{user.username}</h2>
               <p className="text-gray-600 dark:text-gray-300 text-center">{user.bio || 'No bio yet.'}</p>
             </div>
             <h3 className="text-xl font-semibold text-primary dark:text-blue-400 mb-4">Modules by {user.username}</h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
               {modules.map((module) => (
                 <Link
                   to={`/module/${module.id}`}
                   key={module.id}
                   className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition"
                 >
                   <h4 className="text-lg font-semibold text-primary dark:text-blue-400">{module.title}</h4>
                   <p className="text-gray-600 dark:text-gray-300 line-clamp-2">{module.description}</p>
                   <p className="text-sm text-gray-500 dark:text-gray-400">By {module.author}</p>
                   <a
                     href={module.file_path}
                     download
                     onClick={(e) => e.stopPropagation()}
                     className="inline-block mt-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700"
                   >
                     Download
                   </a>
                 </Link>
               ))}
               {modules.length === 0 && (
                 <p className="text-gray-600 dark:text-gray-300">No modules created yet.</p>
               )}
             </div>
           </div>
           <Footer darkMode={darkMode} setDarkMode={setDarkMode} />
         </div>
       );
     }

     function EditProfile({ darkMode, setDarkMode }) {
       const [bio, setBio] = useState('');
       const [profilePicture, setProfilePicture] = useState(null);
       const [currentPassword, setCurrentPassword] = useState('');
       const [newPassword, setNewPassword] = useState('');
       const [user, setUser] = useState(null);
       const navigate = useNavigate();

       useEffect(() => {
         axios
           .get('http://localhost:5000/api/user', { withCredentials: true })
           .then((response) => {
             if (!response.data.user) {
               alert('Please log in to edit your profile');
               navigate('/login');
             } else {
               setUser(response.data.user);
               axios
                 .get(`http://localhost:5000/api/users/${response.data.user.username}`)
                 .then((res) => setBio(res.data.user.bio || ''))
                 .catch((error) => console.error('Error fetching user:', error));
             }
           })
           .catch((error) => {
             alert('Error checking user');
             navigate('/login');
           });
       }, [navigate]);

       const handleProfileUpdate = async (e) => {
         e.preventDefault();
         const formData = new FormData();
         formData.append('bio', bio);
         if (profilePicture) {
           formData.append('profile_picture', profilePicture);
         }
         try {
           await axios.post('http://localhost:5000/api/user/update', formData, {
             headers: { 'Content-Type': 'multipart/form-data' },
             withCredentials: true,
           });
           alert('Profile updated');
           navigate(`/profile/${user.username}`);
         } catch (error) {
           alert(error.response?.data?.error || 'Error updating profile');
         }
       };

       const handlePasswordChange = async (e) => {
         e.preventDefault();
         try {
           await axios.post(
             'http://localhost:5000/api/user/change-password',
             { currentPassword, newPassword },
             { withCredentials: true }
           );
           alert('Password changed');
           setCurrentPassword('');
           setNewPassword('');
         } catch (error) {
           alert(error.response?.data?.error || 'Error changing password');
         }
       };

       if (!user) return <div className="text-center p-4 dark:text-white">Loading...</div>;

       return (
         <div className="container mx-auto p-4 flex-1">
           <h2 className="text-2xl font-bold text-primary dark:text-blue-400 mb-4">Edit Profile</h2>
           <form onSubmit={handleProfileUpdate} className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
             <textarea
               placeholder="Write a short bio"
               value={bio}
               onChange={(e) => setBio(e.target.value)}
               className="w-full p-2 mb-4 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600 h-24"
             />
             <input
               type="file"
               accept="image/*"
               onChange={(e) => setProfilePicture(e.target.files[0])}
               className="w-full p-2 mb-4"
             />
             <button
               type="submit"
               className="w-full p-2 bg-primary text-white rounded-md hover:bg-blue-700"
             >
               Update Profile
             </button>
           </form>
           <form onSubmit={handlePasswordChange} className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
             <input
               type="password"
               placeholder="Current Password"
               value={currentPassword}
               onChange={(e) => setCurrentPassword(e.target.value)}
               className="w-full p-2 mb-4 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
             />
             <input
               type="password"
               placeholder="New Password"
               value={newPassword}
               onChange={(e) => setNewPassword(e.target.value)}
               className="w-full p-2 mb-4 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
             />
             <button
               type="submit"
               className="w-full p-2 bg-primary text-white rounded-md hover:bg-blue-700"
             >
               Change Password
             </button>
           </form>
           <Link to={`/profile/${user.username}`} className="block mt-4 text-center text-primary dark:text-blue-400">
             Back to Profile
           </Link>
           <Footer darkMode={darkMode} setDarkMode={setDarkMode} />
         </div>
       );
     }

     function ModuleDetails({ darkMode, setDarkMode }) {
       const { id } = useParams();
       const [module, setModule] = useState(null);
       const [reviews, setReviews] = useState([]);
       const [newReview, setNewReview] = useState({ rating: 5, review_text: '' });
       const [user, setUser] = useState(null);
       const navigate = useNavigate();

       useEffect(() => {
         axios
           .get(`http://localhost:5000/api/modules/${id}`)
           .then((response) => setModule(response.data))
           .catch((error) => {
             alert('Module not found');
             navigate('/');
           });

         axios
           .get(`http://localhost:5000/api/modules/${id}/reviews`)
           .then((response) => setReviews(response.data))
           .catch((error) => console.error('Error fetching reviews:', error));

         axios
           .get('http://localhost:5000/api/user', { withCredentials: true })
           .then((response) => setUser(response.data.user))
           .catch((error) => console.error('Error fetching user:', error));
       }, [id, navigate]);

       const handleSubmitReview = (e) => {
         e.preventDefault();
         axios
           .post(
             'http://localhost:5000/api/reviews',
             { module_id: id, rating: newReview.rating, review_text: newReview.review_text },
             { withCredentials: true }
           )
           .then(() => {
             alert('Review submitted successfully!');
             setNewReview({ rating: 5, review_text: '' });
             axios
               .get(`http://localhost:5000/api/modules/${id}/reviews`)
               .then((response) => setReviews(response.data));
           })
           .catch((error) => alert(error.response?.data?.error || 'Error submitting review'));
       };

       const averageRating = reviews.length > 0
         ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
         : 'No ratings yet';

       if (!module) return <div className="text-center p-4 dark:text-white">Loading...</div>;

       return (
         <div className="container mx-auto p-4 flex-1">
           <button
             onClick={() => navigate('/')}
             className="mb-4 p-2 bg-primary text-white rounded-md hover:bg-blue-700"
           >
             Back
           </button>
           <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
             <h2 className="text-2xl font-bold text-primary dark:text-blue-400 mb-4">{module.title}</h2>
             <p className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
               Module ID: <span className="text-primary dark:text-blue-400">{module.id}</span>
             </p>
             <p className="text-gray-600 dark:text-gray-300 mb-2">{module.description}</p>
             {module.long_description && (
               <div className="mb-4">
                 <h3 className="text-lg font-semibold dark:text-gray-200">About This Module</h3>
                 <p className="text-gray-600 dark:text-gray-300">{module.long_description}</p>
               </div>
             )}
             <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">By {module.author}</p>
             <a
               href={module.file_path}
               download
               className="inline-block p-2 bg-primary text-white rounded-md hover:bg-blue-700"
             >
               Download Module
             </a>
             {module.images && module.images.length > 0 && (
               <div className="mt-6">
                 <h3 className="text-lg font-semibold dark:text-gray-200">Screenshots</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                   {module.images.map((img, index) => (
                     <img
                       key={index}
                       src={`http://localhost:5000${img}`}
                       alt={`Module ${module.title} screenshot ${index + 1}`}
                       className="w-full h-48 object-cover rounded-md"
                     />
                   ))}
                 </div>
               </div>
             )}
           </div>

           {/* Reviews Section */}
           <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-6">
             <h3 className="text-xl font-semibold dark:text-gray-200 mb-4">
               Reviews ({reviews.length})
               {reviews.length > 0 && (
                 <span className="text-yellow-500 ml-2">★ {averageRating}</span>
               )}
             </h3>

             {/* Review Submission Form */}
             {user ? (
               <form onSubmit={handleSubmitReview} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                 <h4 className="font-semibold dark:text-gray-200 mb-2">Write a Review</h4>
                 <div className="mb-3">
                   <label className="block text-sm font-medium dark:text-gray-300 mb-1">
                     Rating: {newReview.rating} / 5
                   </label>
                   <input
                     type="range"
                     min="0.5"
                     max="5"
                     step="0.5"
                     value={newReview.rating}
                     onChange={(e) => setNewReview({ ...newReview, rating: parseFloat(e.target.value) })}
                     className="w-full"
                   />
                   <div className="text-yellow-500 text-2xl">
                     {'★'.repeat(Math.floor(newReview.rating))}
                     {newReview.rating % 1 !== 0 && '☆'}
                   </div>
                 </div>
                 <textarea
                   placeholder="Write your review here (optional)"
                   value={newReview.review_text}
                   onChange={(e) => setNewReview({ ...newReview, review_text: e.target.value })}
                   className="w-full p-2 border rounded-md dark:bg-gray-600 dark:text-white dark:border-gray-500"
                   rows="3"
                 />
                 <button
                   type="submit"
                   className="mt-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700"
                 >
                   Submit Review
                 </button>
               </form>
             ) : (
               <p className="mb-4 text-gray-600 dark:text-gray-400">
                 Please log in to write a review.
               </p>
             )}

             {/* Display Reviews */}
             <div className="space-y-4">
               {reviews.length > 0 ? (
                 reviews.map((review) => (
                   <div key={review.id} className="border-b dark:border-gray-700 pb-4">
                     <div className="flex items-center mb-2">
                       {review.profile_picture && (
                         <img
                           src={`http://localhost:5000${review.profile_picture}`}
                           alt={review.username}
                           className="w-10 h-10 rounded-full mr-3"
                         />
                       )}
                       <div>
                         <p className="font-semibold dark:text-gray-200">{review.username}</p>
                         <div className="text-yellow-500">
                           {'★'.repeat(Math.floor(review.rating))}
                           {review.rating % 1 !== 0 && '☆'}
                           <span className="text-gray-600 dark:text-gray-400 ml-2">
                             {review.rating} / 5
                           </span>
                         </div>
                       </div>
                     </div>
                     {review.review_text && (
                       <p className="text-gray-700 dark:text-gray-300 ml-13">{review.review_text}</p>
                     )}
                     <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                       {new Date(review.created_at).toLocaleDateString()}
                     </p>
                   </div>
                 ))
               ) : (
                 <p className="text-gray-600 dark:text-gray-400">No reviews yet. Be the first to review!</p>
               )}
             </div>
           </div>

           <Footer darkMode={darkMode} setDarkMode={setDarkMode} />
         </div>
       );
     }

     function Footer({ darkMode, setDarkMode }) {
       return (
         <footer className="bg-white dark:bg-gray-800 p-4 mt-6 shadow-inner">
           <div className="container mx-auto flex justify-between items-center">
             <p className="text-gray-600 dark:text-gray-300">Kalandjáték motor</p>
             <button
               onClick={() => setDarkMode(!darkMode)}
               className="p-2 bg-primary text-white rounded-md hover:bg-blue-700"
             >
               {darkMode ? 'Light Mode' : 'Dark Mode'}
             </button>
           </div>
         </footer>
       );
     }

     export default App;