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
  Modal,
  Result,
} from 'antd';
import {
  InboxOutlined,
  DeleteOutlined,
  FileTextOutlined,
  MobileOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { Settings, UploadCloud, FileSpreadsheet, ShieldCheck, FileDown, Dumbbell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useWorkoutData } from '../hooks/useWorkoutData';
import { parseWorkoutCsv, parseMeasurementCsv } from '../utils/csvParser';

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
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
  const [currentStep, setCurrentStep] = useState(0);

  // Upload success modal state
  const [successModalData, setSuccessModalData] = useState<{
    visible: boolean;
    type: 'workout' | 'measurement';
    recordsCount: number;
    extraInfo?: string;
  }>({
    visible: false,
    type: 'workout',
    recordsCount: 0,
  });

  const handleWorkoutUpload = (file: File) => {
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text && text.includes('exercise_title')) {
        const parsed = parseWorkoutCsv(text);
        if (parsed.length === 0) {
          message.error('No data uploaded: The CSV file does not contain valid workout records. Your existing data was preserved.');
          setLoading(false);
          return;
        }
        uploadWorkout(text);
        message.success(`Successfully uploaded ${parsed.length} workout sets!`);
        setSuccessModalData({
          visible: true,
          type: 'workout',
          recordsCount: parsed.length,
          extraInfo: 'All your workout history, volume trends, and PRs have been updated.',
        });
      } else {
        message.error('No data uploaded: Invalid or empty workout CSV. Please ensure you upload workout_data.csv exported from Hevy.');
      }
      setLoading(false);
    };
    reader.onerror = () => {
      message.error('No data uploaded: Failed to read the file.');
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
        const parsed = parseMeasurementCsv(text);
        if (parsed.length === 0) {
          message.error('No data uploaded: The CSV file does not contain valid measurement records. Your existing data was preserved.');
          setLoading(false);
          return;
        }
        uploadMeasurement(text);
        message.success(`Successfully uploaded ${parsed.length} measurement entries!`);
        setSuccessModalData({
          visible: true,
          type: 'measurement',
          recordsCount: parsed.length,
          extraInfo: 'Your body weight and circumference charts have been updated.',
        });
      } else {
        message.error('No data uploaded: Invalid or empty measurement CSV. Please ensure you upload measurement_data.csv exported from Hevy.');
      }
      setLoading(false);
    };
    reader.onerror = () => {
      message.error('No data uploaded: Failed to read the file.');
      setLoading(false);
    };
    reader.readAsText(file);
    return false;
  };

  const exportSteps = [
    {
      title: 'Open Hevy App',
      sub: 'Profile tab',
      description: 'Open the Hevy mobile app on iOS or Android and tap the Profile icon in the bottom right corner.',
      icon: <MobileOutlined />,
    },
    {
      title: 'Settings Gear',
      sub: 'Top right icon',
      description: 'Tap the gear Settings icon in the top right corner of your profile screen.',
      icon: <Settings size={16} />,
    },
    {
      title: 'Export & Import Data',
      sub: 'Data section',
      description: 'Scroll down through the settings menu until you find the "Export & Import Data" row and tap it.',
      icon: <FileSpreadsheet size={16} />,
    },
    {
      title: 'Export CSV',
      sub: 'Tap Export Data',
      description: 'Tap "Export Data" and confirm. Hevy will generate your single CSV export file (workout_data.csv or measurement_data.csv).',
      icon: <UploadCloud size={16} />,
    },
    {
      title: 'Save to Files',
      sub: 'iOS & Android',
      description: (
        <div>
          <div style={{ marginBottom: 6 }}>
            <strong style={{ color: '#1890ff' }}>📱 iOS (iPhone / iPad):</strong> On the share sheet, tap <strong>"Save to Files"</strong> and choose your <strong>Downloads</strong> or <strong>On My iPhone</strong> folder.
          </div>
          <div>
            <strong style={{ color: '#52c41a' }}>🤖 Android:</strong> Tap <strong>"Save to Downloads"</strong> (or Save to Device) to save the CSV file directly.
          </div>
        </div>
      ),
      icon: <FileDown size={16} />,
    },
    {
      title: 'Upload Here',
      sub: 'Drop or click',
      description: 'Drag and drop or click to upload your saved CSV file into the respective upload box above!',
      icon: <ShieldCheck size={16} />,
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: 20 }}>
        <Title level={2} style={{ color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Settings size={26} color="#1890ff" />
          Data Settings & CSV Import
        </Title>
        <Text type="secondary">
          Upload your personal Hevy CSV export files, check storage status, or restore the default sample dataset. All your personal data is stored locally on the browser.
        </Text>
      </div>

      {/* 1. Top Upload Dropzones Section (Above everything else) */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12}>
          <Card
            title={
              <span style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Dumbbell size={18} color="#1890ff" />
                Upload Workout CSV (workout_data.csv)
              </span>
            }
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
                <InboxOutlined style={{ color: '#1890ff', fontSize: 42 }} />
              </p>
              <p className="ant-upload-text" style={{ color: '#d9d9d9', fontWeight: 600, fontSize: 15 }}>
                Click or drag workout_data.csv here
              </p>
              <p className="ant-upload-hint" style={{ color: '#8c8c8c', fontSize: 12 }}>
                See your progress with your workouts, personal stats, and 1RM predictions.
              </p>
            </Dragger>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            title={
              <span style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileSpreadsheet size={18} color="#52c41a" />
                Upload Measurement CSV (measurement_data.csv)
              </span>
            }
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
                <InboxOutlined style={{ color: '#52c41a', fontSize: 42 }} />
              </p>
              <p className="ant-upload-text" style={{ color: '#d9d9d9', fontWeight: 600, fontSize: 15 }}>
                Click or drag measurement_data.csv here
              </p>
              <p className="ant-upload-hint" style={{ color: '#8c8c8c', fontSize: 12 }}>
                See your progress with body measurements.
              </p>
            </Dragger>
          </Card>
        </Col>
      </Row>

      {/* 2. Current Data Storage Status Card */}
      <Card
        title={<span style={{ color: '#fff' }}>Current Data Storage Status</span>}
        style={{ backgroundColor: '#141414', borderColor: '#303030', marginBottom: 24 }}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <div style={{ padding: 16, backgroundColor: '#1f1f1f', borderRadius: 8, border: '1px solid #303030' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text strong style={{ color: '#d9d9d9', fontSize: 15 }}>
                  <FileTextOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  Workout Data
                </Text>
                {isUsingDefault ? (
                  <Tag color="purple">Sample Demo Dataset</Tag>
                ) : (
                  <Tag color="green">Your Custom CSV</Tag>
                )}
              </div>
              <div style={{ color: '#8c8c8c', fontSize: 13, marginBottom: 4 }}>
                Last updated:{' '}
                <strong style={{ color: '#bfbfbf' }}>
                  {workoutUploadTime ? dayjs(workoutUploadTime).format('D MMM YYYY, h:mm A') : 'Initial Sample Bundle'}
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
                <Text strong style={{ color: '#d9d9d9', fontSize: 15 }}>
                  <FileTextOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                  Measurement Data
                </Text>
                {measurementUploadTime ? (
                  <Tag color="green">Your Custom CSV</Tag>
                ) : (
                  <Tag color="purple">Sample Demo Dataset</Tag>
                )}
              </div>
              <div style={{ color: '#8c8c8c', fontSize: 13, marginBottom: 4 }}>
                Last updated:{' '}
                <strong style={{ color: '#bfbfbf' }}>
                  {measurementUploadTime ? dayjs(measurementUploadTime).format('D MMM YYYY, h:mm A') : 'Initial Sample Bundle'}
                </strong>
              </div>
              <div style={{ color: '#8c8c8c', fontSize: 13 }}>
                Records loaded: <strong style={{ color: '#52c41a' }}>{measurements.length} log entries</strong>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* 3. Interactive Stepper: How to Export Data from Hevy Mobile App (Below Uploads) */}
      <Card
        title={
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#1890ff' }}>
            <MobileOutlined />
            How to Export Data from the Hevy App
          </span>
        }
        style={{ backgroundColor: '#141414', borderColor: '#303030', marginBottom: 24 }}
      >
        <div style={{ marginBottom: 24 }}>
          <Steps
            current={currentStep}
            onChange={setCurrentStep}
            items={exportSteps.map((step) => ({
              title: step.title,
              description: step.sub,
              icon: step.icon,
            }))}
          />
        </div>

        {/* Active Step Detailed Card */}
        <div
          style={{
            padding: 20,
            backgroundColor: '#1f1f1f',
            borderRadius: 8,
            border: '1px solid #303030',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Tag color="blue" style={{ fontSize: 14, padding: '2px 10px', fontWeight: 700 }}>
                Step {currentStep + 1} of {exportSteps.length}
              </Tag>
              <Text strong style={{ color: '#fff', fontSize: 16 }}>
                {exportSteps[currentStep].title}
              </Text>
            </div>

            <Space>
              <Button
                size="small"
                disabled={currentStep === 0}
                onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
                icon={<LeftOutlined />}
              >
                Previous Step
              </Button>
              <Button
                size="small"
                type="primary"
                disabled={currentStep === exportSteps.length - 1}
                onClick={() => setCurrentStep((prev) => Math.min(exportSteps.length - 1, prev + 1))}
              >
                Next Step <RightOutlined />
              </Button>
            </Space>
          </div>

          <Paragraph style={{ color: '#d9d9d9', fontSize: 14, margin: 0 }}>
            {exportSteps[currentStep].description}
          </Paragraph>
        </div>
      </Card>

      {/* 4. Data Management Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          margin: '24px 0',
        }}
      >
        <Popconfirm
          title="Clear All Stored Data?"
          description="This will remove all workouts and body measurements. This action is irreversible, you will need to upload again."
          onConfirm={() => {
            resetDefaultData();
            message.success('Cleared stored data from browser');
          }}
          okText="Clear"
          cancelText="Cancel"
          okButtonProps={{ danger: true }}
        >
          <Button
            danger
            icon={<DeleteOutlined />}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            Clear all stored data
          </Button>
        </Popconfirm>
      </div>

      {/* Rich Upload Success Modal */}
      <Modal
        open={successModalData.visible}
        onOk={() => setSuccessModalData((prev) => ({ ...prev, visible: false }))}
        onCancel={() => setSuccessModalData((prev) => ({ ...prev, visible: false }))}
        footer={[
          <Button key="close" onClick={() => setSuccessModalData((prev) => ({ ...prev, visible: false }))}>
            Stay on Settings
          </Button>,
          <Button
            key="navigate"
            type="primary"
            onClick={() => {
              setSuccessModalData((prev) => ({ ...prev, visible: false }));
              navigate(successModalData.type === 'workout' ? '/' : '/measurements');
            }}
          >
            {successModalData.type === 'workout' ? 'Go to Dashboard' : 'Go to Measurements'}
          </Button>,
        ]}
      >
        <Result
          status="success"
          title={`${successModalData.type === 'workout' ? 'Workout' : 'Measurement'} CSV Uploaded Successfully!`}
          subTitle={
            <div>
              <p style={{ fontSize: 14, color: '#d9d9d9', marginBottom: 8 }}>
                Parsed and stored <strong>{successModalData.recordsCount} rows</strong> in your browser.
              </p>
              <p style={{ color: '#8c8c8c', fontSize: 13 }}>
                {successModalData.extraInfo}
              </p>
            </div>
          }
        />
      </Modal>
    </div>
  );
};
