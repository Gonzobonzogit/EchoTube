require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const API_KEY= process.env.YOUTUBE_KEY;
const PORT = process.env.port || 3001;

app.use(express.static(path.join(__dirname)));

app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  const order = req.query.order || "Relevance";

  if(!query) return  res.status(400).json({ error: "Search failed, no query provided"});

  const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&q=${encodeURIComponent(query)}&type=video&videoDuration=long&maxResults=20&videoEmbeddable=true&order=${order}&part=snippet`;

try{
    const search = await fetch(url);
    const results = await search.json();

    res.json(results);
  } catch(err){
        return console.log('Search was incomplete', err);
        res.status(500).json({error: "Query did not reach server"});
  }
});

app.listen(PORT, () => console.log(`  ╔════════════════════════════════════════╗
                                      ║        🚀 Server is Running! 🚀        ║
                                      ╠════════════════════════════════════════╣
                                      ║  Server: http://localhost:${PORT}      ║
                                      ║  Status: Ready to accept requests      ║
                                      ╚════════════════════════════════════════╝`));


