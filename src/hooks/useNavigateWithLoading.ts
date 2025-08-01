import { useRouter } from 'next/navigation';
import { useLoading } from '@/context/LoadingProvider';

export function useNavigateWithLoading() {
  const router = useRouter();
  const { setIsNavigating } = useLoading();

  const navigateTo = (path: string) => {
    setIsNavigating(true);
    router.push(path);
  };

  return { navigateTo };
}