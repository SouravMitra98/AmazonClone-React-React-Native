from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()


MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "amazon_clone")

clinet = AsyncIOMotorClient(MONGO_URI)
db = clinet[DB_NAME]
