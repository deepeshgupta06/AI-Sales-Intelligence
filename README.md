# AI Sales Intelligence

A machine learning-based sales prediction API built using Python, FastAPI, and PostgreSQL.

## Project Overview

AI Sales Intelligence predicts sales using input features such as product, region, quantity, price, and marketing spend. It also stores prediction records in a PostgreSQL database for later review.

## Features

* Sales prediction using a trained machine learning model
* REST API built with FastAPI
* Input validation for prediction requests
* PostgreSQL integration for storing prediction history
* API documentation through Swagger UI
* Endpoint to retrieve recent predictions

## Tech Stack

* **Language:** Python
* **Machine Learning:** Scikit-learn, Pandas, Joblib
* **Backend:** FastAPI
* **Database:** PostgreSQL
* **API Testing:** Swagger UI

## Project Structure

```text
AI-Sales-Intelligence/
├── data/
├── analysis.py
├── generate_data.py
├── predict.py
├── main.py
├── db_test.py
├── sales_model.pkl
├── .gitignore
└── README.md
```

## Setup and Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/deepeshgupta06/AI-Sales-Intelligence.git
   cd AI-Sales-Intelligence
   ```

2. Install the required Python packages:

   ```bash
   py -m pip install fastapi "uvicorn[standard]" pandas scikit-learn joblib "psycopg[binary]" python-dotenv
   ```

3. Create a `.env` file in the project root and configure your local PostgreSQL connection:

   ```text
   DB_HOST=localhost
   DB_NAME=sales_intelligence
   DB_USER=postgres
   DB_PASSWORD=your_local_database_password
   DB_PORT=5432
   ```

   Replace the placeholder with your own local database password. Never upload `.env` to GitHub.

4. Ensure PostgreSQL is running, the database and `prediction_history` table exist, and the trained model file is available.

5. Start the API:

   ```bash
   py -m uvicorn main:app --reload
   ```

6. Open the interactive API documentation:

   http://127.0.0.1:8000/docs

## API Endpoints

| Method | Endpoint   | Purpose                            |
| ------ | ---------- | ---------------------------------- |
| GET    | `/`        | Check API status                   |
| POST   | `/predict` | Predict sales and save the result  |
| GET    | `/history` | Retrieve recent prediction records |

## Notes

* The prediction model was trained on synthetic sales data. Its performance on synthetic test data does not guarantee accuracy on real-world sales.
* PostgreSQL must be configured locally before database-backed endpoints can work.

## Future Improvements

* Interactive frontend dashboard
* Visual sales analytics and charts
* Model evaluation on real-world datasets
* Cloud deployment

## Author

Deepesh Gupta
