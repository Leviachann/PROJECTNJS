import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BookList from '../components/BookList';
import BookForm from '../components/BookForm';
import AuthForm from '../components/AuthForm';
import './HomePage.css';

const HomePage = () => {
  const [showForm, setShowForm] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [bookToUpdate, setBookToUpdate] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null); 
  const [refreshKey, setRefreshKey] = useState(0); 

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get('/api/v1/users/me', { withCredentials: true });
        const user = response.data.data.data;
        if (user) {
          setIsLoggedIn(true);
          setUserRole(user.role); 
        } else {
          setIsLoggedIn(false);
          setUserRole(null);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsLoggedIn(false);
        setUserRole(null);
      }
    };

    checkAuthStatus(); 
  }, []);

  const toggleForm = () => {
    setShowForm(prevShowForm => !prevShowForm);
  };

  const toggleAuthForm = () => {
    setShowAuthForm(prevShowAuthForm => !prevShowAuthForm);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/v1/books/${id}`, { withCredentials: true });
      alert('Book deleted successfully');
      setRefreshKey(prevKey => prevKey + 1); 
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('Error deleting book');
    }
  };

  const handleUpdate = (book) => {
    setBookToUpdate(book);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setBookToUpdate(null);
    setRefreshKey(prevKey => prevKey + 1); 
  };

  const handleLoginLogout = async () => {
    if (isLoggedIn) {
      try {
        await axios.get('/api/v1/users/logout', { withCredentials: true });
        setIsLoggedIn(false);
        setUserRole(null);
        alert('Logged out successfully');
      } catch (error) {
        console.error('Error logging out:', error);
        alert('Error logging out');
      }
    } else {
      setShowAuthForm(true); 
    }
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true); 
    window.location.reload(); 
  };

  return ( 
    <div className="home-page">
      <div className="book-list-container">
        <BookList key={refreshKey} onDelete={handleDelete} onUpdate={handleUpdate} userRole={userRole || 'user'} />
      </div>
      <div className={`book-form-container ${showForm ? 'show' : ''}`}>
        <BookForm bookToUpdate={bookToUpdate} onClose={handleCloseForm} />
      </div>
      <button className="toggle-form-button" onClick={toggleForm}>
        {showForm ? 'Close Form' : 'Add Book'}
      </button>
      <button className="toggle-auth-form-button" onClick={handleLoginLogout}>
        {isLoggedIn ? 'Logout' : 'Login/Signup'}
      </button>
      {showAuthForm && <AuthForm onClose={() => { toggleAuthForm(); handleLoginSuccess(); }} onLoginSuccess={handleLoginSuccess} />}
    </div>
  );
};

export default HomePage;
