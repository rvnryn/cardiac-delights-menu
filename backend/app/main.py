from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware



app = FastAPI()

# CORS middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

# Include the auth routes (including the /login endpoint)


# Optional: A simple health check route (you can remove or modify this)
@app.get("/health")
async def health_check():
    return {"status": "ok"}
