import { EntityRepository, Repository, getRepository } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}
@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(transactions: Array<Transaction>): Promise<Balance> {
    // TODO
    const balance = transactions.reduce(
      (acc: Balance, curr: Transaction) => {
        return {
          income:
            curr.type === 'income' ? acc.income + curr.value : acc.income + 0,
          outcome:
            curr.type === 'outcome'
              ? acc.outcome + curr.value
              : acc.outcome + 0,
          total: 0,
        };
      },
      {
        income: 0,
        outcome: 0,
        total: 0,
      },
    );

    balance.total = balance.income - balance.outcome;

    return balance;
  }

  public async getTransactionsCategories(
    transactions: Array<Transaction>,
  ): Promise<Array<Transaction>> {
    const categoriesRepository = getRepository(Category);

    const categories = await categoriesRepository.find();

    const newTransactions = transactions.map(transaction => {
      const checkCategoryExists = categories.find(
        category => category.id === transaction.category_id,
      );

      if (checkCategoryExists) {
        delete transaction.category_id;
        transaction.category = checkCategoryExists;
      }

      return transaction;
    });

    return newTransactions;
  }
}

export default TransactionsRepository;
