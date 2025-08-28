import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getAnalyticsSummary } from '../services/apiService';
import styles from './AnalyticsPage.module.css';

const AnalyticsPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAnalyticsSummary();
        setSummary(data);
      } catch (error) {
        console.error("Failed to fetch analytics", error);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  if (!summary) {
    return <div>Could not load analytics data.</div>;
  }

  return (
    <div className={styles.pageContainer}>
      <h1>Analytics</h1>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h2>{summary.importers_count}</h2>
          <p>Importers</p>
        </div>
        <div className={styles.statCard}>
          <h2>{summary.suppliers_count}</h2>
          <p>Suppliers</p>
        </div>
        <div className={styles.statCard}>
          <h2>{summary.products_count}</h2>
          <p>Products</p>
        </div>
        <div className={styles.statCard}>
          <h2>{summary.shipped_containers_count}</h2>
          <p>Shipped Containers</p>
        </div>
      </div>

      <div className={styles.chartContainer}>
        <h2>Orders per Month</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={summary.orders_by_month}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsPage;
