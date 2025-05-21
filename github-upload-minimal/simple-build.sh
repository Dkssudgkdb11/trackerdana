#!/bin/bash

# 간단한 정적 사이트 빌드 스크립트 (Netlify 용)
echo "===== 넷플리파이 배포용 간단한 정적 빌드 시작 ====="

# 클라이언트 폴더로 이동
cd client

# 기존 디렉토리 정리
rm -rf dist

# 필요한 정적 파일 디렉토리 생성
mkdir -p dist
mkdir -p dist/assets

# 필요한 파일 복사
cp -r src dist/
cp index.html dist/

# Netlify 설정 파일 생성 (중요)
echo "/* /index.html 200" > dist/_redirects
echo "# 모든 경로를 index.html로 리다이렉트" >> dist/_redirects

# 디버깅 메시지
echo "생성된 파일 목록:"
ls -la dist/

echo "===== 빌드 완료! client/dist 폴더를 Netlify로 배포하세요 ====="