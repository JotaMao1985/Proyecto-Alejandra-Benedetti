from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="Movie Review API")
# --- Data Model (Pydantic) ---
class Review(BaseModel):
    id: int
    movie: str
    rating: float
    comment: str
# --- Fake Database (a simple Python dictionary) ---
db = {}
# --- CREATE (POST) ---
@app.post("/reviews")
def create_review(review: Review):
    if review.id in db:
        raise HTTPException(status_code=400, detail="Review already exists")
    db[review.id] = review
    return {"message": "Review added!", "review": review}
# --- READ (GET) ---
@app.get("/reviews/{review_id}")
def get_review(review_id: int):
    if review_id not in db:
        raise HTTPException(status_code=404, detail="Review not found")
    return db[review_id]
# --- UPDATE (PUT) ---
@app.put("/reviews/{review_id}")
def update_review(review_id: int, updated_review: Review):
    if review_id not in db:
        raise HTTPException(status_code=404, detail="Review not found")
    db[review_id] = updated_review
    return {"message": "Review updated!", "review": updated_review}
# --- DELETE (DELETE) ---
@app.delete("/reviews/{review_id}")
def delete_review(review_id: int):
    if review_id not in db:
        raise HTTPException(status_code=404, detail="Review not found")
    del db[review_id]
    return {"message": f"Review {review_id} deleted"}