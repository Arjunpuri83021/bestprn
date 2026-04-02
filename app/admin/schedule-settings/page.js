'use client';
import { useState, useEffect } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import Protected from '../Protected';
import '../AdminStyles.css';

export default function ScheduleSettings() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const [settings, setSettings] = useState({
    intervalMinutes: 120,
    batchSize: 5,
    autoPublishEnabled: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const presets = [
    { label: '1 Minute', minutes: 1 },
    { label: '5 Minutes', minutes: 5 },
    { label: '10 Minutes', minutes: 10 },
    { label: '15 Minutes', minutes: 15 },
    { label: '30 Minutes', minutes: 30 },
    { label: '1 Hour', minutes: 60 },
    { label: '2 Hours', minutes: 120 },
    { label: '3 Hours', minutes: 180 },
    { label: '6 Hours', minutes: 360 },
    { label: '12 Hours', minutes: 720 },
    { label: '1 Day', minutes: 1440 },
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${apiUrl}/schedule/settings`);
      const data = await res.json();
      if (data.success) setSettings(data.settings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch(`${apiUrl}/schedule/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        setSettings(data.settings);
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const handlePresetClick = (minutes) => {
    setSettings({ ...settings, intervalMinutes: minutes });
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
    }
    const days = Math.floor(minutes / 1440);
    return `${days} day${days > 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <Protected>
        <div className="admin-dashboard">
          <AdminNavbar />
          <div className="admin-content">
            <div className="container">
              <div className="text-center mt-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Protected>
    );
  }

  return (
    <Protected>
      <div className="admin-dashboard">
        <AdminNavbar />
        <div className="admin-content">
          <div className="container">
            <div className="admin-table-container">
              <div className="admin-table-header">
                <h2>
                  <i className="bi bi-gear-fill me-2"></i>Schedule Settings
                </h2>
              </div>

              {message.text && (
                <div
                  className={`alert alert-${
                    message.type === 'success' ? 'success' : 'danger'
                  } alert-dismissible fade show`}
                  role="alert"
                >
                  {message.text}
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setMessage({ type: '', text: '' })}
                  ></button>
                </div>
              )}

              <div className="card">
                <div className="card-body">
                  <h5 className="card-title mb-4">Automatic Publishing Configuration</h5>

                  <div className="mb-4 p-3 bg-light rounded">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="autoPublishToggle"
                        checked={settings.autoPublishEnabled}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            autoPublishEnabled: e.target.checked,
                          })
                        }
                        style={{ width: '3em', height: '1.5em' }}
                      />
                      <label
                        className="form-check-label ms-2"
                        htmlFor="autoPublishToggle"
                      >
                        <strong>
                          {settings.autoPublishEnabled
                            ? '✅ Auto-Publish Enabled'
                            : '⏸️ Auto-Publish Disabled'}
                        </strong>
                        <p className="text-muted small mb-0 mt-1">
                          {settings.autoPublishEnabled
                            ? 'Posts will automatically publish based on the schedule below'
                            : 'Automatic publishing is paused. Posts can only be published manually.'}
                        </p>
                      </label>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label">
                      <strong>Publishing Interval</strong>
                    </label>
                    <p className="text-muted small">
                      How often should posts be automatically published?
                    </p>

                    <div className="mb-3">
                      <label className="form-label small text-muted">Quick Select:</label>
                      <div className="d-flex flex-wrap gap-2">
                        {presets.map((preset) => (
                          <button
                            key={preset.minutes}
                            type="button"
                            className={`btn btn-sm ${
                              settings.intervalMinutes === preset.minutes
                                ? 'btn-primary'
                                : 'btn-outline-primary'
                            }`}
                            onClick={() => handlePresetClick(preset.minutes)}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="row align-items-end">
                      <div className="col-md-6">
                        <label className="form-label small">Custom Interval (minutes):</label>
                        <input
                          type="number"
                          className="form-control"
                          value={settings.intervalMinutes}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              intervalMinutes: parseInt(e.target.value) || 1,
                            })
                          }
                          min="1"
                          max="10080"
                        />
                        <small className="text-muted">
                          Min: 1 minute, Max: 1 week (10080 minutes)
                        </small>
                      </div>
                      <div className="col-md-6">
                        <div className="alert alert-info mb-0">
                          <strong>Current Setting:</strong> {formatTime(settings.intervalMinutes)}
                          <br />
                          <small>
                            Posts will publish every {formatTime(settings.intervalMinutes)}
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label">
                      <strong>Batch Size</strong>
                    </label>
                    <p className="text-muted small">
                      How many posts should be published each time?
                    </p>
                    <div className="row">
                      <div className="col-md-6">
                        <input
                          type="number"
                          className="form-control"
                          value={settings.batchSize}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              batchSize: parseInt(e.target.value) || 1,
                            })
                          }
                          min="1"
                          max="100"
                        />
                        <small className="text-muted">Min: 1 post, Max: 100 posts</small>
                      </div>
                      <div className="col-md-6">
                        <div className="alert alert-success mb-0">
                          <strong>{settings.batchSize} posts</strong> will be published every{' '}
                          {formatTime(settings.intervalMinutes)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4 p-3 bg-light rounded">
                    <h6 className="mb-3">
                      <i className="bi bi-clock-history me-2"></i>Example Timeline
                    </h6>
                    <p className="small text-muted mb-2">If you add 50 unpublished posts:</p>
                    <ul className="small mb-0">
                      <li>
                        <strong>Now:</strong> 0 posts published
                      </li>
                      <li>
                        <strong>After {formatTime(settings.intervalMinutes)}:</strong>{' '}
                        {settings.batchSize} posts published
                      </li>
                      <li>
                        <strong>After {formatTime(settings.intervalMinutes * 2)}:</strong>{' '}
                        {settings.batchSize * 2} posts published
                      </li>
                      <li>
                        <strong>After {formatTime(settings.intervalMinutes * 3)}:</strong>{' '}
                        {settings.batchSize * 3} posts published
                      </li>
                      <li>
                        <strong>
                          After{' '}
                          {formatTime(
                            Math.ceil(50 / settings.batchSize) * settings.intervalMinutes
                          )}
                          :
                        </strong>{' '}
                        All 50 posts published
                      </li>
                    </ul>
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-primary"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-save me-2"></i>
                          Save Settings
                        </>
                      )}
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={fetchSettings}
                      disabled={saving}
                    >
                      <i className="bi bi-arrow-clockwise me-2"></i>
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              <div className="row mt-4">
                <div className="col-md-4">
                  <div className="card bg-primary text-white">
                    <div className="card-body">
                      <h6 className="card-title">
                        <i className="bi bi-info-circle me-2"></i>How It Works
                      </h6>
                      <p className="card-text small mb-0">
                        The scheduler automatically publishes unpublished posts based on your
                        settings. Oldest posts are published first.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card bg-success text-white">
                    <div className="card-body">
                      <h6 className="card-title">
                        <i className="bi bi-lightning me-2"></i>Manual Override
                      </h6>
                      <p className="card-text small mb-0">
                        You can always manually publish posts immediately from the Posts page,
                        regardless of these settings.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card bg-warning text-dark">
                    <div className="card-body">
                      <h6 className="card-title">
                        <i className="bi bi-exclamation-triangle me-2"></i>Important
                      </h6>
                      <p className="card-text small mb-0">
                        Changes take effect immediately. The scheduler will restart with new
                        settings after you save.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Protected>
  );
}
