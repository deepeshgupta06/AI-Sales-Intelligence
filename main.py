
import jwt
import bcrypt
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException, Query
import joblib
import psycopg
import pandas as pd
import os
from dotenv import load_dotenv

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-this")
JWT_ALGORITHM = "HS256"

app = FastAPI()

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

@app.post("/login")

@app.post("/login")
def login_user(user: UserLogin):
    username = user.username.strip()

    if not username or not user.password:
        raise HTTPException(
            status_code=400,
            detail="Username and password are required"
        )

    with psycopg.connect(
        host=os.getenv("DB_HOST"),
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        port=int(os.getenv("DB_PORT", "5432"))
    ) as conn:
        existing_user = conn.execute(
            """
            SELECT id, username, email, password_hash
            FROM users
            WHERE username = %s
            """,
            (username,)
        ).fetchone()

    if not existing_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    password_correct = bcrypt.checkpw(
        user.password.encode("utf-8"),
        existing_user[3].encode("utf-8")
    )

    if not password_correct:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    token = jwt.encode(
        {
            "user_id": existing_user[0],
            "username": existing_user[1]
        },
        JWT_SECRET,
        algorithm=JWT_ALGORITHM
    )

    return {
        "message": "Login successful!",
        "access_token": token,
        "user_id": existing_user[0],
        "username": existing_user[1],
        "email": existing_user[2]
    }


def get_current_user(token: str):
    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM]
        )

        user_id = payload.get("user_id")

        if not user_id:
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

        return user_id

    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )


def get_current_user(token: str):
    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM]
        )

        user_id = payload.get("user_id")

        if not user_id:
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

        return user_id

    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

def login_user(user: UserLogin):
    username = user.username.strip()

    if not username or not user.password:
        raise HTTPException(
            status_code=400,
            detail="Username and password are required"
        )

    with psycopg.connect(
        host=os.getenv("DB_HOST"),
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        port=int(os.getenv("DB_PORT", "5432"))
    ) as conn:
        existing_user = conn.execute(
            """
            SELECT id, username, email, password_hash
            FROM users
            WHERE username = %s
            """,
            (username,)
        ).fetchone()

    if not existing_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    password_correct = bcrypt.checkpw(
        user.password.encode("utf-8"),
        existing_user[3].encode("utf-8")
    )

    if not password_correct:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )
    
    
    token = jwt.encode(
    {
        "user_id": existing_user[0],
        "username": existing_user[1]
    },
    JWT_SECRET,
    algorithm=JWT_ALGORITHM
)

    return {
    "message": "Login successful!",
    "access_token": token,
    "user_id": existing_user[0],
    "username": existing_user[1],
    "email": existing_user[2]
  }

@app.post("/register")
def register_user(user: UserCreate):
    username = user.username.strip()
    email = user.email.strip().lower()

    if not username or not email or not user.password:
        raise HTTPException(
            status_code=400,
            detail="All fields are required"
        )

    password_hash = bcrypt.hashpw(
        user.password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    try:
        with psycopg.connect(
            host=os.getenv("DB_HOST"),
            dbname=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            port=int(os.getenv("DB_PORT", "5432"))
        ) as conn:
            new_user = conn.execute(
                """
                INSERT INTO users (username, email, password_hash)
                VALUES (%s, %s, %s)
                RETURNING id, username, email
                """,
                (username, email, password_hash)
            ).fetchone()

        return {
            "message": "User registered successfully!",
            "user_id": new_user[0],
            "username": new_user[1],
            "email": new_user[2]
        }

    except psycopg.errors.UniqueViolation:
        raise HTTPException(
            status_code=400,
            detail="Username or email already exists"
        )

print("DB password loaded:", bool(os.getenv("DB_PASSWORD")))


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://ai-sales-intelligence-flame.vercel.app",
    ],
    allow_credentials=True,
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
    marketing_spend: float = Query(ge=0, le=10000000),
    token: str = Query(...)
):
    current_user_id = get_current_user(token)
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
(user_id, product, region, quantity, price, marketing_spend, predicted_sales)
VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (
    current_user_id,
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
    page_size: int = Query(20, ge=1, le=100),
    token: str = Query(...)
):
    current_user_id = get_current_user(token)

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
            WHERE user_id = %s
            ORDER BY id DESC
            LIMIT %s OFFSET %s
            """,
            (
                current_user_id,
                page_size,
                (page - 1) * page_size
            )
        ).fetchall()

        total_records = conn.execute(
            """
            SELECT COUNT(*)
            FROM prediction_history
            WHERE user_id = %s
            """,
            (current_user_id,)
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