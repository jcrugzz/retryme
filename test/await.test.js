const assume = require('assume');

const performRetryme = require('../await');
const retry = require('./fixtures/retry');

describe('await-retryme', function () {
  function mockAttempt(retries, rej) {
    let count = 0;
    return {
      then: (resolve, reject) => {
        while (count < retries) {
          count++;
          return reject(new Error('mock attempt'));
        }

        if (rej) {
          return reject(new Error('mock attempt'));
        }

        resolve();
      }
    };
  }

  function checkAttempts(err, retries) {
    const attempts = Object.keys(err).filter(word => { return word.includes('attempt'); });
    assume(attempts).has.length(retries);
  }

  it('succeeds the 1st time with no retries', async () => {
    await performRetryme({
      retry,
      attempt: mockAttempt(0)
    });
  });

  it('fails twice and passes in the last attempt', async () => {
    await performRetryme({
      retry,
      attempt: mockAttempt(2)
    });
  });

  it('fails after 3 attempts with error', async () => {
    try {
      await performRetryme({
        retry,
        attempt: mockAttempt(3, true)
      });
    } catch (e) {
      assume(e.message).equals(`mock attempt`);

      // retried 3 times
      checkAttempts(e, 3);
      return;
    }

    throw (new Error('test should have thrown'));
  });
});

