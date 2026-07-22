const express = require('express');
const mineflayer = require('mineflayer');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Minecraft Bot Keep-Alive Status: Active');
});

// Using an async function with an explicit Promise tracker
app.get('/ping-bot', async (req, res) => {
  console.log('[Bot Activity] Received wake up request. Connecting...');
  
  const botOptions = {
    host: 'blastanime.aternos.me', 
    port: 56010,                    
    username: 'AFK_Keeper_Vercel',     
    version: '1.21.1'               
  };

  // We wrap the bot in a Promise to FORCE Vercel to stay open until it finishes
  const runBotTask = () => {
    return new Promise((resolve, reject) => {
      try {
        const bot = mineflayer.createBot(botOptions);

        // Set a safety timeout so the serverless function doesn't hang forever
        const safetyTimer = setTimeout(() => {
          bot.quit();
          reject(new Error('Connection timed out before spawn could occur.'));
        }, 35000); 

        bot.on('spawn', () => {
          clearTimeout(safetyTimer);
          console.log('[Bot Success] Connected to server! Simulating actions.');
          
          bot.setControlState('jump', true);
          
          setTimeout(() => {
            bot.setControlState('jump', false);
            bot.chat('Aternos server activity loop updated! 🤖');
            bot.quit();
            resolve('Successfully logged in, jumped, and disconnected.');
          }, 12000); // Spend 12 seconds in world context to ensure it logs
        });

        bot.on('error', (err) => {
          clearTimeout(safetyTimer);
          reject(err);
        });

      } catch (error) {
        reject(error);
      }
    });
  };

  try {
    const statusResult = await runBotTask();
    console.log(`[System Success] ${statusResult}`);
    return res.status(200).json({ success: true, message: statusResult });
  } catch (error) {
    console.error('[System Failure]:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Web hosting container actively running on port ${PORT}`);
});
