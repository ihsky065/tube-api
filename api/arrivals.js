import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  try {
    // 1. Read your modified data.json file
    const filePath = path.join(process.cwd(), 'api', 'data.json');
    const fileData = fs.readFileSync(filePath, 'utf8');
    const baseData = JSON.parse(fileData);

    // 2. Fetch current time metrics
    const now = new Date();
    const currentMinutes = now.getMinutes();
    const currentSeconds = now.getSeconds();
    
    // We use the current date/hour as a seed base so "random" numbers persist for a bit
    const seedBase = now.getFullYear() + now.getMonth() + now.getDate() + now.getHours();

    // 3. Loop through the outer array elements
    const realTimeData = baseData.map((station, stationIndex) => {
      if (station.details && Array.isArray(station.details)) {
        
        const updatedDetails = station.details.map((train, trainIndex) => {
          // Create a unique deterministic cycle length for this specific train (e.g., between 8 and 15 minutes)
          const cycleSeed = (seedBase + stationIndex + trainIndex) % 8;
          const totalCycleMinutes = 8 + cycleSeed; 

          // Shift the start time so trains don't all arrive at the exact same minute
          const trainOffset = (trainIndex * 3) % totalCycleMinutes;
          
          // Calculate how many minutes are left in the current cycle
          let dynamicCountdown = totalCycleMinutes - ((currentMinutes + trainOffset) % totalCycleMinutes);
          
          // Drop it to 0 when it reaches the final minute, matching the clock's progress
          if (dynamicCountdown === totalCycleMinutes) {
            dynamicCountdown = 0;
          }

          return {
            ...train,
            next_arrival_minutes: dynamicCountdown
          };
        });

        return {
          ...station,
          details: updatedDetails
        };
      }
      
      return station;
    });

    // 4. Set network system headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    // 5. Output the clean, dynamic JSON nested object structure
    return res.status(200).json(realTimeData);

  } catch (error) {
    console.error("System Core Error:", error);
    return res.status(500).json({ error: "Failed to output live JSON object stream." });
  }
}
