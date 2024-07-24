import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BookForm.css';

const BookForm = ({ bookToUpdate, onClose }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [pageCount, setPageCount] = useState('');
  const [publisher, setPublisher] = useState('');
  const [imgLink, setImgLink] = useState('');

  useEffect(() => {
    if (bookToUpdate) {
      setTitle(bookToUpdate.title);
      setAuthor(bookToUpdate.author);
      setPrice(bookToUpdate.price);
      setDiscount(bookToUpdate.discount);
      setPageCount(bookToUpdate.pageCount);
      setPublisher(bookToUpdate.publisher);
      setImgLink(bookToUpdate.imgLink);
    } else {
      setTitle('');
      setAuthor('');
      setPrice('');
      setDiscount('');
      setPageCount('');
      setPublisher('');
      setImgLink('');
    }
  }, [bookToUpdate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (bookToUpdate) {
        await axios.patch(`/api/v1/books/${bookToUpdate._id}`, { title, author, price, discount, pageCount, publisher, imgLink });
        alert('Book updated successfully');
      } else {
        await axios.post('/api/v1/books', { title, author, price, discount, pageCount, publisher, imgLink });
        alert('Book added successfully');
      }
      onClose(); 
    } catch (error) {
      console.error('Error saving book:', error);
      alert('Error saving book');
    }
  };

  return (
    <div className="book-form">
      <form onSubmit={handleSubmit}>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder='Title'/>
        <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} required placeholder='Author'/>
        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required placeholder='Price'/>
        <input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} required placeholder='Discount'/>
        <input type="number" value={pageCount} onChange={(e) => setPageCount(e.target.value)} required placeholder='Pages'/>
        <input type="text" value={publisher} onChange={(e) => setPublisher(e.target.value)} required placeholder='Publisher'/>
        <input type="text" value={imgLink} onChange={(e) => setImgLink(e.target.value)} required placeholder='Image Link' />
        <button type="submit">{bookToUpdate ? 'Update Book' : 'Add Book'}</button>
        <button type="button" className="close-button" onClick={onClose}>Close</button>
      </form> 
    </div>
  );
};

export default BookForm;
