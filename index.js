const express = require('express');
const mineflayer = require('mineflayer');

const app = express();
const PORT = process.env.PORT || 3000;

// Standard web routing endpoint to satisfy Vercel's framework deployments
app.get('/', (req, res) => {
  res.send('Minecraft Bot Keep-Alive Status: Active');
});

// The serverless API runner that handles logging into your game server
app.get('/ping-bot', async (req, res) => {
  console.log('[Bot Activity] Received wake up request. Connecting...');
  
  const botOptions = {
    host: 'blastanime.aternos.me', 
    port: 56010,                    
    username: 'AFK_Keeper_Vercel',     
    version: '1.21.1'               
  };

  try {
    const bot = mineflayer.createBot(botOptions);

    bot.on('spawn', () => {
      console.log('[Bot Success] Connected to server! Simulating movement parameters.');
      
      // Force individual actions to reset your Aternos instance shutdown timer
      bot.setControlState('jump', true);
      
      setTimeout(() => {
        bot.setControlState('jump', false);
        bot.chat('Aternos server activity loop updated! 🤖');
        bot.quit();
        return res.status(200).json({ success: true, message: 'Server ping completed successfully!' });
      }, 10000); // Spend 10 seconds in world context before disconnecting cleanly
    });

    bot.on('error', (err) => {
      console.error('[Bot Error]:', err.message);
      return res.status(500).json({ success: false, error: err.message });
    });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Web hosting container actively running on port ${PORT}`);
});
