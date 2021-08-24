// import AppError from '../errors/AppError';
import { getRepository, getCustomRepository } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    // TODO
    const categoriesRepository = getRepository(Category);
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    let categoryActual = null;

    const checkCategoryExists = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (!checkCategoryExists) {
      categoryActual = categoriesRepository.create({ title: category });
      await categoriesRepository.save(categoryActual);
    } else {
      categoryActual = checkCategoryExists;
    }

    const transactions = await transactionsRepository.find();
    const balance = await transactionsRepository.getBalance(transactions);

    if (type === 'outcome' && value > balance.income) {
      throw new AppError('The value is greater than the total available');
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: categoryActual.id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
