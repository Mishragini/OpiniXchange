'use client'
import { AuthProvider } from '../_components/AuthProvider';
import { CategoryProvider } from '../_components/CategoryProvider';
import { DashboardAppbar } from './_components/DashboardAppbar';
import { WebSocketProvider } from './_components/WebsocketProvider';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <CategoryProvider>
          <DashboardAppbar />
          {children}
        </CategoryProvider>
      </WebSocketProvider>
    </AuthProvider>
  );
}