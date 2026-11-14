import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import CustomersPage from './pages/CustomersPage';
import AccountsPage from './pages/AccountsPage';
import LoansPage from './pages/LoansPage';
import TransactionsPage from './pages/TransactionsPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/customers" replace />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/loans" element={<LoansPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="*" element={<Navigate to="/customers" replace />} />
      </Route>
    </Routes>
  );
}
