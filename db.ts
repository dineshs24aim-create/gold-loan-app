import { Bank, Loan } from './types';
import { supabase } from './supabaseClient';

export const db = {
  // Banks
  getBanks: async (): Promise<Bank[]> => {
    const { data, error } = await supabase
      .from('banks')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching banks:', error);
      return [];
    }
    
    return (data || []).map((bank: any) => ({
      id: bank.id,
      name: bank.name,
      createdAt: bank.created_at
    }));
  },

  saveBank: async (bank: Bank): Promise<boolean> => {
    // Check if it's an update (has existing UUID format) or insert
    const isUpdate = bank.id && bank.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    
    if (isUpdate) {
      const { error } = await supabase
        .from('banks')
        .update({ name: bank.name })
        .eq('id', bank.id);
      
      if (error) {
        console.error('Error updating bank:', error);
        return false;
      }
    } else {
      const { error } = await supabase
        .from('banks')
        .insert([{ name: bank.name }]);
      
      if (error) {
        console.error('Error inserting bank:', error);
        return false;
      }
    }
    
    return true;
  },

  deleteBank: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('banks')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting bank:', error);
      return false;
    }
    
    return true;
  },

  // Loans
  getLoans: async (): Promise<Loan[]> => {
    const { data, error } = await supabase
      .from('loans_with_bank')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching loans:', error);
      return [];
    }
    
    return (data || []).map((loan: any) => ({
      id: loan.id,
      bankId: loan.bank_id,
      bankName: loan.bank_name,
      date: loan.date,
      amount: loan.amount,
      customerName: loan.customer_name,
      notes: loan.notes,
      createdAt: loan.created_at
    }));
  },

  saveLoan: async (loan: Loan): Promise<boolean> => {
    // Check if it's an update (has existing UUID format) or insert
    const isUpdate = loan.id && loan.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    
    const loanData = {
      bank_id: loan.bankId,
      date: loan.date,
      amount: loan.amount,
      customer_name: loan.customerName,
      notes: loan.notes
    };
    
    if (isUpdate) {
      const { error } = await supabase
        .from('loans')
        .update(loanData)
        .eq('id', loan.id);
      
      if (error) {
        console.error('Error updating loan:', error);
        return false;
      }
    } else {
      const { error } = await supabase
        .from('loans')
        .insert([loanData]);
      
      if (error) {
        console.error('Error inserting loan:', error);
        return false;
      }
    }
    
    return true;
  },

  deleteLoan: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('loans')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting loan:', error);
      return false;
    }
    
    return true;
  }
};
