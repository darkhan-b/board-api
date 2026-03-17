# NestJS Auth Project

## Описание
Простой проект на NestJS с авторизацией через JWT.  
Реализованы:
- Регистрация пользователей (`POST /auth/register`)
- Логин (`POST /auth/login`)
- Refresh токен (`POST /auth/refresh`)
- Logout (`POST /auth/logout`)
- Защищённые маршруты через JWT (например, `/users`)

Пароли хранятся в базе в виде хеша (argon2), JWT-токен используется для аутентификации.

---

## Установка

1. Клонируем проект:
```bash
git clone <репозиторий>
cd <папка проекта>

npm install

Создаём файл .env с переменными:

DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
JWT_ACCESS_SECRET="твой_секрет_для_access"
JWT_REFRESH_SECRET="твой_секрет_для_refresh"
JWT_ACCESS_EXPIRES="15m"
JWT_REFRESH_EXPIRES="7d"

npm run start:dev

| Метод | URL            | Body                                                 | Описание                                                  |
| ----- | -------------- | ---------------------------------------------------- | --------------------------------------------------------- |
| POST  | /auth/register | `{ "email": "test@test.com", "password": "123456" }` | Регистрация пользователя                                  |
| POST  | /auth/login    | `{ "email": "test@test.com", "password": "123456" }` | Логин, выдача access + refresh токенов                    |
| POST  | /auth/refresh  | -                                                    | Получение нового access токена по refresh токену (cookie) |
| POST  | /auth/logout   | -                                                    | Очистка refresh токена                                    |




# .env.example

# URL подключения к базе данных PostgreSQL
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# Секрет для подписи JWT access token
JWT_ACCESS_SECRET="your_access_secret"

# Секрет для подписи JWT refresh token
JWT_REFRESH_SECRET="your_refresh_secret"

# Время жизни access токена
JWT_ACCESS_EXPIRES="15m"

# Время жизни refresh токена
JWT_REFRESH_EXPIRES="7d"