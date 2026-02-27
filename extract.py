import sys
import json
import os
import numpy as np
import PyPDF2
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.pipeline import Pipeline, FeatureUnion
from sklearn.preprocessing import MinMaxScaler
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# ================= PDF TEXT EXTRACTION =================
def extract_text_from_pdf(file_path):
    text = ""
    with open(file_path, "rb") as f:
        reader = PyPDF2.PdfReader(f)
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + " "
    return text
# ================= LOAD FROM FILE PATH LIST ================
def load_resumes(paths):
    resumes, names = [], []
    for path in paths:
        text = extract_text_from_pdf(path)
        if text.strip():
            resumes.append(text)
            names.append(os.path.basename(path))
    return resumes, names

# ================= FEATURE MODULES =================
class PartialCreditScorer(BaseEstimator, TransformerMixin):
    def fit(self, X, y=None): return self
    def transform(self, X):
        vague = ["basic", "familiar", "learning", "exposure"]
        strong = ["expert", "advanced", "certified", "professional", "experienced"]
        scores = []
        for text in X:
            t = text.lower()
            score = sum(0.3 for w in vague if w in t) + sum(1 for w in strong if w in t)
            scores.append(score)
        return np.array(scores).reshape(-1, 1)

class KeywordPenalty(BaseEstimator, TransformerMixin):
    def fit(self, X, y=None): return self
    def transform(self, X):
        penalties = []
        for text in X:
            words = text.lower().split()
            max_freq = max(words.count(w) for w in set(words)) if words else 0
            penalties.append(-0.05 * max_freq)
        return np.array(penalties).reshape(-1, 1)

class SkillProjectConsistency(BaseEstimator, TransformerMixin):
    def fit(self, X, y=None): return self
    def transform(self, X):
        pairs = [("python","project"),("java","application"),
                 ("machine learning","model"),("data science","analysis"),
                 ("web","website")]
        scores = []
        for text in X:
            t = text.lower()
            score = sum(1 for s,p in pairs if s in t and p in t)
            scores.append(score)
        return np.array(scores).reshape(-1,1)

class RelativeScorer(BaseEstimator, TransformerMixin):
    def fit(self, X, y=None):
        self.vectorizer = TfidfVectorizer(stop_words="english")
        self.matrix = self.vectorizer.fit_transform(X)
        return self
    def transform(self, X):
        sim = cosine_similarity(self.matrix)
        return sim.mean(axis=1).reshape(-1,1)

class DuplicateDetector(BaseEstimator, TransformerMixin):
    def fit(self, X, y=None):
        self.vectorizer = TfidfVectorizer(stop_words="english")
        self.matrix = self.vectorizer.fit_transform(X)
        return self
    def transform(self, X):
        sim = cosine_similarity(self.matrix)
        scores = []
        for i in range(len(sim)):
            others = sim[i][sim[i] < 1]
            max_sim = max(others) if len(others) else 0
            scores.append(0 if max_sim > 0.9 else 1)
        return np.array(scores).reshape(-1,1)

WEIGHTS = {"partial":0.20,"relative":0.25,"penalty":0.15,"consistency":0.20,"duplicate":0.20}

pipeline = Pipeline([
    ("features", FeatureUnion([
        ("partial", PartialCreditScorer()),
        ("relative", RelativeScorer()),
        ("penalty", KeywordPenalty()),
        ("consistency", SkillProjectConsistency()),
        ("duplicate", DuplicateDetector())
    ])),
    ("scaler", MinMaxScaler())
])

def compute_scores(resumes):
    features = pipeline.fit_transform(resumes)
    return (
        WEIGHTS["partial"]*features[:,0] +
        WEIGHTS["relative"]*features[:,1] +
        WEIGHTS["penalty"]*features[:,2] +
        WEIGHTS["consistency"]*features[:,3] +
        WEIGHTS["duplicate"]*features[:,4]
    )

# ================= ENTRY POINT =================
if __name__ == "__main__":
    file_paths = json.loads(sys.argv[1])
    resumes, names = load_resumes(file_paths)
    scores = compute_scores(resumes)
    ranked = sorted(zip(names, scores), key=lambda x: x[1], reverse=True)
    print(json.dumps(ranked))