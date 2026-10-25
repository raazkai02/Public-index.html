RAAZ AI ENGLISH TUTOR — सेटअप गाइड (हिंदी)
===========================================

जरूरी:
- यह असली AI backend वाला starter project है।
- AI चलाने के लिए OpenAI API key और internet चाहिए। API इस्तेमाल करने पर शुल्क लग सकता है।
- ChatGPT subscription और API billing अलग हो सकते हैं।
- API key कभी index.html में न डालें और किसी को न भेजें।

कंप्यूटर पर चलाने का तरीका:
1. Node.js का LTS version install करें।
2. इस project folder में terminal/command prompt खोलें।
3. चलाएँ: npm install
4. .env.example की कॉपी बनाकर उसका नाम .env रखें।
5. .env फाइल में OPENAI_API_KEY= के बाद अपनी API key लिखें।
6. चलाएँ: npm start
7. Browser में खोलें: http://localhost:3000

ध्यान दें:
- .env फाइल private रखें। GitHub पर upload न करें।
- इसे सिर्फ HTML file की तरह खोलने पर AI endpoint काम नहीं करेगा; Node server चलना जरूरी है।
- Voice typing browser/device support पर निर्भर है। Voice playback browser के speech synthesis से होता है।
- Public website पर लगाने से पहले rate limits, authentication, abuse protection और usage budget जोड़ें।

आधिकारिक API quickstart:
https://developers.openai.com/api/docs/quickstart
