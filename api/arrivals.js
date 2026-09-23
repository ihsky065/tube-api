import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  try {
    // 1. Read your data.json file
    const filePath = path.join(process.cwd(), 'api', 'data.json');
    const fileData = fs.readFileSync(filePath, 'utf8');
    const baseData = JSON.parse(fileData);

    // 2. Get the exact current minute from the real-world clock (0 to 59)
    const currentMinutes = new Date().getMinutes();

    // 3. Loop through the stations and trains
    const realTimeData = baseData.map((station, stationIndex) => {
      if (station.details && Array.isArray(station.details)) {
        
        const updatedDetails = station.details.map((train, trainIndex) => {
          // Set a fixed interval for this train sequence (e.g., arrives every 10 minutes)
          const interval = 10; 
          
          // Give each train a unique starting minute offset so they don't all arrive together
          const trainOffset = (stationIndex * 3 + trainIndex * 4) % interval;

          // Calculate how many minutes are left until the next scheduled slot
          // Formula: (Interval - ((Current Minute - Offset) % Interval)) % Interval
          let minutesLeft = (interval - ((currentMinutes - trainOffset) % interval)) % interval;
          
          // If the modulo math results in a negative number, wrap it around safely
          if (minutesLeft < 0) {
            minutesLeft += interval;
          }

          return {
            ...train,
            next_arrival_minutes: minutesLeft // Always counts down 5, 4, 3, 2, 1, 0, then loops!
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

    // 5. Output the dynamic JSON
    return res.status(200).json(realTimeData);

  } catch (error) {
    console.error("System Core Error:", error);
    return res.status(500).json({ error: "Failed to output live JSON object stream." });
  }
}
