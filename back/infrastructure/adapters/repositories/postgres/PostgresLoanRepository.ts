import { Pool } from 'pg';
import { Loan } from '@avenir/domain/entities/Loan';
import { LoanRepository } from '@avenir/domain/repositories/LoanRepository';

export class PostgresLoanRepository implements LoanRepository {
  constructor(private readonly pool: Pool) {}

  async createLoan(loan: Loan): Promise<Loan> {
    const query = `
      INSERT INTO loans (
        id, name, advisor_id, client_id, amount, duration,
        annual_interest_rate, insurance_rate, monthly_payment,
        total_cost, total_interest, insurance_cost, 
        paid_amount,
        status, created_at, updated_at, next_payment_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
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

    const result = await this.pool.query(query, values);
    return this.mapRowToLoan(result.rows[0]);
  }

  async getLoanById(id: string): Promise<Loan | null> {
    const query = 'SELECT * FROM loans WHERE id = $1';
    const result = await this.pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToLoan(result.rows[0]);
  }

  async getLoansByClientId(clientId: string): Promise<Loan[]> {
    const query = 'SELECT * FROM loans WHERE client_id = $1 ORDER BY created_at DESC';
    const result = await this.pool.query(query, [clientId]);
    return result.rows.map(row => this.mapRowToLoan(row));
  }

  async getLoansByAdvisorId(advisorId: string): Promise<Loan[]> {
    const query = 'SELECT * FROM loans WHERE advisor_id = $1 ORDER BY created_at DESC';
    const result = await this.pool.query(query, [advisorId]);
    return result.rows.map(row => this.mapRowToLoan(row));
  }

  async getAllLoans(): Promise<Loan[]> {
    const query = 'SELECT * FROM loans ORDER BY created_at DESC';
    const result = await this.pool.query(query);
    return result.rows.map(row => this.mapRowToLoan(row));
  }

  async updateLoan(loan: Loan): Promise<Loan> {
    const query = `
      UPDATE loans
      SET paid_amount = $1, status = $2, updated_at = $3, 
          next_payment_date = $4
      WHERE id = $5
      RETURNING *
    `;

    const values = [
      loan.paidAmount,
      loan.status,
      loan.updatedAt,
      loan.nextPaymentDate || null,
      loan.id,
    ];

    const result = await this.pool.query(query, values);
    return this.mapRowToLoan(result.rows[0]);
  }

  async getLoansByStatus(status: string): Promise<Loan[]> {
    const query = 'SELECT * FROM loans WHERE status = $1 ORDER BY created_at DESC';
    const result = await this.pool.query(query, [status]);
    return result.rows.map(row => this.mapRowToLoan(row));
  }

  private mapRowToLoan(row: any): Loan {
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
