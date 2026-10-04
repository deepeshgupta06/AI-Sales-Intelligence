
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException, Query
import joblib
import psycopg
import pandas as pd
import os
from dotenv import load_dotenv

load_dotenv()

print("DB password loaded:", bool(os.getenv("DB_PASSWORD")))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load trained ML model
model = joblib.load("sales_model.pkl")


@app.get("/")
def home():
    return {
        "message": "AI Sales Intelligence API is running!"
    }


@app.post("/predict")
def predict_sales(
    product: str,
    region: str,
    quantity: int = Query(gt=0, le=100000),
    price: float = Query(gt=0, le=10000000),
    marketing_spend: float = Query(ge=0, le=10000000)
):
    product = product.strip().title()
    region = region.strip().title()

    valid_products = [
        "Laptop", "Phone", "Tablet", "Monitor", "Headphones"
    ]
    valid_regions = ["North", "South", "East", "West"]

    if product not in valid_products:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid product. Choose from: {valid_products}"
        )

    if region not in valid_regions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid region. Choose from: {valid_regions}"
        )

    product_columns = {
        "Laptop": "Product_Laptop",
        "Phone": "Product_Phone",
        "Tablet": "Product_Tablet",
        "Monitor": "Product_Monitor",
        "Headphones": "Product_Headphones"
    }

    region_columns = {
        "North": "Region_North",
        "South": "Region_South",
        "East": "Region_East",
        "West": "Region_West"
    }

    new_data = pd.DataFrame(
        0,
        index=[0],
        columns=[
            "Quantity",
            "Price",
            "Marketing_Spend",
            "Product_Headphones",
            "Product_Laptop",
            "Product_Monitor",
            "Product_Phone",
            "Product_Tablet",
            "Region_East",
            "Region_North",
            "Region_South",
            "Region_West"
        ]
    )

    new_data["Quantity"] = quantity
    new_data["Price"] = price
    new_data["Marketing_Spend"] = marketing_spend
    new_data[product_columns[product]] = 1
    new_data[region_columns[region]] = 1

    prediction = model.predict(new_data)
    predicted_sales = round(float(prediction[0]), 2)

    # Save prediction using database settings from .env
    with psycopg.connect(
        host=os.getenv("DB_HOST"),
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        port=int(os.getenv("DB_PORT", "5432"))
    ) as conn:
        conn.execute(
            """
            INSERT INTO prediction_history
            (product, region, quantity, price, marketing_spend, predicted_sales)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (
                product,
                region,
                quantity,
                price,
                marketing_spend,
                predicted_sales
            )
        )

    return {
        "product": product,
        "region": region,
        "predicted_sales": predicted_sales,
        "message": "Prediction saved successfully!"
    }
@app.get("/history")
def get_prediction_history(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    with psycopg.connect(
        host=os.getenv("DB_HOST"),
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        port=int(os.getenv("DB_PORT", "5432"))
    ) as conn:
        rows = conn.execute(
    """
    SELECT id, product, region, quantity, price,
           marketing_spend, predicted_sales, created_at
    FROM prediction_history
    ORDER BY id DESC
    LIMIT %s OFFSET %s
    """,
    (page_size, (page - 1) * page_size)
).fetchall()

        total_records = conn.execute(
    "SELECT COUNT(*) FROM prediction_history"
).fetchone()[0]
        return {
    "total_records": total_records,
    "page": page,
    "page_size": page_size,
    "records": [
        {
            "id": row[0],
            "product": row[1],
            "region": row[2],
            "quantity": row[3],
            "price": float(row[4]),
            "marketing_spend": float(row[5]),
            "predicted_sales": float(row[6]),
            "created_at": row[7].isoformat() if row[7] else None
        }
        for row in rows
    ]
}