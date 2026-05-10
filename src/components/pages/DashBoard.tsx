import DashboardLayout from '@/components/layout/DashboardLayout'
import { Outlet } from 'react-router-dom';

const Dashboard = () => {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  )
}

export default Dashboard