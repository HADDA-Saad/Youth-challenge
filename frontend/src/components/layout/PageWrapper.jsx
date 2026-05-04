import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function PageWrapper({ children }) {
  return (
    <div className="min-h-screen bg-dark-900">
      <Sidebar />
      <Navbar />
      <main className="ml-64 pt-16">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
