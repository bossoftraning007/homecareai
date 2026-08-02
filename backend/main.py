from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.chat import router as chat_router

app = FastAPI(
    title="HomeCare AI",
    description="Safe home care guidance for minor symptoms",
    version="1.0.0"
)

# CORS - allow all origins for testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router, prefix="/api")

@app.get("/")
def root():
    return {
        "app": "HomeCare AI 🌿",
        "status": "running",
        "message": "Natural home care guidance API"
    }