import { AuthProvider } from '../context/AuthContext';
import './global.css';

export const metadata = {
  title: 'Ibiri',
  description:
    'Revolutionising financial inclusion in Africa through AI-driven credit scoring, offline transactions, and blockchain security.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
