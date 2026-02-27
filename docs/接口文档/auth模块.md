# Auth 模块接口文档

## 基础信息

| 项目 | 说明 |
|------|------|
| 基础路径 | `/auth` |
| 认证方式 | Token (JWT) |

---

## 1. 账号密码登录

### 请求

```http
POST /auth/login
Content-Type: application/json
```

### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| account | String | 是 | 用户名 / 邮箱 / 手机号 |
| password | String | 是 | 密码 |

### 响应

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600,
    "user": {
      "userId": 1,
      "username": "admin",
      "nickname": "管理员",
      "avatar": "https://example.com/avatar.jpg",
      "gender": 1
    }
  }
}
```

### 响应参数

| 参数 | 类型 | 说明 |
|------|------|------|
| accessToken | String | 访问令牌 |
| refreshToken | String | 刷新令牌 |
| expiresIn | Long | 过期时间（秒） |
| user.userId | Long | 用户ID |
| user.username | String | 用户名 |
| user.nickname | String | 昵称 |
| user.avatar | String | 头像URL |
| user.gender | Integer | 性别：0-未知, 1-男, 2-女 |

---

## 2. 第三方登录

### 请求

```http
POST /auth/social/login
Content-Type: application/json
```

### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| socialType | Integer | 是 | 平台类型：1-微信, 2-QQ, 3-Google, 4-Apple, 5-抖音 |
| openid | String | 是 | 第三方平台 openid |
| unionid | String | 否 | 微信/QQ unionid |
| accessToken | String | 否 | 第三方平台 access_token |
| refreshToken | String | 否 | 第三方平台 refresh_token |
| expiresIn | Long | 否 | 令牌过期时间（秒） |
| nickname | String | 否 | 用户昵称 |
| avatar | String | 否 | 用户头像 |
| gender | Integer | 否 | 性别：0-未知, 1-男, 2-女 |

### 响应

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600,
    "user": {
      "userId": 1,
      "username": "social_abc12345",
      "nickname": "微信用户",
      "avatar": "https://example.com/avatar.jpg",
      "gender": 1
    }
  }
}
```

---

## 3. 刷新 Token

### 请求

```http
POST /auth/refresh
Refresh-Token: <refresh_token>
```

### 请求头

| 参数 | 必填 | 说明 |
|------|------|------|
| Refresh-Token | 是 | 刷新令牌 |

### 响应

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600,
    "user": {
      "userId": 1,
      "username": "admin",
      "nickname": "管理员",
      "avatar": "https://example.com/avatar.jpg",
      "gender": 1
    }
  }
}
```

---

## 错误码

| 错误码 | 说明 |
|--------|------|
| 200 | 操作成功 |
| 401 | 账号或密码错误 / 账号已被禁用 / 无效的令牌 |
| 500 | 服务器内部错误 |

---

## 使用示例

### cURL

#### 账号密码登录

```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "account": "admin@example.com",
    "password": "123456"
  }'
```

#### 第三方登录

```bash
curl -X POST http://localhost:8080/auth/social/login \
  -H "Content-Type: application/json" \
  -d '{
    "socialType": 1,
    "openid": "oXXXX_XXXXX",
    "unionid": "uXXXX_XXXXX",
    "accessToken": "XXXXX",
    "nickname": "微信用户"
  }'
```

#### 刷新 Token

```bash
curl -X POST http://localhost:8080/auth/refresh \
  -H "Refresh-Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### 访问受保护接口

```bash
curl http://localhost:8080/user/info \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```
