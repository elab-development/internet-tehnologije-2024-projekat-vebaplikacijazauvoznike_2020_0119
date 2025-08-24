import { useState } from 'react';
import styles from './Tabs.module.css';

/**
 * Reusable Tabs Component
 * @param {object} props
 * @param {Array<{label: string, content: React.ReactNode}>} props.tabs - An array of tab objects.
 */
const Tabs = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(0);

  if (!tabs || tabs.length === 0) {
    return null;
  }

  return (
    <div>
      <div className={styles.tabs} role="tablist">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`${styles.tabBtn} ${activeTab === index ? styles.active : ''}`}
            onClick={() => setActiveTab(index)}
            role="tab"
            aria-selected={activeTab === index}
            aria-controls={`tabpanel-${index}`}
            id={`tab-${index}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        className={styles.tabPanel}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        id={`tabpanel-${activeTab}`}
      >
        {tabs[activeTab].content}
      </div>
    </div>
  );
};

export default Tabs;
