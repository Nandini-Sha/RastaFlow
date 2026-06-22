import pandas as pd
import joblib
import numpy as np

from catboost import CatBoostClassifier, Pool
from sklearn.model_selection import train_test_split, KFold
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, f1_score

# =========================
# Load Dataset
# =========================

df = pd.read_csv("../dataset/processed_data.csv")

# =========================
# Features & Target
# =========================

X = df.drop(columns=["priority", "resolution_minutes"], errors="ignore")
y = df["priority"]

print("\n========== DATASET INFO ==========")
print("Shape:", df.shape)
print("Target distribution:\n", y.value_counts())

# =========================
# Categorical Columns
# =========================

categorical_cols = [
    "event_type",
    "event_cause",
    "veh_type",
    "requires_road_closure"
]

cat_features_idx = [X.columns.get_loc(c) for c in categorical_cols]

# =========================
# 5-Fold CV (manual, correct CatBoost way)
# =========================

print("\nRunning 5-Fold CV...")

kf = KFold(n_splits=5, shuffle=True, random_state=42)
cv_scores = []

for train_idx, val_idx in kf.split(X):

    X_train_cv, X_val_cv = X.iloc[train_idx], X.iloc[val_idx]
    y_train_cv, y_val_cv = y.iloc[train_idx], y.iloc[val_idx]

    train_pool = Pool(X_train_cv, y_train_cv, cat_features=cat_features_idx)
    val_pool = Pool(X_val_cv, y_val_cv, cat_features=cat_features_idx)

    model = CatBoostClassifier(
        iterations=1000,
        learning_rate=0.02,
        depth=9,
        loss_function="Logloss",
        eval_metric="Accuracy",
        verbose=0,
        random_seed=42
    )

    model.fit(train_pool)

    preds = model.predict(val_pool).flatten()
    acc = accuracy_score(y_val_cv, preds)

    cv_scores.append(acc)

print("\nCV Scores:", cv_scores)
print("Mean CV:", np.mean(cv_scores))

# =========================
# Train/Test Split (FINAL MODEL)
# =========================

X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

train_pool = Pool(X_train, y_train, cat_features=cat_features_idx)
test_pool = Pool(X_test, y_test, cat_features=cat_features_idx)

print("\nTraining final CatBoost model...")

final_model = CatBoostClassifier(
    iterations=1500,
    learning_rate=0.02,
    depth=9,
    loss_function="Logloss",
    eval_metric="F1",
    verbose=200,
    random_seed=42
)

final_model.fit(train_pool)

# =========================
# Predictions
# =========================

preds = final_model.predict(test_pool).flatten()

# =========================
# Evaluation
# =========================

accuracy = accuracy_score(y_test, preds)
f1 = f1_score(y_test, preds, average="weighted")

print("\n========== FINAL MODEL RESULTS ==========")
print("Accuracy:", round(accuracy, 4))
print("Weighted F1:", round(f1, 4))

print("\nClassification Report:\n")
print(classification_report(y_test, preds))

print("\nConfusion Matrix:\n")
print(confusion_matrix(y_test, preds))

# =========================
# Feature Importance
# =========================

importance = pd.DataFrame({
    "Feature": X.columns,
    "Importance": final_model.get_feature_importance()
}).sort_values(by="Importance", ascending=False)

print("\n========== FEATURE IMPORTANCE ==========")
print(importance)

importance.to_csv("models/catboost_feature_importance.csv", index=False)

# =========================
# Save Model
# =========================

joblib.dump(final_model, "models/severity_catboost.pkl")
joblib.dump(list(X.columns), "models/severity_features.pkl")

print("\nModel saved successfully!")
print("Location: models/severity_catboost.pkl")
