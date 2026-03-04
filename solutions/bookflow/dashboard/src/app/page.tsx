import LandingPage from '@/components/landing/LandingPage';

// Authenticated users are redirected to /stats by middleware
export default function RootPage() {
  return <LandingPage />;
}
