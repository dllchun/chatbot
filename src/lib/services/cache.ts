import { executeQuery, executeMutation, upsert } from '@/lib/database/queries';
import type { Conversation } from '@/types/api';
import { RowDataPacket } from 'mysql2';

interface ConversationRow extends RowDataPacket {
  id: string;
  chatbot_id: string;
  source: string;
  whatsapp_number: string | null;
  customer: string | null;
  messages: any;
  min_score: number | null;
  form_submission: any;
  country: string | null;
  last_message_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export class CacheService {
  static async storeConversations(conversations: Conversation[], chatbotId: string, authToken?: string) {
    try {
      console.log('Storing conversations:', {
        count: conversations.length,
        chatbotId,
        firstConversation: conversations[0]
      });

      // Use batch insert with upsert
      for (const conv of conversations) {
        // Convert undefined to null for MySQL compatibility
        await upsert('conversations', {
          id: conv.id,
          chatbot_id: chatbotId,
          source: conv.source,
          whatsapp_number: conv.whatsapp_number ?? null,
          customer: conv.customer ?? null,
          messages: JSON.stringify(conv.messages || []),
          min_score: conv.min_score ?? null,
          form_submission: conv.form_submission ? JSON.stringify(conv.form_submission) : null,
          country: conv.country ?? null,
          last_message_at: conv.last_message_at ?? null,
          created_at: conv.created_at,
          updated_at: conv.updated_at
        }, ['id']);
      }

      console.log('Successfully stored conversations:', {
        count: conversations.length
      });

      return conversations;
    } catch (error) {
      console.error('Failed to store conversations:', error);
      throw error;
    }
  }

  static async getConversations({
    chatbotId,
    startDate,
    endDate,
    page = 1,
    pageSize = 20,
    authToken
  }: {
    chatbotId: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
    authToken?: string;
  }) {
    try {
      console.log('Fetching conversations from MySQL:', {
        chatbotId,
        startDate,
        endDate,
        page,
        pageSize
      });

      const offset = (page - 1) * pageSize;
      let query = `
        SELECT * FROM conversations 
        WHERE chatbot_id = ?
      `;
      const params: any[] = [chatbotId];

      if (startDate) {
        query += ' AND created_at >= ?';
        params.push(startDate);
      }
      if (endDate) {
        query += ' AND created_at <= ?';
        params.push(endDate);
      }

      query += ` ORDER BY created_at DESC LIMIT ${pageSize} OFFSET ${offset}`;
      // Don't push LIMIT and OFFSET as parameters, use direct substitution

      const result = await executeQuery<ConversationRow[]>(query, params);
      
      if (result.error) {
        console.error('Error fetching conversations:', result.error);
        throw result.error;
      }

      // Parse JSON fields
      const conversations = result.data?.map(row => ({
        id: row.id,
        chatbot_id: row.chatbot_id,
        source: row.source,
        whatsapp_number: row.whatsapp_number,
        customer: row.customer,
        messages: typeof row.messages === 'string' ? JSON.parse(row.messages) : row.messages,
        min_score: row.min_score,
        form_submission: row.form_submission ? 
          (typeof row.form_submission === 'string' ? JSON.parse(row.form_submission) : row.form_submission) : null,
        country: row.country,
        last_message_at: row.last_message_at,
        created_at: row.created_at,
        updated_at: row.updated_at
      })) || [];

      console.log('Successfully fetched conversations:', {
        count: conversations.length
      });

      return conversations;
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      throw error;
    }
  }

  static async getCachedAnalytics({
    chatbotId,
    startDate,
    endDate,
    authToken
  }: {
    chatbotId: string;
    startDate?: string;
    endDate?: string;
    authToken?: string;
  }) {
    try {
      console.log('Fetching analytics data from cache:', {
        chatbotId,
        startDate,
        endDate,
        hasAuthToken: !!authToken
      });

      let query = `
        SELECT * FROM conversations 
        WHERE chatbot_id = ?
      `;
      const params: any[] = [chatbotId];

      if (startDate) {
        query += ' AND created_at >= ?';
        params.push(startDate);
      }
      if (endDate) {
        query += ' AND created_at <= ?';
        params.push(endDate);
      }

      const result = await executeQuery<ConversationRow[]>(query, params);
      
      if (result.error) {
        console.error('Error fetching analytics data from cache:', {
          error: result.error,
          message: result.error.message
        });
        throw result.error;
      }

      // Parse JSON fields
      const conversations = result.data?.map(row => ({
        id: row.id,
        chatbot_id: row.chatbot_id,
        source: row.source,
        whatsapp_number: row.whatsapp_number,
        customer: row.customer,
        messages: typeof row.messages === 'string' ? JSON.parse(row.messages) : row.messages,
        min_score: row.min_score,
        form_submission: row.form_submission ? 
          (typeof row.form_submission === 'string' ? JSON.parse(row.form_submission) : row.form_submission) : null,
        country: row.country,
        last_message_at: row.last_message_at,
        created_at: row.created_at,
        updated_at: row.updated_at
      })) || [];

      console.log('Successfully fetched analytics data from cache:', {
        count: conversations.length,
        firstRecord: conversations[0] ? { id: conversations[0].id, chatbot_id: conversations[0].chatbot_id } : null
      });

      return conversations;
    } catch (error) {
      console.error('Failed to fetch analytics data from cache:', {
        error,
        type: typeof error,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }
}