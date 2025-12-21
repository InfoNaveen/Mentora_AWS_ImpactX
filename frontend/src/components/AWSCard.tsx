import React from 'react';

interface AWSCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  badge?: string;
  icon?: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const AWSCard: React.FC<AWSCardProps> = ({
  children,
  title,
  subtitle,
  badge,
  icon,
  className = '',
  noPadding = false,
}) => {
  return (
    <div className={`aws-card ${className}`}>
      {(title || subtitle || badge || icon) && (
        <div className="aws-card-header">
          <div className="aws-card-header-left">
            {icon && <div className="aws-card-icon">{icon}</div>}
            <div className="aws-card-titles">
              {title && <h3 className="aws-card-title">{title}</h3>}
              {subtitle && <p className="aws-card-subtitle">{subtitle}</p>}
            </div>
          </div>
          {badge && <span className="aws-card-badge">{badge}</span>}
        </div>
      )}
      <div className={`aws-card-content ${noPadding ? 'no-padding' : ''}`}>
        {children}
      </div>

      <style jsx>{`
        .aws-card {
          background: #0f1318;
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 10px;
          overflow: hidden;
          transition: border-color 0.2s ease, transform 0.2s ease;
          display: flex;
          flex-direction: column;
        }

        .aws-card:hover {
          border-color: rgba(255, 255, 255, 0.1);
        }

        .aws-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .aws-card-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .aws-card-icon {
          width: 32px;
          height: 32px;
          background: rgba(255, 255, 255, 0.04);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
        }

        .aws-card-titles {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .aws-card-title {
          font-size: 14px;
          font-weight: 500;
          color: #f1f5f9;
          margin: 0;
        }

        .aws-card-subtitle {
          font-size: 11px;
          color: #64748b;
          margin: 0;
        }

        .aws-card-badge {
          padding: 4px 10px;
          background: rgba(255, 255, 255, 0.04);
          border-radius: 4px;
          font-size: 11px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .aws-card-content {
          padding: 20px;
          flex: 1;
        }

        .aws-card-content.no-padding {
          padding: 0;
        }
      `}</style>
    </div>
  );
};
