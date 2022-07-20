/* eslint-disable require-jsdoc */

const chai = require('chai');
chai.should();
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;
const transaction = require('../../repositories/transaction');


describe('transaction', () => {
  let pool;
  let client;

  beforeEach(() => {
    client = {};
    client = {
      queries: [],
      query: (q) => {
        client.queries.push(q);
      },
      release: () => {},
    };

    pool = {
      connect: () => client,
    };
  });

  it('should execute the provided function as a transaction and return the result.', async () => {
    const result = await transaction(pool, (client) => 'result');
    result.should.equal('result');

    client.queries.should.eql([
      'BEGIN;', 'COMMIT;',
    ]);
  });

  it('should execute the provided function inside the transaction, even if the function is asynchronous.', async () => {
    const result = await transaction(pool, async (client) => {
      await new Promise((r) => setTimeout(r, 100));
      client.query('ASYNC OPERATION;');
      return 'result';
    });

    result.should.equal('result');

    client.queries.should.eql([
      'BEGIN;',
      'ASYNC OPERATION;',
      'COMMIT;',
    ]);
  });


  it('should retry the transaction if it fails with a 40001 error code', async () => {
    let fail = true;

    const result = await transaction(pool, (client) => {
      if (fail) {
        fail = false;
        const error = new Error('One Time Error');
        error.code = '40001';

        throw error;
      } else {
        return 'result';
      }
    });

    result.should.equal('result');

    client.queries.should.eql([
      'BEGIN;', 'ROLLBACK;',
      'BEGIN;', 'COMMIT;',
    ]);
  });

  it('should not retry forever', async () => {
    const expectedError = new Error('Infinite Error.');
    expectedError.code = '40001';

    const result = transaction(pool, (client) => {
      throw expectedError;
    });

    await expect(result).to.be.rejectedWith(expectedError);

    client.queries.should.eql([
      'BEGIN;', 'ROLLBACK;',
      'BEGIN;', 'ROLLBACK;',
      'BEGIN;', 'ROLLBACK;',
      'BEGIN;', 'ROLLBACK;',
      'BEGIN;', 'ROLLBACK;',
    ]);
  });

  it('should immediately fail (no retry) on a non-retryable error', async () => {
    const expectedError = new Error('Non-Retryable Error.');
    expectedError.code = '12345';

    const result = transaction(pool, (client) => {
      throw expectedError;
    });

    await (expect(result)).to.be.rejectedWith(expectedError);

    client.queries.should.eql([
      'BEGIN;', 'ROLLBACK;',
    ]);
  });

  it('should fail if the function succeeds, but the commit fails with a retryable error.', async () => {
    const expectedError = new Error('Retryable Error.');
    expectedError.code = '40001';

    client.query = (q) => {
      if (q == 'COMMIT;') {
        throw expectedError;
      } else {
        client.queries.push(q);
      }
    };

    const result = transaction(pool, (client) => 'result');

    await expect(result).to.be.rejectedWith(expectedError);

    client.queries.should.eql([
      'BEGIN;', 'ROLLBACK;',
      'BEGIN;', 'ROLLBACK;',
      'BEGIN;', 'ROLLBACK;',
      'BEGIN;', 'ROLLBACK;',
      'BEGIN;', 'ROLLBACK;',
    ]);
  });

  it('should retry and succeed if the function succeeds, but the commit fails the first time.', async () => {
    const expectedError = new Error('Retryable Error.');
    expectedError.code = '40001';
    let throwError = true;

    client.query = (q) => {
      if (q == 'COMMIT;' && throwError) {
        throwError = false;
        throw expectedError;
      } else {
        client.queries.push(q);
      }
    };

    const result = await transaction(pool, (client) => 'result');

    result.should.equal('result');

    client.queries.should.eql([
      'BEGIN;', 'ROLLBACK;',
      'BEGIN;', 'COMMIT;',
    ]);
  });

  it('should fail if the function succeeds, but the commit fails with a non-retryable error.', async () => {
    const expectedError = new Error('Retryable Error.');
    expectedError.code = '40001';

    client.query = (q) => {
      if (q == 'COMMIT;') {
        throw expectedError;
      } else {
        client.queries.push(q);
      }
    };

    const result = transaction(pool, (client) => 'result');

    await expect(result).to.be.rejectedWith(expectedError);

    client.queries.should.eql([
      'BEGIN;', 'ROLLBACK;',
      'BEGIN;', 'ROLLBACK;',
      'BEGIN;', 'ROLLBACK;',
      'BEGIN;', 'ROLLBACK;',
      'BEGIN;', 'ROLLBACK;',
    ]);
  });
});
