// Imports the index.js file to be tested.
const server = require('../index'); //TO-DO Make sure the path to your index.js is correctly added
// Importing libraries

// Chai HTTP provides an interface for live integration testing of the API's.
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.should();
chai.use(chaiHttp);
const { assert, expect } = chai;

describe('Server!', () => {
  // Sample test case given to test / endpoint.
  it('Returns the default welcome message', done => {
    chai
      .request(server)
      .get('/welcome')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.status).to.equals('success');
        assert.strictEqual(res.body.message, 'Welcome!');
        done();
      });
  });
});

// Part A Login unit test case

// username : admin and password : password MUST be in database

describe('Login!', () => {
  //We are checking POST /login API by passing the user info in the correct order. This test case should pass and return a status 200.
  it('Positive : /login. Checking correct information', done => {
    chai
      .request(server)
      .post('/login')
      .send({ username: 'admin', password: 'password' })
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
  
  //We are checking POST /login API by passing the user info in an incorrect manner (password is incorrect). This test case should pass and return a status 300.
  it('Negative : /login. Checking incorrect password', done => {
    chai
      .request(server)
      .post('/login')
      .send({ username: 'admin', password: 'wrongpassword' })
      .end((err, res) => {
        expect(res).to.have.status(300);
        done();
      });
  });
});

// Part B

//Positive test case for our home page

describe('Home Page!', () => {
  // Sample test case given to test / endpoint.
  it('Positive : /. Checking if it returns the API route for the home page', done => {
    chai
      .request(server)
      .get('/')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res).to.have.header('content-type','text/html; charset=utf-8');
        done();
      });
  });
});


//negative test case for our bookmarks page
describe('Bookmarks Page!', () => {
  // Sample test case given to test /bookmarks endpoint.
  it('Negative : /bookmarks. Checking if the server routes to the correct webpage', done => {
    chai
      .request(server)
      .get('/bookmarks')
      .end((err, res) => {
        expect(res).to.have.status(500); //Internal Server Error: The Web server is incapable of performing the request.
        done();
      });
  });
});