import pandas as pd

data = pd.read_csv("data/sales_large.csv")

data["Date"]=pd.to_datetime(data["Date"])

data["Month"]=data["Date"].dt.month_name()

print("\nDataset Information:")
print(data.info())

print("\nFirst 5 Rows:")
print(data.head())

print(data)

total_sales = data.groupby("Product")["Sales"].sum()

print("\nTotal Sales by Product:")
print(total_sales)

best_product = total_sales.idxmax()
best_sales = total_sales.max()

print("\nBest Selling Product:", best_product)
print("Total Sales:", best_sales)

month_order = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
]

data["Month"] = pd.Categorical(
    data["Month"],
    categories=month_order,
    ordered=True
)

monthly_sales = data.groupby("Month", observed=True)["Sales"].sum()

print("\nMonthly Sales:")
print(monthly_sales)

import matplotlib.pyplot as plt

monthly_sales.plot(kind="bar")

plt.title("Monthly Sales")
plt.xlabel("Month")
plt.ylabel("Sales")
plt.show()

#Product-wise Sales Chart
total_sales.plot(kind="bar")

plt.title("Sales by Product" )
plt.xlabel("Product")
plt.ylabel("Sales")

plt.show()

total_revenue = data["Sales"].sum()
average_sale = data["Sales"].mean()

best_month = monthly_sales.idxmax()
best_month_sales = monthly_sales.max()

worst_month = monthly_sales.idxmin()
worst_month_sales = monthly_sales.min()

print("\n========== SALES SUMMARY ==========")
print("Total Revenue:", total_revenue)
print("Average Sale:", round(average_sale, 2))

#Product-wise Sales Chart
product_sales=data.groupby("Product")["Sales"].sum()

product_sales.plot(kind="bar")

plt.title("Product-wise Sales")
plt.xlabel("Product")
plt.ylabel("Sales")

plt.show()

print("Best Product:", best_product)
print("Best Month:", best_month)
print("Best Month Sales:", best_month_sales)
print("Lowest Month:", worst_month)
print("Lowest Month Sales:", worst_month_sales)

#Business Insights

print ("\n========= BUSINESS INSIGHTS ==========")

if best_month== worst_month:
    print ("Sales were stable across the months.")
else :
    print ("Best sales month:",best_month)
    print ("Lowest sales month:",worst_month)

    print("Top product:",best_product)
if best_month_sales>worst_month_sales:
    difference=best_month_sales - worst_month_sales

    print("Sales increased by:",difference, "from the lowest to highest month.")

    print("\n======== DATA QUALITY CHECK =========")

    print("\nMissing Values:")
    print(data.isnull().sum())

    print("\nDuplicate Rows:")
    print(data.duplicated().sum())

    print("\nDataset Shape:")
    print(data.shape)

    print("\n=========ENCODED DATA =========")

    encoded_data=pd.get_dummies(data,columns=["Product","Region"],dtype=int)
    print(encoded_data.head())

    print("\n========== FEATURES AND TARGET ==========")

X = encoded_data.drop(
    columns=["Sales", "Date", "Month"]
)

y = encoded_data["Sales"]

print("\nFeatures:")
print(X.head())

print("\nTarget:")
print(y.head())

print("\nFeature Shape:", X.shape)
print("Target Shape:", y.shape)

from sklearn.model_selection import train_test_split

X_train, X_test,y_train,y_test=train_test_split(X,y,test_size=0.2,random_state=42)

print("\n=========TRAIN TEST SPLIT========")
print("Training data:",X_train.shape)
print("Testing data:",X_test.shape)

from sklearn.ensemble import RandomForestRegressor

print("\n========MODEL TRAINING========")

model=RandomForestRegressor(n_estimators=100,random_state=42)
model.fit(X_train,y_train)

print("Model training completed")

from sklearn.metrics import mean_absolute_error,r2_score

print("\n=======MODEL EVALUATION========")

y_pred=model.predict(X_test)

mae=mean_absolute_error(y_test,y_pred)
r2=r2_score(y_test,y_pred)

print("Actual Sales:")
print(y_test.values)

print("\nPredicted Sales:")
print(y_pred)

print("\nMean Absolute Error:",round(mae,2))
print("R2 Score:",round(r2,4))

#Feature Importance
print("\n=========FEATURE IMPORTANCE========")

importance=pd.Series(
    model.feature_importances_,
    index=X.columns
).sort_values(ascending=False)

print(importance)

importance.plot(kind="bar")

plt.title("Feature Importance")
plt.xlabel("Features")
plt.ylabel("Importance")

plt.show()

from sklearn.linear_model import LinearRegression

print("\n========== LINEAR REGRESSION ==========")

linear_model = LinearRegression()

linear_model.fit(X_train, y_train)

linear_pred = linear_model.predict(X_test)

linear_mae = mean_absolute_error(y_test, linear_pred)
linear_r2 = r2_score(y_test, linear_pred)

print("Linear Regression MAE:", round(linear_mae, 2))
print("Linear Regression R2:", round(linear_r2, 4))

from sklearn.ensemble import GradientBoostingRegressor

print("\n========== GRADIENT BOOSTING ==========")

gb_model = GradientBoostingRegressor(
    n_estimators=100,
    learning_rate=0.05,
    max_depth=3,
    random_state=42
)

gb_model.fit(X_train, y_train)

gb_pred = gb_model.predict(X_test)

gb_mae = mean_absolute_error(y_test, gb_pred)
gb_r2 = r2_score(y_test, gb_pred)

print("Gradient Boosting MAE:", round(gb_mae, 2))
print("Gradient Boosting R2:", round(gb_r2, 4))

import joblib

print("\n========== SAVING MODEL ==========")

joblib.dump(gb_model, "sales_model.pkl")

print("Model saved successfully!")

print("\nMODEL FEATURES:")
print(list(X.columns))