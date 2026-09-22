from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from .routers import languages, dictionary, lessons, progress, auth
# Create database tables
Base.metadata.create_all(bind=engine)
# Create FastAPI application
app = FastAPI(
    title="LingoNaija API",
    description="Text-first language learning API for Nigerian and international languages.",
    version="2.0.0",
)
# Allow the frontend to communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# API routers
app.include_router(
    languages.router,
    prefix="/api",
)
app.include_router(
    dictionary.router,
    prefix="/api",
)
app.include_router(
    lessons.router,
    prefix="/api",
)
app.include_router(
    progress.router,
    prefix="/api",
)
app.include_router(
    auth.router,
    prefix="/api",
)
# Root endpoint
@app.get("/")
def root():
    return {
        "message": "LingoNaija API is running",
        "version": "2.0.0",
    }
# Health check
@app.get("/api/health")
def health():
    return {
        "status": "ok"
    }