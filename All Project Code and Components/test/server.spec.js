// Imports the index.js file to be tested.
const server = require('../index'); //TO-DO Make sure the path to your index.js is correctly added
// Importing libraries

// Chai HTTP provides an interface for live integration testing of the API's.
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.should();
chai.use(chaiHttp);
const {assert, expect} = chai;

describe('Server!', () => {
  // Sample test case given to test / endpoint.
  let request;

  before(function(done) {
      request = chai.request.agent(server);
      done();
  });
    

  it('Returns the default welcome message', done => {
    request
      .get('/welcome')
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res.body.status).to.equals('success');
        assert.strictEqual(res.body.message, 'Welcome!');
        done();
      })
      ;
  });

  it('positive : /register', done => {
    request
      .post('/register')
      .send({username: 'user', password:'password'})
      .then((res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('negative : /register', done => {
    request
      .post('/register')
      .send({username: 'user', password:'password'}) //tries sending duplicate register information
      .end((err, res) => {
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.message, "Username taken, try again with another username");
        done();
      });
  });

  it('positive: login', (done) => {
    request
      .post('/login')
      .send({ username: 'user', password: 'password' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        done();
      });
  });

  it('negative: login', (done) => {
    request
      .post('/login')
      .send({ username: 'incorrectuser', password: 'incorrectpassword' })
      .end((err, res) => {
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.message, "Username taken, try again with another username");
        done();
      });
  });

  it('positive: savenote', (done) => {
    let body = {
      entry_title: 'Test Title',
      raw_text: 'Test Entry'
    }
    request
      .post('/savenote')
      .send(body)
      .end((err, res) => {
        // console.log(err)
        expect(res).to.have.status(200);
        //expect(res.body.status).to.equals('success');
        assert.strictEqual(res.body.message, 'Note added successfully');
        done();
      });
  });
  });
  // ===========================================================================
  // TO-DO: Part A Login unit test case
