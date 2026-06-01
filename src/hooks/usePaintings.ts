import { useQuery } from '@tanstack/react-query';
import { getPaintings, getPaintingById } from '../lib/api';
import type { Painting } from '../types';

export const usePaintings = () => {
  return useQuery<Painting[], Error>({
    queryKey: ['paintings'],
    queryFn: async () => {
      const { data, error } = await getPaintings();
      if (error) throw new Error(error.message);
      return (data ?? []) as Painting[];
    },
  });
};

export const usePainting = (id: string | undefined) => {
  return useQuery<Painting, Error>({
    queryKey: ['painting', id],
    queryFn: async () => {
      if (!id) throw new Error('ID de obra no proporcionado');
      const { data, error } = await getPaintingById(id);
      if (error) throw new Error(error.message);
      return data as Painting;
    },
    enabled: Boolean(id),
  });
};