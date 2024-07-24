const Book = require('../models/bookModel');

exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json({ status: 'success', data: { books } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.createBook = async (req, res) => {
  try {
    const newBook = await Book.create(req.body);
    res.status(201).json({ status: 'success', data: { book: newBook } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ status: 'fail', message: 'No book found' });
    res.status(200).json({ status: 'success', data: { book } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!book) return res.status(404).json({ status: 'fail', message: 'No book found' });
    res.status(200).json({ status: 'success', data: { book } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};



exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ status: 'fail', message: 'No book found' });
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
