const assume = require('assume');

const retry = require('../');
const config = require('./fixtures/retry');

describe('Retryme', function () {
  let op;

  beforeEach(() => {
    op = retry.op(config);
  });

  it('should retry three times before failure', function (done) {
    let called = 0;

    op.attempt((next) => {
      setImmediate(() => {
        called++;
        next(new Error('whoops'));
      });
    }, (err) => {
      assume(err).is.an('error');
      assume(err.message).equals('whoops');
      assume(called).equals(4);
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

  describe('retry.op.async', () => {
    let flag = true;

    const mockAttempt = () => {
      return new Promise((f, r) => {
        if (flag) {
          flag = false;
          return f();
        }
        flag = true;
        r(new Error('mock attempt failed'));
      });
    };

    function checkAttempts(err, retries) {
      const attempts = Object.keys(err).filter(word => { return word.includes('attempt'); });
      assume(attempts).has.length(retries);
    }

    it('succeeds the 1st time with no retries', async () => {
      await op.async(mockAttempt);
    });

    it('fails the 1st attempt and passes the 2nd attempt', async () => {
      await op.async(mockAttempt);
    });

    it('supports thenables function and fails after 3 attempts with error', async () => {
      try {
        await op.async(() => {
          return {
            then: (f, r) => {
              return r(new Error('please fail forever'));
            }
          };
        });
      } catch (e) {
        assume(e.message).equals(`please fail forever`);

        // retried 3 times
        checkAttempts(e, 3);
        return;
      }

      throw (new Error('test should have thrown'));
    });
  });
});

