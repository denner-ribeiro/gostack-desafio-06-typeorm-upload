import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import Transaction from '../models/Transaction';

import CreateTransactionService from './CreateTransactionService';

async function loadCSV(filePath: string): Promise<Array<Array<string>>> {
  const readCSVStream = fs.createReadStream(filePath);

  const parseStream = csvParse({
    from_line: 2,
    ltrim: true,
    rtrim: true,
  });

  const parseCSV = readCSVStream.pipe(parseStream);

  const lines: Array<Array<string>> = [];

  parseCSV.on('data', line => {
    lines.push(line);
  });

  await new Promise(resolve => {
    parseCSV.on('end', resolve);
  });

  return lines;
}

class ImportTransactionsService {
  async execute(): Promise<Transaction[]> {
    // TODO
    const createTransactionService = new CreateTransactionService();
    const transactions: Transaction[] = [];

    const csvFilePath = path.resolve(__dirname, '..', '..', 'tmp', 'file.csv');

    const data = await loadCSV(csvFilePath);

    for await (const line of data) {
      const [title, typeString, valueString, category] = line;

      const transaction = await createTransactionService.execute({
        title,
        value: Number(valueString),
        type: typeString === 'income' ? 'income' : 'outcome',
        category,
      });

      transactions.push(transaction);
    }

    return transactions;
  }
}

export default ImportTransactionsService;
