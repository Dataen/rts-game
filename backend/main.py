from contextlib import asynccontextmanager
import os
from fastapi import FastAPI
from api import root, auth, users, bots, matches
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from database.database import init_db

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("App started")
    await init_db()
    auth.init_sso()
    yield
    print("App closing")

app = FastAPI(lifespan=lifespan)
app.include_router(root.router)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(bots.router)
app.include_router(matches.router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)