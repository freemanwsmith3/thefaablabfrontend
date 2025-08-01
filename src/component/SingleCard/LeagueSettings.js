import React, { useState } from 'react';
import { Modal, Button, Radio, InputNumber } from 'antd';
import { SettingOutlined } from '@ant-design/icons';

const LeagueSettings = ({ isVisible, handleOk, handleCancel, currentSettings, onSettingsChange }) => {
  const [tempSettings, setTempSettings] = useState(currentSettings);

  const handleSave = () => {
    onSettingsChange(tempSettings);
    handleOk();
  };

  const updateSetting = (key, value) => {
    setTempSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <Modal 
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SettingOutlined />
          League Settings
        </div>
      }
      visible={isVisible} 
      onOk={handleSave} 
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          Save Settings
        </Button>,
      ]}
      width={450}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Team Count */}
        <div>
          <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', fontSize: '14px' }}>
            Team Count
          </label>
          <Radio.Group 
            value={tempSettings.teamCount} 
            onChange={(e) => updateSetting('teamCount', e.target.value)}
            style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}
          >
            <Radio.Button value={8}>8</Radio.Button>
            <Radio.Button value={10}>10</Radio.Button>
            <Radio.Button value={12}>12</Radio.Button>
            <Radio.Button value={14}>14</Radio.Button>
            <Radio.Button value={16}>16</Radio.Button>
          </Radio.Group>
        </div>

        {/* Scoring System */}
        <div>
          <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', fontSize: '14px' }}>
            Scoring System
          </label>
          <Radio.Group 
            value={tempSettings.scoring} 
            onChange={(e) => updateSetting('scoring', e.target.value)}
            style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}
          >
            <Radio.Button value="standard">Standard</Radio.Button>
            <Radio.Button value="half-ppr">Half PPR</Radio.Button>
            <Radio.Button value="full-ppr">Full PPR</Radio.Button>
          </Radio.Group>
        </div>

        {/* Budget */}
        <div>
          <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', fontSize: '14px' }}>
            Auction Budget
          </label>
          <Radio.Group 
            value={tempSettings.budget} 
            onChange={(e) => updateSetting('budget', e.target.value)}
            style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}
          >
            <Radio.Button value={100}>$100</Radio.Button>
            <Radio.Button value={200}>$200</Radio.Button>
            <Radio.Button value={300}>$300</Radio.Button>
          </Radio.Group>
          <div style={{ marginTop: '8px' }}>
            <label style={{ fontSize: '12px', color: '#666', marginRight: '8px' }}>Custom:</label>
            <InputNumber
              value={tempSettings.budget}
              onChange={(value) => updateSetting('budget', value)}
              style={{ width: '80px' }}
              min={50}
              max={500}
              step={25}
              size="small"
            />
          </div>
        </div>

        {/* Quarterback Format */}
        <div>
          <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', fontSize: '14px' }}>
            Quarterback Format
          </label>
          <Radio.Group 
            value={tempSettings.isSuperflex} 
            onChange={(e) => updateSetting('isSuperflex', e.target.value)}
            style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}
          >
            <Radio.Button value={false}>Standard (1 QB)</Radio.Button>
            <Radio.Button value={true}>Superflex (2 QB)</Radio.Button>
          </Radio.Group>
        </div>

        {/* League Type */}
        <div>
          <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', fontSize: '14px' }}>
            League Type
          </label>
          <Radio.Group 
            value={tempSettings.leagueType} 
            onChange={(e) => updateSetting('leagueType', e.target.value)}
            style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}
          >
            <Radio.Button value="redraft">Redraft</Radio.Button>
            <Radio.Button value="dynasty">Dynasty</Radio.Button>
            <Radio.Button value="keeper">Keeper</Radio.Button>
          </Radio.Group>
        </div>

        {/* Current vs Baseline Display */}
        <div style={{ 
          padding: '16px', 
          backgroundColor: '#f8fafc', 
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px', fontWeight: '600' }}>
            DATA CONVERSION INFO
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5', marginBottom: '4px' }}>
            <strong>Your League:</strong> {tempSettings.teamCount} teams • {
              tempSettings.scoring === 'standard' ? 'Standard' :
              tempSettings.scoring === 'half-ppr' ? 'Half PPR' : 'Full PPR'
            } • ${tempSettings.budget} budget{tempSettings.isSuperflex ? ' • Superflex' : ''}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
            <strong>Baseline:</strong> 12 teams • Half PPR • $200 budget • Standard
          </div>
        </div>

      </div>
    </Modal>
  );
};

export default LeagueSettings;