import React from 'react';
import { parseItinerary } from '../../utils/itineraryParser';
import styles from './ItineraryDisplay.module.css';

const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;

interface Props {
  markdownText: string;
}

export const ItineraryDisplay: React.FC<Props> = ({ markdownText }) => {
  const itineraryData = parseItinerary(markdownText);

  if (!itineraryData) {
    return <div className={styles.fallbackText}>{markdownText}</div>;
  }

  const { days } = itineraryData;

  return (
    <div className={styles.itineraryContainer}>
      <h3 className={styles.mainTitle}>Seu Roteiro de Viagem Personalizado ✈️</h3>
      {days.map((day, index) => (
        <details key={index} className={styles.dayAccordion} open={index === 0}>
          <summary className={styles.daySummary}>
            <CalendarIcon />
            <span>{day.dayTitle}</span>
          </summary>
          <div className={styles.activityList}>
            {day.activities.map((activity, actIndex) => (
              <div key={actIndex} className={styles.activityItem}>
                <div className={styles.activityHeader}>
                  <ClockIcon />
                  <span className={styles.period}>{activity.period}</span>
                  <h4 className={styles.activityTitle}>{activity.activity}</h4>
                </div>
                <p className={styles.details}>{activity.details}</p>
              </div>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
};