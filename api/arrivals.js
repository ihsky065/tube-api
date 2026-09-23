import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  try {
    // 1. Read your modified data.json file
    const filePath = path.join(process.cwd(), 'api', 'data.json');
    const fileData = fs.readFileSync(filePath, 'utf8');
    const baseData = JSON.parse(fileData);

    // 2. Fetch absolute real-time minutes elapsed since 1970
    // This guarantees perfect clock synchronization across page refreshes
    const totalMinutesSinceEpoch = Math.floor(Date.now() / 60000);

    // 3. Loop through the outer array elements
    const realTimeData = baseData.map((station, stationIndex) => {
      if (station.details && Array.isArray(station.details)) {
        
        const updatedDetails = station.details.map((train, trainIndex) => {
          // Unique identifiers for this specific train sequence
          const uniqueId = stationIndex * 10 + trainIndex;
          
          // 1. Determine a pseudo-random cycle duration for this train (e.g., shifts between 6 to 12 minutes)
          // We change the seed every 3 hours so the timing variations shift over time
          const timeBlockSeed = Math.floor(totalMinutesSinceEpoch / 180); 
          const cycleDuration = 6 + ((uniqueId + timeBlockSeed) % 7); 

          // 2. Add an offset so all trains do not arrive at the exact same minute
          const trainOffset = (uniqueId * 3) % cycleDuration;

          // 3. Calculate remaining minutes. The modulo (%) guarantees it drops by 1 every minute
          let dynamicCountdown = cycleDuration - ((totalMinutesSinceEpoch + trainOffset) % cycleDuration);

          // 4. Hit 0 right when the cycle resets
          if (dynamicCountdown === cycleDuration) {
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
