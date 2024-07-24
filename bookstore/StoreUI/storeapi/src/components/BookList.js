import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import BookItem from './BookItem'; 
import './BookList.css';

const BookList = ({ onDelete, onUpdate, userRole }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false); 
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchBooks = useCallback(async (pageNumber) => {
    setLoading(true);
    try { 
      const response = await axios.get(`/api/v1/books?page=${pageNumber}&limit=6`);
      const fetchedBooks = response.data.data.books;

      if (Array.isArray(fetchedBooks)) {
        setBooks(prevBooks => {
          const newBooks = fetchedBooks.filter(book => !prevBooks.some(prevBook => prevBook._id === book._id));
          return [...prevBooks, ...newBooks];
        });

        if (fetchedBooks.length < 6) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks(page); 
  }, [fetchBooks, page]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prevPage => prevPage + 1);
    }
  };

  return (
    <div className="book-list-container">
      <div className="book-list">
        {books.slice(0, page * 6).map(book => (
          <div key={book._id} className="book-list-item">
            <BookItem book={book} onDelete={onDelete} onUpdate={onUpdate} userRole={userRole} />
          </div>
        ))}
        {loading && <p>Loading...</p>}
        {!hasMore && !loading && <p>No more books to load.</p>}
      </div>
      {hasMore && !loading && (
        <button className="load-more-button" onClick={handleLoadMore}>
          Load More
        </button>
      )}
    </div>
  );
};

export default BookList;
