#!/bin/bash
set -e

# ============================================
# Локальный запуск n8n с нодой Bitrix24 (Docker)
# ============================================

NODE_DIR="$(cd "$(dirname "$0")" && pwd)"
N8N_DATA="$HOME/.n8n-dev"
CONTAINER_NAME="n8n-bitrix24-dev"

ADMIN_EMAIL="admin@localhost.com"
ADMIN_PASSWORD="admin123"
ADMIN_FIRST="Admin"
ADMIN_LAST="Dev"

echo "=== n8n + Bitrix24 Node (Docker) ==="
echo "Директория ноды: $NODE_DIR"

# 1. Проверить Docker
if ! command -v docker &> /dev/null; then
    echo "Docker не найден. Установите Docker Desktop: https://www.docker.com/products/docker-desktop/"
    exit 1
fi

# 2. Очистить старый dist и собрать ноду
echo ""
echo "--- Сборка ноды ---"
cd "$NODE_DIR"
rm -rf dist
npm install
npm run build
echo "Сборка завершена."

# 3. Остановить предыдущий контейнер если запущен
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo ""
    echo "--- Остановка предыдущего контейнера ---"
    docker rm -f "$CONTAINER_NAME" > /dev/null 2>&1
fi

# 4. Чистый старт — удалить старые данные для dev-окружения
if [ "${1}" = "--clean" ]; then
    echo "--- Чистый старт: удаляю данные ---"
    rm -rf "$N8N_DATA"
fi
mkdir -p "$N8N_DATA"

# 5. Создать owner-аккаунт если ещё не создан (проверяем наличие базы)
if [ ! -f "$N8N_DATA/database.sqlite" ]; then
    echo ""
    echo "--- Создание owner-аккаунта ---"
    docker run --rm \
        -v "$N8N_DATA:/home/node/.n8n" \
        -v "$NODE_DIR:/home/node/custom-nodes/n8n-nodes-bitrix24" \
        -e N8N_CUSTOM_EXTENSIONS="/home/node/custom-nodes/n8n-nodes-bitrix24" \
        n8nio/n8n:latest \
        n8n user-management:reset --email="$ADMIN_EMAIL" --password="$ADMIN_PASSWORD" --firstName="$ADMIN_FIRST" --lastName="$ADMIN_LAST" 2>/dev/null || true
fi

# 6. Запустить n8n в Docker
echo ""
echo "--- Запуск n8n ---"
echo "UI:       http://localhost:5678"
echo "Login:    $ADMIN_EMAIL"
echo "Password: $ADMIN_PASSWORD"
echo "Ctrl+C для остановки"
echo ""

docker run -it --rm \
    --name "$CONTAINER_NAME" \
    -p 5678:5678 \
    -v "$N8N_DATA:/home/node/.n8n" \
    -v "$NODE_DIR:/home/node/custom-nodes/n8n-nodes-bitrix24" \
    -e N8N_CUSTOM_EXTENSIONS="/home/node/custom-nodes/n8n-nodes-bitrix24" \
    -e N8N_SECURE_COOKIE=false \
    n8nio/n8n:latest
