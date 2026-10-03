import csv
import random
from datetime import date, timedelta

products = {
    "Laptop": (50000, 70000),
    "Phone": (20000, 35000),
    "Tablet": (15000, 28000),
    "Monitor": (12000, 25000),
    "Headphones": (2000, 8000)
}

regions = ["North", "South", "East", "West"]

start_date = date(2025, 1, 1)

rows = []

for i in range(600):

    current_date = start_date + timedelta(days=random.randint(0, 364))

    product = random.choice(list(products.keys()))
    region = random.choice(regions)

    min_price, max_price = products[product]
    price = random.randint(min_price, max_price)

    quantity = random.randint(1, 25)

    marketing_spend = random.randint(3000, 30000)

    base_sales = quantity * price

    marketing_effect = marketing_spend * random.uniform(2, 5)

    region_effect = random.uniform(0.85, 1.20)

    noise = random.uniform(0.85, 1.15)

    sales = (
        base_sales + marketing_effect
    ) * region_effect * noise

    rows.append([
        current_date,
        product,
        region,
        quantity,
        price,
        marketing_spend,
        round(sales, 2)
    ])


with open("data/sales_large.csv", "w", newline="") as file:

    writer = csv.writer(file)

    writer.writerow([
        "Date",
        "Product",
        "Region",
        "Quantity",
        "Price",
        "Marketing_Spend",
        "Sales"
    ])

    writer.writerows(rows)

print("Large sales dataset created successfully!")
print("Total records:", len(rows))