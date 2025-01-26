# ===== 1단계: 프론트엔드 빌드 =====
FROM node:18.20.4 AS frontend-build

WORKDIR /app

# 프론트엔드 의존성 설치 및 빌드
COPY chat-frontend/package.json chat-frontend/yarn.lock ./chat-frontend/
RUN cd chat-frontend && yarn install --frozen-lockfile
COPY chat-frontend/ ./chat-frontend/
RUN cd chat-frontend && yarn build

# ===== 2단계: 런타임 환경 (백엔드) =====
FROM node:18.20.4 AS backend

WORKDIR /app

# 백엔드 코드 복사
COPY chat-backend/ ./chat-backend/

# 프론트엔드 빌드 결과물 복사
COPY --from=frontend-build /app/chat-frontend/build ./chat-backend/build

WORKDIR /app/chat-backend
RUN yarn install --frozen-lockfile

# 환경 변수 설정 (포트 5001 적용)
ENV PORT=5001

CMD ["node", "index.js"]

# 컨테이너 포트 노출
EXPOSE 5001