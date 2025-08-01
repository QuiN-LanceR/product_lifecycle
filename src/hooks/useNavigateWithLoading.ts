import { useRouter } from 'next/navigation';
import { useLoading } from '@/context/LoadingProvider';

export function useNavigateWithLoading() {
  const router = useRouter();
  const { setIsNavigating } = useLoading();

  const navigateTo = (path: string) => {
    setIsNavigating(true);
    
    // Small delay to ensure loading state is visible
    setTimeout(() => {
      router.push(path);
    }, 100);
  };

  return { navigateTo };
}