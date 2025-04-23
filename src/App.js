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
      <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-secondary'}`}>
        <Routes>
          <Route path="/" element={<Home darkMode={darkMode} setDarkMode={setDarkMode} />} />
          <Route path="/module/:id" element={<ModuleDetails darkMode={darkMode} />} />
          <Route path="/register" element={<Register darkMode={darkMode} />} />
          <Route path="/login" element={<Login darkMode={darkMode} />} />
          <Route path="/upload" element={<Upload darkMode={darkMode} />} />
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
    <div className="container mx-auto p-4">
      <nav className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary dark:text-blue-400">Adventure Modules</h1>
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
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="block w-full text-left px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </button>
              {user ? (
                <>
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
  );
}

function Register({ darkMode }) {
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
    <div className="container mx-auto p-4">
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
    </div>
  );
}

function Login({ darkMode }) {
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
    <div className="container mx-auto p-4">
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
    </div>
  );
}

function Upload({ darkMode }) {
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
    <div className="container mx-auto p-4">
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
    </div>
  );
}

function ModuleDetails({ darkMode }) {
  const { id } = useParams();
  const [module, setModule] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/modules/${id}`)
      .then((response) => setModule(response.data))
      .catch((error) => {
        alert('Module not found');
        navigate('/');
      });
  }, [id, navigate]);

  if (!module) return <div className="text-center p-4 dark:text-white">Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <button
        onClick={() => navigate('/')}
        className="mb-4 p-2 bg-primary text-white rounded-md hover:bg-blue-700"
      >
        Back
      </button>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-primary dark:text-blue-400 mb-4">{module.title}</h2>
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
    </div>
  );
}

export default App;