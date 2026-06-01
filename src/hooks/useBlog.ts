import { useQuery } from '@tanstack/react-query';
import { getBlogPosts } from '../lib/api';
import type { BlogPost } from '../types';

export const useBlogPosts = () => {
  return useQuery<BlogPost[], Error>({
    queryKey: ['blogPosts'],
    queryFn: async () => {
      const { data, error } = await getBlogPosts();
      if (error) throw new Error(error.message);
      return (data ?? []) as BlogPost[];
    },
  });
};