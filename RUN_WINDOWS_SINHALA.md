# JobShield LK — Windows වල Run කරන්නේ මෙහෙමයි

## 1. අවශ්‍ය දේවල්
- **Node.js 20 හෝ ඊට වැඩි** ([nodejs.org](https://nodejs.org/)) — LTS version එක recommend කරනවා.
- Chrome / Edge browser එකක්.
- **Python, Java, XAMPP හෝ Database install කරන්න අවශ්‍ය නැහැ.**

## 2. පහසුම ක්‍රමය (Double-click)
1. ZIP file එකට Right-click → **Extract All**.
2. Extract වුණු **jobshield-lk** folder එක open කරන්න.
3. **START_WINDOWS.bat** double-click කරන්න.
4. `Open http://localhost:3000` කියන message එක දැක්කාම browser එකෙන් **http://localhost:3000** open කරන්න.
5. Server නවත්වන්න batch/CMD window එකේ **Ctrl+C** ඔබන්න.

`START_WINDOWS.bat` මුලින්ම run කරන විට `.env.example` copy කරලා `.env` සාදනවා. දැනට තිබෙන `.env` එක overwrite කරන්නේ නැහැ.

## 3. VS Code Terminal / PowerShell භාවිතයෙන්
VS Code එකේ **File → Open Folder** වලින් `jobshield-lk` folder එක open කරන්න. ඉන්පසු Terminal → New Terminal.

```powershell
node --version
Copy-Item .env.example .env   # .env එක දැනට නැත්නම් පමණයි
node src/server.js
```

නැත්නම් `npm start` භාවිත කරන්න පුළුවන්. මේකේ zero runtime dependencies නිසා text-check demo එකට `npm install` අවශ්‍ය නැහැ.

Browser: **http://localhost:3000**

## 4. AI Enable කරන්නේ මෙහෙමයි (විකල්ප)
- Google AI Studio: https://aistudio.google.com/apikey
- Project folder එකේ `.env` file එක open කරන්න.
- `GEMINI_API_KEY=` පසුපස **ඔබේම API key** එක දාන්න.
- Server නවත්තලා නැවත start කරන්න.
- AI key එකක් නැතිවත් **text scam-rule checking** වැඩ කරනවා. Screenshot එකේ අකුරු කියවීමට AI හෝ optional Tesseract OCR අවශ්‍ය වෙන්න පුළුවන්.
- API key GitHub එකට upload/share කරන්න එපා. `.env` already `.gitignore` එකේ තියෙනවා.

## 5. Port 3000 භාවිත වෙලා නම්

PowerShell වල:

```powershell
$env:PORT = "3001"
node src/server.js
```

ඉන්පසු **http://localhost:3001** වෙත යන්න. වෙනත් terminal එකක `PORT` වෙනස් කළා නම් වෙනත් terminal වලට එය බලපාන්නේ නැහැ.

## 6. Tests

```powershell
npm test
```

## 7. Check කරන්න ඕන Features
- EN / සිං / தமிழ் language change
- Test job ad text paste → **Check this ad**
- Fictional sample buttons
- Screenshot drag/drop or file selection
- Risk score / warning reasons / next steps
- Report publisher form + validation + community list
- Mobile responsive layout / larger text toggle

**වැදගත්:** JobShield LK ලබා දෙන්නේ scam risk indicators පමණයි. Legitimate employer verification සහ අවසන් තීරණය මිනිසා විසින් කළ යුතුයි. Screenshot OCR service එකේ language support / API access වලට අනුව ප්‍රතිඵල වෙනස් විය හැකිය.
