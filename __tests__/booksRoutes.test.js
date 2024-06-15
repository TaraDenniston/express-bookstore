process.env.NODE_ENV = 'test';
const request = require('supertest');
const app = require('../app');
const db = require('../db');
const Book = require('../models/book');

let isbn = '901245678901';

beforeEach(async () => {
  const book = {
    "isbn": "901245678901",
    "amazon_url": "https://amazon.com",
    "author": "Test Author",
    "language": "English",
    "pages": 123,
    "publisher": "Test Publishing",
    "title": "The Big Book About Testing",
    "year": 2000
  }
  await Book.create(book);
});

describe('GET /books', () => {
  test('Gets list of books', async () => {
    const response = await request(app).get('/books');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('books');
    expect(response.body.books[0]).toHaveProperty('isbn');
  });
});

describe('GET /books/:isbn', () => {
  test('Gets one book matching given isbn', async () => {
    const response = await request(app).get(`/books/${isbn}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.book.isbn).toBe(isbn);
  });
  test('Responds with 404 if isbn is not found', async () => {
    const response = await request(app).get('/books/1233456');
    expect(response.statusCode).toBe(404);
  });
});

describe('POST /books', () => {
  test('Creates a new book', async () => {
    const testBook = {
      "isbn": "987654321098",
      "amazon_url": "https://amazon.com",
      "author": "Test Author II",
      "language": "English",
      "pages": 456,
      "publisher": "Test Publishing Two",
      "title": "Another Big Book About Testing",
      "year": 2010
    };
    const response = await request(app).post('/books').send(testBook);
    expect(response.statusCode).toBe(201);
    expect(response.body.book.author).toBe('Test Author II');
  });
  test('Responds with error if required property is missing', async () => {
    const incompleteBook = {
      "isbn": "987654321098",
      "amazon_url": "https://amazon.com",
      "language": "English",
      "pages": 456,
      "publisher": "Test Publishing Two",
      "title": "Another Big Book About Testing",
      "year": 2010
    };
    const response = await request(app).post('/books').send(incompleteBook);
    expect(response.statusCode).toBe(400);
  })
});

describe('PUT /books/:isbn', () => {
  const updatedBook = {
    "amazon_url": "https://amazon.com",
    "author": "Test Author",
    "language": "English",
    "pages": 123,
    "publisher": "Test Publishing",
    "title": "Updated: The Big Book About Testing",
    "year": 2020
  };
  test('Updates a new book matching the given isbn', async () => {
    const response = await request(app).put(`/books/${isbn}`).send(updatedBook);
    expect(response.statusCode).toBe(200);
    expect(response.body.book.language).toBe('English');
  });
  test('Responds with 404 if isbn is not found', async () => {
    const response = await request(app).put('/books/1233456').send(updatedBook);
    expect(response.statusCode).toBe(404);
  });
});

describe('DELETE /books/:isbn', () => {
  test('Deletes a book matching the given isbn', async () => {
    const response = await request(app).delete(`/books/${isbn}`);
    expect(response.body).toEqual({message: "Book deleted"});
  });
  test('Responds with 404 if isbn is not found', async () => {
    const response = await request(app).delete('/books/1233456');
    expect(response.statusCode).toBe(404);
  });
});

afterEach(async () => {
  await db.query('DELETE FROM books');
});

afterAll(async () => {
  await db.end();
});

