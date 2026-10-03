
import psycopg

try:
    with psycopg.connect(
        host="localhost",
        dbname="sales_intelligence",
        user="postgres",
        password="@Itsrajgupta062006",
        port=5432
    ) as conn:
        print("PostgreSQL connected successfully!")

except Exception as e:
    print("Connection failed:", e)