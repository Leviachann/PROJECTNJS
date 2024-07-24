import React, { useState } from 'react';
import './BookItem.css';
import PropTypes from 'prop-types';

const BookItem = ({ book, onDelete, onUpdate, userRole = 'user' }) => { // Default value for userRole
  const [showInfo, setShowInfo] = useState(false);

  const handleDelete = () => {
    const confirmed = window.confirm("Are you sure you want to delete this book?");
    if (confirmed) {
      onDelete(book._id);
    } 
  };

  const handleUpdate = () => {
    onUpdate(book); 
  };

  return (
    <div
      className="book-item"
      onMouseEnter={() => setShowInfo(true)}
      onMouseLeave={() => setShowInfo(false)}
    >
      <div className={`book-image ${showInfo ? 'show-info' : ''}`}>
        <img src={book.imgLink} alt={book.title} />
        {showInfo && (
          <div className="book-info">
            <h3>{book.title}</h3>
            <p>{book.author}</p>
            <p>Price: ${book.price}</p>
            <p>Discount: {book.discount}%</p>
            <p>Page Count: {book.pageCount}</p>
            <p>Publisher: {book.publisher}</p>
          </div>
        )}
      </div>
      {userRole === 'admin' && (
        <>
          <button onClick={handleDelete}>x</button>
          <button className="update-button" onClick={handleUpdate}>u</button>
        </>
      )}
    </div>
  );
};

BookItem.propTypes = {
  book: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    discount: PropTypes.number.isRequired,
    pageCount: PropTypes.number.isRequired,
    publisher: PropTypes.string.isRequired,
    imgLink: PropTypes.string.isRequired,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  userRole: PropTypes.string,
};

export default BookItem;
