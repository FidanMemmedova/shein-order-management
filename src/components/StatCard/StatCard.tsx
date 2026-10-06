import React from "react";
import { Card, Skeleton } from "antd";
import "./StatCard.css";

interface StatCardProps {
  icon: React.ReactNode;
  tone: "neutral" | "blue" | "green" | "teal" | "orange";
  title: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ icon, tone, title, value, hint, loading }) => (
  <Card className="surface-card stat-card">
    <div className="stat-card__body">
      <span className={`stat-card__icon stat-card__icon--${tone}`}>{icon}</span>
      <div className="stat-card__text">
        <span className="stat-card__title">{title}</span>
        {loading ? (
          <Skeleton.Input active size="small" className="stat-card__skeleton" />
        ) : (
          <span className="stat-card__value">
            {value}
            {hint && <span className="stat-card__hint">{hint}</span>}
          </span>
        )}
      </div>
    </div>
  </Card>
);

export default StatCard;
