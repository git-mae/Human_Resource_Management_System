
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type EmployeeContextType = {
  totalEmployees: number | null;
  isLoading: boolean;
  error: Error | null;
};

const EmployeeContext = createContext<EmployeeContextType>({
  totalEmployees: null,
  isLoading: false,
  error: null,
});

export const useEmployeeContext = () => useContext(EmployeeContext);

export const EmployeeProvider = ({ children }: { children: ReactNode }) => {
  const { data: employees, isLoading, error } = useQuery({
    queryKey: ['employeeCount'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('employee')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw new Error(error.message);
      return count || 0;
    }
  });

  return (
    <EmployeeContext.Provider value={{ 
      totalEmployees: employees || null,
      isLoading,
      error: error as Error | null
    }}>
      {children}
    </EmployeeContext.Provider>
  );
};
