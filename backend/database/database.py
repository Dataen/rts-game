import os
from sqlalchemy.ext.asyncio import AsyncEngine, async_sessionmaker, create_async_engine
from database.models import Base

engine: AsyncEngine = None # type: ignore
AsyncSessionLocal: any = None # type: ignore

async def init_db():
    global engine, AsyncSessionLocal
    database_url = os.getenv("DATABASE_CONNECTION_STRING", "")
    print(database_url)
    engine = create_async_engine(database_url)
    AsyncSessionLocal = async_sessionmaker(engine)
    

async def get_async_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    db = AsyncSessionLocal()
    try:
        yield db
    finally:
        await db.close()