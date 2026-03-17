# backend/ai_logic.py
# ✅ Fixed .items() typo

def recommend_next(user_progress):
    # user_progress = {topic: score}
    recommendations = []
    
    # ✅ FIXED: .items() not .item()
    for topic, score in user_progress.items():
        if score < 50:
            recommendations.append(topic)
    
    return recommendations

def give_feedback(score, topic):
    if score < 50:
        return f"Review {topic} concepts and practice examples."
    else:
        return "Great! Try the next advanced exercise."