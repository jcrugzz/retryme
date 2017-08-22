const retry = require('./');
const assume = require('assume');

describe('Retryme', function () {

  it('should retry twice before failure', function (done) {
    const op = retry.op({ retries: 2 });
    let called = 0;

    op.attempt((next) => {
      setImmediate(() => {
        called++;
        next(new Error('whoops'));
      });
    }, (err) => {
      assume(err).is.an('error');
      assume(err.message).equals('whoops');
      assume(called).equals(3);
      done();
    });
  });

  it('should ignore errors defined by the given function', function (done) {
    const op = retry.op((err) => err.message.includes('whoops'));
    let called = 0;
    op.attempt(next => {
      setImmediate(() => {
        called++;
        next(new Error('whoops'));
      });
    }, (err) => {
      assume(err).is.an('error');
      assume(err.message).equals('whoops');
      assume(called).equals(1);
      done();
    });
  });
});
