import { getCustomRepository } from 'typeorm';
import { Router } from 'express';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  // TODO
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  const transactionsDB = await transactionsRepository.find();

  const transactions = await transactionsRepository.getTransactionsCategories(
    transactionsDB,
  );
  const balance = await transactionsRepository.getBalance(transactionsDB);

  return response.json({
    transactions,
    balance,
  });
});

transactionsRouter.post('/', async (request, response) => {
  // TODO
  const { title, value, type, category } = request.body;

  const createTransactionService = new CreateTransactionService();

  const transaction = await createTransactionService.execute({
    title,
    value,
    type,
    category,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  // TODO
  const { id } = request.params;

  const deleteTransactionService = new DeleteTransactionService();
  await deleteTransactionService.execute({ id });

  return response.status(204).send();
});

transactionsRouter.post('/import', async (request, response) => {
  // TODO
  const importTransactionsService = new ImportTransactionsService();
  const transactionsBalanceImport = await importTransactionsService.execute();
  // await importTransactionsService.execute();

  return response.json(transactionsBalanceImport);
  // return response.json({ msg: 'ok' });
});

export default transactionsRouter;
