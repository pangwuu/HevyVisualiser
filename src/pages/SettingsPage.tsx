import React, { useState } from 'react';
import {
  Card,
  Typography,
  Row,
  Col,
  Upload,
  Button,
  Steps,
  message,
  Popconfirm,
  Tag,
  Space,
} from 'antd';
import {
  InboxOutlined,
  DeleteOutlined,
  ReloadOutlined,
  FileTextOutlined,
  MobileOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useWorkoutData } from '../hooks/useWorkoutData';

const { Title, Text } = Typography;
const { Dragger } = Upload;

export const SettingsPage: React.FC = () => {
  const {
    workoutUploadTime,
    measurementUploadTime,
    isUsingDefault,
    uploadWorkout,
    uploadMeasurement,
    resetDefaultData,
    allSets,
    allSessions,
    measurements,
  } = useWorkoutData();

  const [loading, setLoading] = useState(false);

  const handleWorkoutUpload = (file: File) => {
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text && text.includes('exercise_title')) {
        uploadWorkout(text);
        message.success('Workout data CSV uploaded and saved successfully!');
      } else {
        message.error('Invalid workout CSV. Please ensure you uploaded workout_data.csv from Hevy.');
      }
      setLoading(false);
    };
    reader.readAsText(file);
    return false;
  };

  const handleMeasurementUpload = (file: File) => {
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text && (text.includes('weight_kg') || text.includes('date'))) {
        uploadMeasurement(text);
        message.success('Measurement data CSV uploaded and saved successfully!');
      } else {
        message.error('Invalid measurement CSV. Please ensure you uploaded measurement_data.csv from Hevy.');
      }
      setLoading(false);
    };
    reader.readAsText(file);
    return false;
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Title level={2} style={{ color: '#fff', margin: 0 }}>
          ⚙️ Data Settings & Hevy CSV Import
        </Title>
        <Text type="secondary">
          Manage your workout dataset, upload updated Hevy CSV exports, and view storage status.
        </Text>
      </div>

      <Card
        title={
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#1890ff' }}>
            <MobileOutlined />
            How to Export Data from Hevy Mobile App
          </span>
        }
        style={{ backgroundColor: '#141414', borderColor: '#303030', marginBottom: 24 }}
      >
        <Steps
          direction="horizontal"
          responsive
          items={[
            {
              title: 'Open Hevy App',
              description: 'Go to your Profile tab (bottom right)',
            },
            {
              title: 'Settings',
              description: 'Tap the ⚙️ Gear icon in the top right',
            },
            {
              title: 'Export & Import Data',
              description: 'Scroll down to "Export & Import Data"',
            },
            {
              title: 'Export CSV',
              description: 'Tap "Export Data" → Confirm "Export"',
            },
            {
              title: 'Upload Here',
              description: 'Unzip files and drop workout_data.csv below',
            },
          ]}
        />
      </Card>

      <Card
        title={<span style={{ color: '#fff' }}>Current Data Storage Status</span>}
        style={{ backgroundColor: '#141414', borderColor: '#303030', marginBottom: 24 }}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <div style={{ padding: 16, backgroundColor: '#1f1f1f', borderRadius: 8, border: '1px solid #303030' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text strong style={{ color: '#d9d9d9', fontSize: 16 }}>
                  <FileTextOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  Workout Data (workout_data.csv)
                </Text>
                {isUsingDefault ? (
                  <Tag color="purple">Bundled Default</Tag>
                ) : (
                  <Tag color="green">Custom Uploaded</Tag>
                )}
              </div>
              <div style={{ color: '#8c8c8c', fontSize: 13, marginBottom: 4 }}>
                Last updated:{' '}
                <strong style={{ color: '#bfbfbf' }}>
                  {workoutUploadTime ? dayjs(workoutUploadTime).format('D MMM YYYY, h:mm A') : 'Initial Bundle'}
                </strong>
              </div>
              <div style={{ color: '#8c8c8c', fontSize: 13 }}>
                Records loaded: <strong style={{ color: '#52c41a' }}>{allSets.length} sets</strong> across{' '}
                <strong style={{ color: '#1890ff' }}>{allSessions.length} sessions</strong>
              </div>
            </div>
          </Col>

          <Col xs={24} md={12}>
            <div style={{ padding: 16, backgroundColor: '#1f1f1f', borderRadius: 8, border: '1px solid #303030' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text strong style={{ color: '#d9d9d9', fontSize: 16 }}>
                  <FileTextOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                  Measurement Data (measurement_data.csv)
                </Text>
                {measurementUploadTime ? (
                  <Tag color="green">Custom Uploaded</Tag>
                ) : (
                  <Tag color="purple">Bundled Default</Tag>
                )}
              </div>
              <div style={{ color: '#8c8c8c', fontSize: 13, marginBottom: 4 }}>
                Last updated:{' '}
                <strong style={{ color: '#bfbfbf' }}>
                  {measurementUploadTime ? dayjs(measurementUploadTime).format('D MMM YYYY, h:mm A') : 'Initial Bundle'}
                </strong>
              </div>
              <div style={{ color: '#8c8c8c', fontSize: 13 }}>
                Records loaded: <strong style={{ color: '#52c41a' }}>{measurements.length} log entries</strong>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12}>
          <Card
            title={<span style={{ color: '#fff' }}>Upload Workout CSV</span>}
            style={{ backgroundColor: '#141414', borderColor: '#303030', height: '100%' }}
          >
            <Dragger
              name="workoutFile"
              multiple={false}
              accept=".csv"
              beforeUpload={handleWorkoutUpload}
              showUploadList={false}
              disabled={loading}
              style={{ backgroundColor: '#1f1f1f', borderColor: '#434343' }}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined style={{ color: '#1890ff', fontSize: 40 }} />
              </p>
              <p className="ant-upload-text" style={{ color: '#d9d9d9', fontWeight: 600 }}>
                Click or drag workout_data.csv here
              </p>
              <p className="ant-upload-hint" style={{ color: '#8c8c8c', fontSize: 12 }}>
                Stored locally in your browser (LocalStorage). Instant reload.
              </p>
            </Dragger>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            title={<span style={{ color: '#fff' }}>Upload Measurement CSV</span>}
            style={{ backgroundColor: '#141414', borderColor: '#303030', height: '100%' }}
          >
            <Dragger
              name="measurementFile"
              multiple={false}
              accept=".csv"
              beforeUpload={handleMeasurementUpload}
              showUploadList={false}
              disabled={loading}
              style={{ backgroundColor: '#1f1f1f', borderColor: '#434343' }}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined style={{ color: '#52c41a', fontSize: 40 }} />
              </p>
              <p className="ant-upload-text" style={{ color: '#d9d9d9', fontWeight: 600 }}>
                Click or drag measurement_data.csv here
              </p>
              <p className="ant-upload-hint" style={{ color: '#8c8c8c', fontSize: 12 }}>
                Enables scale weight & circumference trend tracking.
              </p>
            </Dragger>
          </Card>
        </Col>
      </Row>

      <Card
        title={<span style={{ color: '#fff' }}>Data Management Actions</span>}
        style={{ backgroundColor: '#141414', borderColor: '#303030' }}
      >
        <Space size="middle" wrap>
          <Popconfirm
            title="Reset to Default Bundle?"
            description="This will clear custom uploaded CSVs and restore the original sample dataset."
            onConfirm={() => {
              resetDefaultData();
              message.info('Reset to default bundled dataset');
            }}
            okText="Yes, Reset"
            cancelText="Cancel"
          >
            <Button icon={<ReloadOutlined />}>
              Restore Default Sample Dataset
            </Button>
          </Popconfirm>

          <Popconfirm
            title="Clear All Stored Data?"
            description="This will remove stored CSVs from localStorage."
            onConfirm={() => {
              resetDefaultData();
              message.success('Cleared stored data');
            }}
            okText="Clear"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<DeleteOutlined />}>
              Clear Browser LocalStorage
            </Button>
          </Popconfirm>
        </Space>
      </Card>
    </div>
  );
};
