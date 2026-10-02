import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

export function NotFoundPage() {
  return (
    <EmptyState
      icon={<Compass className="h-6 w-6" />}
      title="Page not found"
      description="The page you're looking for doesn't exist."
      action={
        <Link to="/" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
          Go to dashboard
        </Link>
      }
    />
  );
}
