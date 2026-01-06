import { Pool as MySQLPool, RowDataPacket } from 'mysql2/promise';
import { Loan } from '@avenir/domain/entities/Loan';
import { LoanRepository } from '@avenir/domain/repositories/LoanRepository';

export class MySQLLoanRepository implements LoanRepository {
  constructor(private readonly pool: MySQLPool) {}

  async createLoan(loan: Loan): Promise<Loan> {
    const query = `
      INSERT INTO loans (
        id, name, advisor_id, client_id, amount, duration,
        annual_interest_rate, insurance_rate, monthly_payment,
        total_cost, total_interest, insurance_cost,
        paid_amount,
        status, created_at, updated_at, next_payment_date
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      loan.id,
      loan.name,
      loan.advisorId,
      loan.clientId,
      loan.amount,
      loan.duration,
      loan.annualInterestRate,
      loan.insuranceRate,
      loan.monthlyPayment,
      loan.totalCost,
      loan.totalInterest,
      loan.insuranceCost,
      loan.paidAmount,
      loan.status,
      loan.createdAt,
      loan.updatedAt,
      loan.nextPaymentDate || null,
    ];

    await this.pool.execute(query, values);
    return loan;
  }

  async getLoanById(id: string): Promise<Loan | null> {
    const query = 'SELECT * FROM loans WHERE id = ?';
    const [rows] = await this.pool.execute(query, [id]);
    const results = rows as RowDataPacket[];

    if (results.length === 0) {
      return null;
    }

    return this.mapRowToLoan(results[0]);
  }

  async getLoansByClientId(clientId: string): Promise<Loan[]> {
    const query = 'SELECT * FROM loans WHERE client_id = ? ORDER BY created_at DESC';
    const [rows] = await this.pool.execute(query, [clientId]);
    const results = rows as RowDataPacket[];
    return results.map(row => this.mapRowToLoan(row));
  }

  async getLoansByAdvisorId(advisorId: string): Promise<Loan[]> {
    const query = 'SELECT * FROM loans WHERE advisor_id = ? ORDER BY created_at DESC';
    const [rows] = await this.pool.execute(query, [advisorId]);
    const results = rows as RowDataPacket[];
    return results.map(row => this.mapRowToLoan(row));
  }

  async getAllLoans(): Promise<Loan[]> {
    const query = 'SELECT * FROM loans ORDER BY created_at DESC';
    const [rows] = await this.pool.execute(query);
    const results = rows as RowDataPacket[];
    return results.map(row => this.mapRowToLoan(row));
  }

  async updateLoan(loan: Loan): Promise<Loan> {
    const query = `
      UPDATE loans
      SET paid_amount = ?, status = ?, updated_at = ?, 
          next_payment_date = ?
      WHERE id = ?
    `;

    const values = [
      loan.paidAmount,
      loan.status,
      loan.updatedAt,
      loan.nextPaymentDate || null,
      loan.id,
    ];

    await this.pool.execute(query, values);
    return loan;
  }

  async getLoansByStatus(status: string): Promise<Loan[]> {
    const query = 'SELECT * FROM loans WHERE status = ? ORDER BY created_at DESC';
    const [rows] = await this.pool.execute(query, [status]);
    const results = rows as RowDataPacket[];
    return results.map(row => this.mapRowToLoan(row));
  }

  private mapRowToLoan(row: RowDataPacket): Loan {
    return new Loan(
      row.id,
      row.name,
      row.advisor_id,
      row.client_id,
      parseFloat(row.amount),
      parseInt(row.duration),
      parseFloat(row.annual_interest_rate),
      parseFloat(row.insurance_rate),
      parseFloat(row.monthly_payment),
      parseFloat(row.total_cost),
      parseFloat(row.total_interest),
      parseFloat(row.insurance_cost),
      parseFloat(row.paid_amount || 0),
      row.status,
      new Date(row.created_at),
      new Date(row.updated_at),
      row.next_payment_date ? new Date(row.next_payment_date) : undefined,
    );
  }
}
