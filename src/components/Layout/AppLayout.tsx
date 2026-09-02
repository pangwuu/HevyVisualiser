import React, { useState } from 'react';
import { Layout, Menu, Typography, Button, Drawer, Tag, Space, Alert } from 'antd';
import {
  DashboardOutlined,
  FireOutlined,
  DotChartOutlined,
  ThunderboltOutlined,
  AreaChartOutlined,
  SettingOutlined,
  MenuOutlined,
  CloudUploadOutlined,
} from '@ant-design/icons';
import { Dumbbell, AlertTriangle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWorkoutData } from '../../hooks/useWorkoutData';

const { Header, Sider, Content, Footer } = Layout;
const { Text } = Typography;

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { allSessions, allSets, isUsingDefault } = useWorkoutData();

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/workouts',
      icon: <FireOutlined />,
      label: 'Workouts & Volume',
    },
    {
      key: '/muscles',
      icon: <DotChartOutlined />,
      label: 'Muscle Breakdown',
    },
    {
      key: '/exercises',
      icon: <ThunderboltOutlined />,
      label: 'Exercise Library',
    },
    {
      key: '/measurements',
      icon: <AreaChartOutlined />,
      label: 'Measurements',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Settings & Import',
    },
  ];

  const handleMenuClick = (key: string) => {
    navigate(key);
    setMobileDrawerOpen(false);
  };

  const navContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand logo */}
      <div
        onClick={() => {
          navigate('/');
          setMobileDrawerOpen(false);
        }}
        style={{
          padding: '20px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 8, backgroundColor: 'rgba(24, 144, 255, 0.15)' }}>
          <Dumbbell size={20} color="#1890ff" />
        </div>
        {!collapsed && (
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#fff', letterSpacing: '0.5px' }}>
              HEVY <span style={{ color: '#1890ff' }}>STATS</span>
            </div>
            <div style={{ fontSize: 11, color: '#8c8c8c' }}>Workout Visualiser</div>
          </div>
        )}
      </div>

      {/* Menu */}
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        onClick={({ key }) => handleMenuClick(key)}
        items={menuItems}
        style={{ backgroundColor: 'transparent', borderRight: 0 }}
      />

      <div style={{ marginTop: 'auto', padding: 16 }}>
        {!collapsed && (
          <div style={{ padding: 12, backgroundColor: '#1f1f1f', borderRadius: 8, border: '1px solid #303030' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text type="secondary" style={{ fontSize: 11 }}>STATUS</Text>
              <Tag color={isUsingDefault ? 'purple' : 'green'} style={{ fontSize: 10 }}>
                {isUsingDefault ? 'Sample Data' : 'Live CSV'}
              </Tag>
            </div>
            <div style={{ color: '#d9d9d9', fontSize: 12 }}>
              {allSessions.length} total sessions
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#0f0f0f' }}>
      {/* Desktop Sider */}
      <Sider
        breakpoint="lg"
        collapsedWidth="64"
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{
          backgroundColor: '#141414',
          borderRight: '1px solid #262626',
        }}
        className="desktop-sider"
      >
        {navContent}
      </Sider>

      {/* Mobile Drawer */}
      <Drawer
        placement="left"
        onClose={() => setMobileDrawerOpen(false)}
        open={mobileDrawerOpen}
        styles={{ body: { padding: 0, backgroundColor: '#141414' } }}
        width={240}
      >
        {navContent}
      </Drawer>

      <Layout style={{ backgroundColor: '#0f0f0f' }}>
        {/* Top Header */}
        <Header
          style={{
            padding: '0 20px',
            backgroundColor: '#141414',
            borderBottom: '1px solid #262626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 64,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button
              className="mobile-menu-btn"
              type="text"
              icon={<MenuOutlined style={{ color: '#fff', fontSize: 18 }} />}
              onClick={() => setMobileDrawerOpen(true)}
            />
            <div
              onClick={() => navigate('/')}
              style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}
            >
              <Dumbbell size={18} color="#1890ff" />
              <span style={{ fontWeight: 700, fontSize: 16, color: '#fff' }}>
                Hevy Data Dashboard
              </span>
            </div>
          </div>

          <Space size="middle">
            <Button
              type="primary"
              size="middle"
              icon={<CloudUploadOutlined />}
              onClick={() => navigate('/settings')}
            >
              Import CSV
            </Button>
          </Space>
        </Header>

        {/* Page Content */}
        <Content className="app-content-wrapper">
          <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            {/* Global Sample Demo Dataset Alert */}
            {location.pathname !== '/settings' && isUsingDefault && (
              <Alert
                message={
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <strong style={{ color: '#faad14', fontSize: 14 }}>
                        Viewing Sample Demo Dataset
                      </strong>
                      <div style={{ color: '#d9d9d9', fontSize: 13, marginTop: 2 }}>
                        You are currently viewing a demonstration dataset. Upload your personal Hevy CSV export to visualize your real workout statistics, 1RM progression, and muscle distribution.
                      </div>
                    </div>
                    <Button
                      type="primary"
                      icon={<CloudUploadOutlined />}
                      onClick={() => navigate('/settings')}
                      style={{ backgroundColor: '#faad14', borderColor: '#d48806', color: '#000', fontWeight: 600 }}
                    >
                      Upload Your CSV
                    </Button>
                  </div>
                }
                type="warning"
                showIcon
                icon={<AlertTriangle size={18} color="#faad14" />}
                style={{ marginBottom: 16, backgroundColor: 'rgba(250, 173, 20, 0.1)', borderColor: 'rgba(250, 173, 20, 0.3)' }}
                closable
              />
            )}

            {/* Global No Data Uploaded Alert */}
            {location.pathname !== '/settings' && !isUsingDefault && allSets.length === 0 && (
              <Alert
                message={
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <strong style={{ color: '#ff4d4f', fontSize: 14 }}>
                        No Data Uploaded
                      </strong>
                      <div style={{ color: '#d9d9d9', fontSize: 13, marginTop: 2 }}>
                        No workout records found. Please upload your Hevy workout_data.csv to start visualizing your training data.
                      </div>
                    </div>
                    <Button
                      type="primary"
                      danger
                      icon={<CloudUploadOutlined />}
                      onClick={() => navigate('/settings')}
                      style={{ fontWeight: 600 }}
                    >
                      Upload CSV Now
                    </Button>
                  </div>
                }
                type="error"
                showIcon
                icon={<AlertTriangle size={18} color="#ff4d4f" />}
                style={{ marginBottom: 16, backgroundColor: 'rgba(255, 77, 79, 0.1)', borderColor: 'rgba(255, 77, 79, 0.3)' }}
              />
            )}

            {children}
          </div>
        </Content>

        <Footer style={{ textAlign: 'center', backgroundColor: '#0f0f0f', color: '#595959', fontSize: 12 }}>
          Hevy Workout Visualiser &copy; {new Date().getFullYear()} &bull; Built with React, Vite & Ant Design. This is a hobby project. It is not affiliated in any way to the Hevy app.
        </Footer>
      </Layout>
    </Layout>
  );
};
