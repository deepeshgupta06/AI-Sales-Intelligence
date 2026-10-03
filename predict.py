import joblib
import pandas as pd

# Load trained model
model = joblib.load("sales_model.pkl")

print("\n========== AI SALES PREDICTOR ==========")

# User inputs
quantity = int(input("Enter quantity: "))
price = float(input("Enter price per unit: "))
marketing_spend = float(input("Enter marketing spend: "))

product = input(
    "Enter product (Laptop/Phone/Tablet/Monitor/Headphones): "
).strip().title()

region = input(
    "Enter region (North/South/East/West): "
).strip().title()


# Product encoding
product_columns = {
    "Laptop": "Product_Laptop",
    "Phone": "Product_Phone",
    "Tablet": "Product_Tablet",
    "Monitor": "Product_Monitor",
    "Headphones": "Product_Headphones"
}

# Region encoding
region_columns = {
    "North": "Region_North",
    "South": "Region_South",
    "East": "Region_East",
    "West": "Region_West"
}


# Create input data
new_data = pd.DataFrame(0, index=[0], columns=[
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
])


new_data["Quantity"] = quantity
new_data["Price"] = price
new_data["Marketing_Spend"] = marketing_spend

new_data[product_columns[product]] = 1
new_data[region_columns[region]] = 1


# Prediction
prediction = model.predict(new_data)

print("\n========== RESULT ==========")
print("Product:", product)
print("Region:", region)
print("Predicted Sales: ₹", round(prediction[0], 2))