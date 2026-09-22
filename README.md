# LingoNaija

A text-first language-learning platform inspired by the learning flow of apps such as Duolingo, focused on Nigerian and international languages.

## Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Python + FastAPI
- Database: SQLite + SQLAlchemy
- API: REST

## Included languages

- Hausa
- Yorùbá
- Igbo
- English
- Spanish
- French

## Run the backend

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
python seed.py
uvicorn app.main:app --reload
```

Backend: http://127.0.0.1:8000

API docs: http://127.0.0.1:8000/docs

## Run the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Then open the Vite URL shown in the terminal.

If your backend runs somewhere other than `http://127.0.0.1:8000`, create:

```text
frontend/.env
```

with:

```env
VITE_API_URL=http://your-backend-url/api
```

## Next development steps

1. Add authentication.
2. Add a proper user table.
3. Move progress from localStorage into the FastAPI database.
4. Expand the dictionaries substantially.
5. Add lesson authoring/admin tools.
6. Add spaced repetition and review sessions.
7. Add more Nigerian languages such as Igala, Tiv, Fulfulde, Kanuri, Edo, Efik and Ibibio.
8. Add PostgreSQL for production.
