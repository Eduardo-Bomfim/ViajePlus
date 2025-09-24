export interface Activity {
  period: string;      
  activity: string;    
  details: string;     
}

export interface Day {
  dayTitle: string;
  activities: Activity[];
}

export interface ParsedItinerary {
  days: Day[];
}

export function parseItinerary(markdownText: string): ParsedItinerary | null {
  try {
    const dayBlocks = markdownText.split('**Dia ').slice(1);

    const days: Day[] = dayBlocks.map(block => {
      const lines = block.trim().split('\n');
      
      const titleLine = lines[0].trim();
      const dayTitle = `Dia ${titleLine.replace(/\*\*/g, '')}`;
      
      const activities: Activity[] = [];
      for (let i = 2; i < lines.length; i++) { 
        const row = lines[i];
        if (row.startsWith('|---') || row.trim() === '') continue; 

        const columns = row.split('|').map(col => col.trim());
        if (columns.length > 3 && columns[1] && columns[2] && columns[3]) {
          activities.push({
            period: columns[1],
            activity: columns[2],
            details: columns[3],
          });
        }
      }
      return { dayTitle, activities };
    });

    if (days.length === 0) throw new Error("No days found in itinerary.");

    return { days };

  } catch (error) {
    console.error("Failed to parse itinerary:", error);
    return null;
  }
}