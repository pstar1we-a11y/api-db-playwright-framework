import { query } from '../db/dbClient';

export async function waitForTransactionStatus(
  transactionId: string | number,
  expectedStatus: string,
  timeout = 10000,
  interval = 500
): Promise<any> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      const rows = await query(
        'SELECT status FROM transactions WHERE id = $1',
        [transactionId]
      );

      if (rows && rows.length > 0 && rows[0].status === expectedStatus) {
        return rows[0];
      }
    } catch (error) {
      console.warn(`Polling warning: query failed, retrying...`, error);
    }

    // Ждем перед следующим запросом (интервал)
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error(
    `Transaction ID ${transactionId} did not reach status '${expectedStatus}' within ${timeout}ms`
  );
}