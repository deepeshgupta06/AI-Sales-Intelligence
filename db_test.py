
import os
from dotenv import load_dotenv

load_dotenv(override=True)
import psycopg

try:
    with psycopg.connect(
        host="localhost",
        dbname="sales_intelligence",
        user="postgres",
        
password=os.getenv("DB_PASSWORD"),
        port=5432
    ) as conn:
        print("PostgreSQL connected successfully!")

except Exception as e:
    print("Connection failed:", e)