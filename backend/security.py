from jose import JWTError, jwt
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status
from passlib.context import CryptContext
import os

from backend.models import User
from backend.database import get_db
from fastapi.security import OAuth2PasswordBearer


pwd_context = CryptContext(
    schemes=["bcrypt"],
    bcrypt__rounds=12,
    deprecated="auto"
)

def verify_pwd(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def hash_pwd(password: str) -> str:
    if len(password.encode('utf-8')) > 72:
        password = password.encode('utf-8')[:72].decode('utf-8', errors='ignore')
    return pwd_context.hash(password)

SECRET_KEY = os.getenv("SECRET_KEY", "mysecretkey123")
ALGORITHM = "HS256"
EXPIRE_HOURS = 24

oauth2_scheme = OAuth2PasswordBearer(tokenUrl= "/login")

def create_token(user_id: str):
    data = {
        "sub": user_id,
        "exp": datetime.utcnow() + timedelta(hours=EXPIRE_HOURS)
    }
    token = jwt.encode(data, SECRET_KEY, algorithm = ALGORITHM)
    return token

def get_current_user(
        token: str = Depends(oauth2_scheme),
        db: Session = Depends(get_db)
):
    try:
        data = jwt.decode(token, SECRET_KEY, algorithms =  [ALGORITHM])
        user_id = data.get("sub")

    except:
        raise HTTPException(status_code=401, detail="Please login again")
    
    user = db.query(User).filter(User.user_id  == user_id).first()

    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user