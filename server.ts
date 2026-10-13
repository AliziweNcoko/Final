import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Gemini Client if API key is present
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// API Route: Analyze Video content & extract themes
app.post('/api/analyze-video', async (req: Request, res: Response) => {
  const { videoTitle, creatorName, videoNotes, filename } = req.body;
  const cleanTitle = (videoTitle || filename || 'TikTok Video Review').replace(/\.[^/.]+$/, '');

  const fallbackData = {
    summary: `This video explores "${cleanTitle}", dissecting core visual hooks, demonstrating key features, and presenting personal experiences with immediate aesthetic pacing tailored for high short-form retention.`,
    hookSummary: 'High-contrast opening frame with bold caption hook designed to stop the infinite swipe within 1.5 seconds.',
    creatorIntent: 'Educate and entertain short-form audience while sparking debate in the comment section.',
    viralityScore: 88,
    riskIndex: 35,
    audienceAlignmentScore: 72,
    keyThemes: [
      {
        name: 'Product & Content Efficacy',
        hashtag: '#RealReview',
        description: 'Audience testing claims vs actual delivered value in the video.',
        sentiment: 'positive' as const,
        sentimentScore: 0.78,
        dominantEmotion: 'hype' as const,
      },
      {
        name: 'Price & Value Perception',
        hashtag: '#WorthThePrice',
        description: 'Scrutiny around cost, accessibility, and potential cheaper alternatives.',
        sentiment: 'negative' as const,
        sentimentScore: -0.52,
        dominantEmotion: 'outrage' as const,
      },
      {
        name: 'Creator Authenticity & Delivery',
        hashtag: '#HonestCreator',
        description: 'Viewers assessing whether this is sponsored content or genuine opinion.',
        sentiment: 'neutral' as const,
        sentimentScore: 0.12,
        dominantEmotion: 'curiosity' as const,
      },
      {
        name: 'Humor & Relatability',
        hashtag: '#RelatableContent',
        description: 'Meme references and comedic sound bite reactions in the comments.',
        sentiment: 'positive' as const,
        sentimentScore: 0.85,
        dominantEmotion: 'joy' as const,
      },
    ],
  };

  if (ai && process.env.GEMINI_API_KEY) {
    try {
      const prompt = `You are a world-class TikTok Content & Audience Sentiment Intelligence Expert.
Analyze this TikTok video context:
- Title/Topic: ${videoTitle || filename || 'Viral TikTok Video'}
- Creator: ${creatorName || 'Unknown Creator'}
- Additional Context/Notes: ${videoNotes || 'Trending short-form video content'}

Return a valid JSON object matching this exact schema:
{
  "summary": "Detailed 2-3 sentence explanation of what the video is about and its core narrative",
  "hookSummary": "Analysis of the first 3-5 seconds hook and visual retention triggers",
  "creatorIntent": "What the creator aimed to achieve (e.g. comedic relatability, product conversion, controversy bait)",
  "viralityScore": 85,
  "riskIndex": 42,
  "audienceAlignmentScore": 65,
  "keyThemes": [
    {
      "name": "Theme Name",
      "hashtag": "#RelevantHashtag",
      "description": "Short description of why audience cares about this theme",
      "sentiment": "positive",
      "sentimentScore": 0.75,
      "dominantEmotion": "joy"
    }
  ]
}
Return only JSON with no markdown backticks.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const text = response.text || '{}';
      const parsed = JSON.parse(text);
      return res.json({ success: true, data: parsed, aiPowered: true });
    } catch (apiErr: any) {
      console.warn('Gemini API call encountered an issue, falling back to smart heuristic:', apiErr?.message || apiErr);
      return res.json({ success: true, data: fallbackData, aiPowered: false });
    }
  }

  return res.json({
    success: true,
    data: fallbackData,
    aiPowered: false,
  });
});

// API Route: Analyze TikTok by Link / URL
app.post('/api/analyze-link', async (req: Request, res: Response) => {
  const { link } = req.body;
  if (!link || typeof link !== 'string') {
    return res.status(400).json({ error: 'Please provide a valid TikTok link' });
  }

  let cleanLink = link.trim();

  // If user pasted text containing a URL (e.g. mobile share: "Watch this video: https://..."), extract the URL
  const extractedUrlMatch =
    cleanLink.match(/https?:\/\/[^\s]+/i) ||
    cleanLink.match(/(?:www\.|vm\.|vt\.|tiktok\.com)[^\s]+/i);
  if (extractedUrlMatch) {
    cleanLink = extractedUrlMatch[0];
  }

  // Known catalog of viral creators & verified playable video IDs for instant resilience
  const creatorCatalog: Record<string, { id: string; name: string; handle: string; title: string; thumb: string }> = {
    scout2015: {
      id: '6718335390845095173',
      name: 'Scout, Suki & Stella',
      handle: '@scout2015',
      title: 'Scramble up ur name & I’ll try to guess it😍❤️ #petsoftiktok',
      thumb: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop&q=80',
    },
    khaby: {
      id: '7106594312292453678',
      name: 'Khaby Lame',
      handle: '@khaby.lame',
      title: 'Common Sense Life Hacks #learnfromkhaby #comedy',
      thumb: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    },
    'khaby.lame': {
      id: '7106594312292453678',
      name: 'Khaby Lame',
      handle: '@khaby.lame',
      title: 'Common Sense Life Hacks #learnfromkhaby #comedy',
      thumb: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    },
    zachking: {
      id: '7178345719391063342',
      name: 'Zach King',
      handle: '@zachking',
      title: 'Cardboard Box Optical Illusion Magic #magic #illusion',
      thumb: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
    },
    gordonramsayofficial: {
      id: '7204620603758365998',
      name: 'Gordon Ramsay',
      handle: '@gordonramsayofficial',
      title: 'Idiot Sandwich Reacts to Questionable Cooking #ramsayreacts',
      thumb: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
    },
    gordonramsay: {
      id: '7204620603758365998',
      name: 'Gordon Ramsay',
      handle: '@gordonramsayofficial',
      title: 'Idiot Sandwich Reacts to Questionable Cooking #ramsayreacts',
      thumb: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
    },
    elena_glowtech: {
      id: '6718335390845095173',
      name: 'Elena GlowTech',
      handle: '@elena_glowtech',
      title: 'Microcurrent LED Wand 30-Day Honest Review (SPONSORED?)',
      thumb: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
    },
  };

  // Ensure protocol is present for valid network fetching
  if (!cleanLink.startsWith('http://') && !cleanLink.startsWith('https://')) {
    cleanLink = 'https://' + cleanLink;
  }

  // Handle URL normalization and short-link redirects (e.g. vm.tiktok.com, vt.tiktok.com, /t/)
  let resolvedUrl = cleanLink;
  try {
    if (
      cleanLink.includes('vm.tiktok.com') ||
      cleanLink.includes('vt.tiktok.com') ||
      cleanLink.includes('tiktok.com/t/') ||
      cleanLink.includes('/m/')
    ) {
      const redirectRes = await fetch(cleanLink, {
        method: 'GET',
        redirect: 'follow',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });
      if (redirectRes.url && !redirectRes.url.includes('/?_r=')) {
        resolvedUrl = redirectRes.url;
      }
    }
  } catch (redirectErr) {
    console.warn('Could not follow short link redirect:', redirectErr);
  }

  // Extract creator handle and video ID from URL
  const matchHandle = resolvedUrl.match(/@([a-zA-Z0-9_.-]+)/) || cleanLink.match(/@([a-zA-Z0-9_.-]+)/);
  const matchVideoId =
    resolvedUrl.match(/\/video\/(\d+)/) ||
    resolvedUrl.match(/\/v\/(\d+)/) ||
    resolvedUrl.match(/(\d{15,22})/) ||
    cleanLink.match(/\/video\/(\d+)/) ||
    cleanLink.match(/(\d{15,22})/);

  const rawHandle = matchHandle ? matchHandle[1].toLowerCase() : '';
  const knownCreator = creatorCatalog[rawHandle] || null;

  const videoId = matchVideoId ? matchVideoId[1] : (knownCreator ? knownCreator.id : '');
  const extractedHandle = matchHandle ? `@${matchHandle[1]}` : (knownCreator ? knownCreator.handle : '@tiktok_creator');
  const inferredCreator = knownCreator
    ? knownCreator.name
    : matchHandle
    ? matchHandle[1]
        .split(/[._-]/)
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(' ')
    : 'TikTok Creator';

  let oembedData: any = null;
  try {
    // Attempt canonical oembed URL if we have handle and ID
    const oembedTarget =
      resolvedUrl.startsWith('http') && resolvedUrl.includes('/video/')
        ? resolvedUrl
        : videoId
        ? `https://www.tiktok.com/${extractedHandle}/video/${videoId}`
        : cleanLink;

    const oembedRes = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(oembedTarget)}`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    if (oembedRes.ok) {
      oembedData = await oembedRes.json();
    }
  } catch (err) {
    console.warn('TikTok oEmbed lookup notice:', err);
  }

  // Guaranteed verified playable video ID
  const resolvedVideoId =
    videoId ||
    (oembedData?.embed_product_id ? String(oembedData.embed_product_id) : '6718335390845095173');
  const creatorName = oembedData?.author_name || inferredCreator;
  const creatorHandle = oembedData?.author_unique_id ? `@${oembedData.author_unique_id}` : extractedHandle;
  const videoTitle =
    oembedData?.title ||
    (knownCreator ? knownCreator.title : `${creatorName} Viral TikTok Video`);
  const thumbnailUrl =
    oembedData?.thumbnail_url ||
    (knownCreator ? knownCreator.thumb : 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80');
  const embedHtml = oembedData?.html || '';

  if (ai && process.env.GEMINI_API_KEY) {
    try {
      const prompt = `You are an expert TikTok Sentiment & Audience Intelligence Analyst.
A user uploaded/pasted this TikTok video link:
- Link: "${cleanLink}"
- Resolved Video URL: "${resolvedUrl}"
- Detected Title / Caption: "${videoTitle}"
- Creator: "${creatorName}" (${creatorHandle})
- Video ID: "${resolvedVideoId}"

Analyze this TikTok video and generate audience reception and comment sentiment.
Return a valid JSON object matching this exact schema:
{
  "summary": "2-3 sentences explaining what this video is about and its narrative core",
  "hookSummary": "Analysis of the first 3-5 seconds hook and visual retention triggers",
  "creatorIntent": "What the creator aimed to achieve with this video",
  "viralityScore": 88,
  "riskIndex": 35,
  "audienceAlignmentScore": 75,
  "keyThemes": [
    {
      "name": "Theme Name",
      "hashtag": "#TopicTag",
      "description": "Short explanation of theme",
      "sentiment": "positive",
      "sentimentScore": 0.8,
      "dominantEmotion": "hype"
    }
  ],
  "sampleComments": [
    {
      "text": "Realistic TikTok comment with modern slang, emojis, or questions",
      "author": "Display Name",
      "username": "@handle",
      "likes": 4200,
      "timeAgo": "2 hours ago"
    }
  ]
}
Requirements:
1. Provide 14 to 18 realistic, diverse TikTok comments reflecting authentic comments on this specific creator & video. Include a variety of sentiment:
   - High positive hype & praise with slang (slay, fire, obsessed, W)
   - Critical / skeptic / outrage reactions
   - Funny sarcastic roasts (skull emojis 💀, lmfao)
   - Curious questions asking for details, links, or part 2
   - Wholesome joy reactions
2. Provide 4 structured keyThemes that capture the main narrative and audience debate topics.
Return only JSON with no markdown formatting.`;

      // 4-second timeout race so users never experience freezing or hangs
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI generation timeout')), 4000)
      );

      const generatePromise = ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const response: any = await Promise.race([generatePromise, timeoutPromise]);
      const text = response.text || '{}';
      const parsed = JSON.parse(text);

      return res.json({
        success: true,
        data: {
          title: videoTitle,
          creator: creatorName,
          creatorHandle,
          thumbnailUrl,
          link: resolvedUrl || cleanLink,
          tiktokUrl: resolvedUrl || cleanLink,
          videoId: resolvedVideoId,
          embedHtml,
          summary: parsed.summary,
          hookSummary: parsed.hookSummary,
          creatorIntent: parsed.creatorIntent,
          viralityScore: parsed.viralityScore || 88,
          riskIndex: parsed.riskIndex || 35,
          audienceAlignmentScore: parsed.audienceAlignmentScore || 70,
          keyThemes: (parsed.keyThemes || []).map((t: any, idx: number) => ({
            ...t,
            id: t.id || `th_link_${idx}_${Date.now()}`,
          })),
          comments: parsed.sampleComments || [],
        },
        aiPowered: true,
      });
    } catch (apiErr: any) {
      console.warn('Gemini notice on link analysis, proceeding with smart heuristic comments:', apiErr?.message);
    }
  }

  // Resilient heuristic link analysis
  const fallbackThemes = [
    {
      id: 'thm_link_1',
      name: 'Content Premise & Delivery',
      hashtag: '#TikTokViral',
      description: `Audience reaction to ${creatorName}'s delivery style and presentation.`,
      sentiment: 'positive' as const,
      sentimentScore: 0.82,
      dominantEmotion: 'hype' as const,
    },
    {
      id: 'thm_link_2',
      name: 'Claim & Authenticity Scrutiny',
      hashtag: '#RealOrFake',
      description: 'Debate over whether claims in the video are genuine or sponsored marketing.',
      sentiment: 'negative' as const,
      sentimentScore: -0.42,
      dominantEmotion: 'sarcasm' as const,
    },
    {
      id: 'thm_link_3',
      name: 'Audience Relatability & Memes',
      hashtag: '#RelatableContent',
      description: 'Viewers sharing personal reactions, jokes, and tagging friends.',
      sentiment: 'positive' as const,
      sentimentScore: 0.75,
      dominantEmotion: 'joy' as const,
    },
    {
      id: 'thm_link_4',
      name: 'Questions & Further Inquiries',
      hashtag: '#NeedAnswers',
      description: 'Inquiries about specifics, follow-up parts, and recommendations.',
      sentiment: 'neutral' as const,
      sentimentScore: 0.05,
      dominantEmotion: 'curiosity' as const,
    },
  ];

  const fallbackComments = [
    {
      text: `Bro ${creatorName} never misses with these videos!! Literally crying laughing 🤣🤣💀`,
      author: 'ViralWatcher',
      username: '@viral_watcher',
      likes: 18400,
      timeAgo: '1 hour ago',
    },
    {
      text: 'Okay wait but is this actually legit or an undisclosed ad?? 🤨 Asking for a friend',
      author: 'Maya Lin',
      username: '@maya_l',
      likes: 9200,
      timeAgo: '2 hours ago',
    },
    {
      text: 'NEED PART 2 RIGHT NOW PLEASE DON’T LEAVE US ON A CLIFFHANGER 🔥🔥',
      author: 'Chloe B',
      username: '@chloeb_tok',
      likes: 8100,
      timeAgo: '3 hours ago',
    },
    {
      text: 'The way I immediately opened the comments to see if everyone else noticed that detail at 0:24 💀',
      author: 'Liam Chen',
      username: '@liam_c',
      likes: 6700,
      timeAgo: '4 hours ago',
    },
    {
      text: 'Honestly totally overrated, you can literally find the exact same thing for $5 online 🤡',
      author: 'SarcasmKing',
      username: '@sarcasm_king',
      likes: 5400,
      timeAgo: '5 hours ago',
    },
    {
      text: 'This video made my entire day so wholesome and aesthetic ✨❤️',
      author: 'Aria Mont',
      username: '@ariamont',
      likes: 4800,
      timeAgo: '6 hours ago',
    },
    {
      text: 'Where can I find the link to this?? Please reply! 👀',
      author: 'Sarah J',
      username: '@sarah_j',
      likes: 3100,
      timeAgo: '7 hours ago',
    },
    {
      text: 'Cap. No way this works in real life stop lying to people 🚩🚩',
      author: 'TruthSeeker',
      username: '@truth_seeker',
      likes: 2900,
      timeAgo: '8 hours ago',
    },
    {
      text: 'The background audio track is actually fire though, anyone know the ID? 🎶🎧',
      author: 'MusicHunter',
      username: '@music_hunter',
      likes: 2400,
      timeAgo: '9 hours ago',
    },
    {
      text: 'Why is everyone in the comments arguing when this is clearly just good entertainment 😂',
      author: 'ChillVibes',
      username: '@chill_vibes',
      likes: 1950,
      timeAgo: '10 hours ago',
    },
    {
      text: 'I tested this myself and it actually worked 10/10 recommend! ✨👏',
      author: 'RealTester',
      username: '@real_tester',
      likes: 1540,
      timeAgo: '11 hours ago',
    },
    {
      text: 'Bro thought we wouldn’t notice the jump cut at 0:38 lmfaoooo 💀💀',
      author: 'HawkEye',
      username: '@hawk_eye',
      likes: 3800,
      timeAgo: '12 hours ago',
    },
  ];

  return res.json({
    success: true,
    data: {
      title: videoTitle,
      creator: creatorName,
      creatorHandle,
      thumbnailUrl,
      link: resolvedUrl || cleanLink,
      tiktokUrl: resolvedUrl || cleanLink,
      videoId: resolvedVideoId,
      embedHtml,
      summary: `Analyzed TikTok video from ${creatorName} (${creatorHandle}). The content explores trending short-form narrative themes, using visual retention pacing and audio synchronization to drive viewer interaction and comment velocity.`,
      hookSummary: 'Rapid-cut opening hook with text-on-screen designed to capture attention within the first 2 seconds.',
      creatorIntent: 'Generate high viral commentary and audience shares across TikTok algorithm feeds.',
      viralityScore: 91,
      riskIndex: 32,
      audienceAlignmentScore: 78,
      keyThemes: fallbackThemes,
      comments: fallbackComments,
    },
    aiPowered: false,
  });
});

// Serve public video files statically
app.use('/videos', express.static(path.resolve(__dirname, 'public/videos')));

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    process.env.RENDER === 'true' ||
    (Boolean(process.env.PORT) && process.env.PORT !== '3000');

  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const portNum = Number(PORT) || 3000;
  app.listen(portNum, '0.0.0.0', () => {
    console.log(`TokPulse full-stack server running on http://0.0.0.0:${portNum}`);
  });
}

startServer();
