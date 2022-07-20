/**
 * Execute a function inside of a SQL Transaction.
 * Retry the transaction up to 5 times if a Retryable error is encountered (code=40001)
 * @param {*} pool The node-postgres pool to execute the SQL statements with.
 * @param {*} func An arbitrary function to execute inside of the transaction.
 * @return {*} The value returned by the arbitrary function (func) passed in.
 */
async function transaction(pool, func) {
  const backoffInterval = 100; // millis
  const maxTries = 5;
  let tries = 0;

  while (true) {
    tries++;

    const client = await pool.connect();

    try {
      await client.query('BEGIN;');
      const result = await func(client);
      await client.query('COMMIT;');
      return result;
    } catch (err) {
      await client.query('ROLLBACK;');

      if (err.code !== '40001') {
        throw err;
      } else if (tries == maxTries) {
        console.log('Exceeded Maximum Retries. Aborting.');
        throw err;
      } else {
        console.log('Transaction failed. Retrying.');
        console.log(err.message);
        await new Promise((r) => setTimeout(r, tries * backoffInterval));
      }
    } finally {
      await client.release();
    }
  }
}

module.exports = transaction;
