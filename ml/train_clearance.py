import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from catboost import CatBoostClassifier

# =========================
# LOAD DATA
# =========================

df = pd.read_csv("../dataset/processed_data.csv")

# =========================
# CREATE CLEARANCE LABEL
# =========================

def resolution_category(minutes):
    if minutes <= 60:
        return "Quick"
    elif minutes <= 180:
        return "Moderate"
    elif minutes <= 480:
        return "Long"
    else:
        return "Critical"

df["clearance_category"] = df["resolution_minutes"].apply(resolution_category)

print("\nClearance Distribution:")
print(df["clearance_category"].value_counts())

# =========================
# FEATURES / TARGET
# =========================

target = "clearance_category"

X = df.drop(
    columns=[
        "resolution_minutes",
        "priority",
        "clearance_category"
    ],
    errors="ignore"
)

y = df[target]

# =========================
# IDENTIFY CATEGORICAL COLUMNS
# =========================

categorical_cols = [
    "event_type",
    "event_cause",
    "veh_type",
    "requires_road_closure",
    "corridor"
]

# fill missing
for col in categorical_cols:
    if col in X.columns:
        X[col] = X[col].fillna("Unknown").astype(str)

# =========================
# TRAIN / TEST SPLIT
# =========================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

cat_features_idx = [X.columns.get_loc(c) for c in categorical_cols if c in X.columns]

# =========================
# MODEL (CATBOOST)
# =========================

# model = CatBoostClassifier(
#     iterations=1200,
#     learning_rate=0.03,
#     depth=8,
#     loss_function="MultiClass",
#     eval_metric="Accuracy",
#     random_seed=42,
#     verbose=200
# )
model = CatBoostClassifier(
    iterations=2000,
    learning_rate=0.02,
    depth=10,
    l2_leaf_reg=5,
    random_strength=2,
    bagging_temperature=1,
    loss_function="MultiClass",
    eval_metric="TotalF1",
    random_seed=42,
    verbose=200
)
# =========================
# TRAIN
# =========================

model.fit(
    X_train,
    y_train,
    cat_features=cat_features_idx
)

# =========================
# PREDICT
# =========================

preds = model.predict(X_test).flatten()

# =========================
# EVALUATION
# =========================

print("\n========== CLEARANCE MODEL ==========")

print("\nAccuracy:", accuracy_score(y_test, preds))

print("\nClassification Report:")
print(classification_report(y_test, preds))

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, preds))

# =========================
# FEATURE IMPORTANCE
# =========================

importance = pd.DataFrame({
    "Feature": X.columns,
    "Importance": model.get_feature_importance()
}).sort_values(by="Importance", ascending=False)

print("\nFeature Importance:")
print(importance)

# =========================
# SAVE MODEL + FEATURES
# =========================

joblib.dump(model, "models/clearance.pkl")
joblib.dump(list(X.columns), "models/clearance_features.pkl")

print("\nClearance model saved successfully!")
