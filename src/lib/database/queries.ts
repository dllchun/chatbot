import pool from './mysql';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Helper function to sanitize parameters (convert undefined to null)
function sanitizeParams(params: any[]): any[] {
  return params.map(param => param === undefined ? null : param);
}

export interface QueryResult<T> {
  data: T | null;
  error: Error | null;
}

export interface QueryManyResult<T> {
  data: T[];
  error: Error | null;
}

// Generic query executor
export async function executeQuery<T extends RowDataPacket[]>(
  query: string,
  params: any[] = []
): Promise<QueryResult<T>> {
  try {
    const sanitizedParams = sanitizeParams(params);
    const [rows] = await pool.execute<T>(query, sanitizedParams);
    return { data: rows, error: null };
  } catch (error) {
    console.error('Query error:', error);
    return { data: null, error: error as Error };
  }
}

// Insert/Update query executor
export async function executeMutation(
  query: string,
  params: any[] = []
): Promise<QueryResult<ResultSetHeader>> {
  try {
    const sanitizedParams = sanitizeParams(params);
    const [result] = await pool.execute<ResultSetHeader>(query, sanitizedParams);
    return { data: result, error: null };
  } catch (error) {
    console.error('Mutation error:', error);
    return { data: null, error: error as Error };
  }
}

// Upsert helper
export async function upsert(
  table: string,
  data: Record<string, any>,
  uniqueKeys: string[]
): Promise<QueryResult<ResultSetHeader>> {
  const columns = Object.keys(data);
  const values = Object.values(data).map(val => val === undefined ? null : val); // Sanitize values
  const placeholders = columns.map(() => '?').join(', ');
  
  const updateClauses = columns
    .filter(col => !uniqueKeys.includes(col))
    .map(col => `${col} = VALUES(${col})`)
    .join(', ');

  const query = `
    INSERT INTO ${table} (${columns.join(', ')})
    VALUES (${placeholders})
    ON DUPLICATE KEY UPDATE ${updateClauses}
  `;

  return executeMutation(query, values);
}

// Batch insert helper
export async function batchInsert(
  table: string,
  records: Record<string, any>[],
  onDuplicate?: string
): Promise<QueryResult<ResultSetHeader>> {
  if (records.length === 0) {
    return { data: null, error: new Error('No records to insert') };
  }

  const columns = Object.keys(records[0]);
  const values: any[] = [];
  const placeholders = records.map(record => {
    const recordValues = columns.map(col => record[col] === undefined ? null : record[col]); // Sanitize
    values.push(...recordValues);
    return `(${columns.map(() => '?').join(', ')})`;
  }).join(', ');

  let query = `
    INSERT INTO ${table} (${columns.join(', ')})
    VALUES ${placeholders}
  `;

  if (onDuplicate) {
    query += ` ON DUPLICATE KEY UPDATE ${onDuplicate}`;
  }

  return executeMutation(query, values);
}