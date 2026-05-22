# REST API Boilerplate

Навчальний шаблон для створення REST API на базі Node.js, Express та Prisma ORM.

## Опис

Цей boilerplate розроблений для навчальних цілей бакалаврату українського університету. Він надає готову структуру для розробки REST API з використанням сучасних технологій та найкращих практик.

## Можливості

- ✅ Express.js 5 - сучасний фреймворк для створення веб-додатків
- ✅ Prisma ORM - типобезпечний ORM для роботи з базою даних
- ✅ SQLite база даних - проста у налаштуванні для навчання
- ✅ Celebrate - валідація вхідних даних за допомогою Joi
- ✅ Swagger/OpenAPI - автоматична генерація документації API
- ✅ Структурована архітектура (Controllers, Routes, Validators)
- ✅ Централізована обробка помилок
- ✅ Підтримка ES Modules
- ✅ Hot reload для розробки

## Технологічний стек

| Технологія | Версія | Опис |
|------------|--------|------|
| Node.js | - | Середовище виконання JavaScript |
| Express | 5.2.1 | Веб-фреймворк |
| Prisma | 7.2.0 | ORM для баз даних |
| Celebrate | 15.0.3 | Валідація запитів |
| Swagger UI | 5.0.1 | Інтерфейс документації API |
| Swagger JSDoc | 6.2.8 | Генерація OpenAPI специфікації |
| Dotenv | 17.2.3 | Управління змінними середовища |

## Вимоги

- Node.js (рекомендована версія 18.x або вище)
- npm або yarn

## Встановлення

1. **Клонуйте репозиторій або завантажте архів проекту**

2. **Встановіть залежності:**

```bash
npm install
```

1. **Створіть файл конфігурації:**

```bash
cp .env.example .env
```

1. **Налаштуйте базу даних (докладніше в розділі "Робота з базою даних")**

2. **Запустіть проект:**

```bash
npm run dev
```

## Налаштування

Файл `.env` містить змінні середовища для конфігурації проекту:

```env
# URL бази даних для Prisma з SQLite адаптером
DATABASE_URL="file:./dev.db"
```

**Примітка:** Ви можете додати інші змінні середовища, наприклад:

- `PORT` - порт сервера (за замовчуванням 3000)
- `NODE_ENV` - середовище виконання (development, production)

## Робота з базою даних

Проект використовує Prisma ORM з базою даних SQLite.

### Створення міграції

Після зміни файлу `prisma/schema.prisma`, створіть міграцію:

```bash
npm run prisma:migrate
```

Ця команда:

- Зчитує зміни у `schema.prisma`
- Створює нову міграцію
- Застосовує зміни до бази даних

### Генерація Prisma Client

Після створення або зміни міграцій, згенеруйте Prisma Client:

```bash
npm run prisma:generate
```

### Структура бази даних

Схема бази даних визначається у файлі `prisma/schema.prisma`. Додайте моделі відповідно до вимог вашого проекту.

### Використання Prisma Client

Prisma Client експортується з `prisma/client.js`. Приклад використання:

```javascript
import { PrismaClient } from '../prisma/client.js'

const prisma = new PrismaClient()

// Приклад запиту
const tags = await prisma.tag.findMany()
```

## Доступні скрипти

| Команда | Опис |
|---------|------|
| `npm start` | Запуск серверу у виробничому режимі |
| `npm run dev` | Запуск серверу з автоматичним перезапуском при змінах |
| `npm run prisma:migrate` | Створення та застосування міграцій бази даних |
| `npm run prisma:generate` | Генерація Prisma Client |

## Структура проекту

```
hw3/
├── prisma/                    # Конфігурація та файли Prisma
│   ├── schema.prisma         # Схема бази даних
│   └── client.js             # Експорт Prisma Client
├── dev.db                    # SQLite база даних (створюється після міграції)
├── src/                      # Основний код проекту
│   ├── controllers/          # Контролери обробки запитів
│   ├── routes/              # Визначення маршрутів API
│   └── validators/          # Схеми валідації запитів (Joi)
├── app.js                    # Головний файл додатку
├── .env.example             # Шаблон змінних середовища
├── .gitignore               # Файли, що ігноруються Git
├── package.json             # Залежності та скрипти
├── tsconfig.json            # Конфігурація TypeScript (для типізації)
└── README.md                # Цей файл
```

### Директорії та їх призначення

#### `prisma/`

- `schema.prisma` - визначення моделі бази даних
- `client.js` - експорт Prisma Client для використання в проекті

#### `src/controllers/`

Контролери містять логіку обробки запитів та взаємодії з базою даних.

```javascript
// src/controllers/tagController.js
export const getTags = async (req, res) => {
  const tags = await prisma.tag.findMany()
  res.json(tags)
}
```

#### `src/routes/`

Маршрути визначають ендпоінти API та прив'язують їх до контролерів.

```javascript
// src/routes/tagRoutes.js
import express from 'express'
import { getTags, createTag } from '../controllers/tagController.js'

const router = express.Router()

router.get('/', getTags)
router.post('/', createTag)

export default router
```

Підключення маршрутів до Express (в `app.js`):

```javascript
import tagRoutes from './src/routes/tagRoutes.js'

app.use('/api/tags', tagRoutes)
```

#### `src/validators/`

Валідатори використовують Joi для перевірки вхідних даних.

```javascript
// src/validators/tagValidator.js
import Joi from 'celebrate/lib/joi'

export const createTagSchema = {
  body: Joi.object().keys({
    name: Joi.string().required().min(1).max(50),
  }),
}

// Використання в маршрутах
import { celebrate } from 'celebrate'
import { createTagSchema } from '../validators/tagValidator.js'

router.post('/', celebrate(createTagSchema), createTag)
```

## Документація API

Проект автоматично генерує документацію API за допомогою Swagger.

**Доступ до документації:**

- URL: <http://localhost:3000/api-docs>
- Формат: OpenAPI 3.0.0

Swagger UI надає інтерактивний інтерфейс для:

- Перегляду всіх доступних ендпоінтів
- Перевірки параметрів запитів
- Відправки тестових запитів безпосередньо з браузера

### Додавання документації до ендпоінтів

Додайте коментарі JSDoc до вашого коду для автоматичної генерації документації:

```javascript
/**
 * @swagger
 * /tags:
 *   get:
 *     summary: Отримати список тегів
 *     responses:
 *       200:
 *         description: Список тегів
 */
router.get('/', getTags)
```

## Обробка помилок

Boilerplate включає централізовану систему обробки помилок.

### Типи помилок

1. **JSON parsing errors** (код 400) - Неправильний формат JSON у тілі запиту
2. **Prisma P2025** (код 404) - Ресурс не знайдено
3. **Prisma P2002** (код 409) - Порушення унікального обмеження
4. **Prisma P2003** (код 400) - Порушення зовнішнього ключа
5. **Validation errors** (код 400) - Помилки валідації від Celebrate
6. **General errors** (код 500) - Внутрішня помилка сервера

### Формат відповіді з помилкою

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "validation": {
    "body": {
      "source": "body",
      "keys": ["name"],
      "message": "\"name\" must be a string"
    }
  }
}
```

## Приклади використання

### Створення нового контролера

1. Створіть файл `src/controllers/tagController.js`:

```javascript
import { PrismaClient } from '../../prisma/client.js'
const prisma = new PrismaClient()

export const getAllTags = async (req, res) => {
  try {
    const tags = await prisma.tag.findMany()
    res.json(tags)
  } catch (error) {
    res.status(500).json({ error: 'Помилка отримання тегів' })
  }
}

export const getTagById = async (req, res) => {
  try {
    const { id } = req.params
    const tag = await prisma.tag.findUnique({
      where: { id: parseInt(id) }
    })
    
    if (!tag) {
      return res.status(404).json({ error: 'Тег не знайдено' })
    }
    
    res.json(tag)
  } catch (error) {
    res.status(500).json({ error: 'Помилка отримання тега' })
  }
}
```

1. Створіть файл `src/validators/tagValidator.js`:

```javascript
import Joi from 'celebrate/lib/joi'

export const getTagByIdSchema = {
  params: Joi.object().keys({
    id: Joi.number().integer().required(),
  }),
}
```

1. Створіть файл `src/routes/tagRoutes.js`:

```javascript
import express from 'express'
import { celebrate } from 'celebrate'
import { getAllTags, getTagById } from '../controllers/tagController.js'
import { getTagByIdSchema } from '../validators/tagValidator.js'

const router = express.Router()

router.get('/', getAllTags)
router.get('/:id', celebrate(getTagByIdSchema), getTagById)

export default router
```

1. Підключіть маршрути в `app.js`:

```javascript
import tagRoutes from './src/routes/tagRoutes.js'

app.use('/api/tags', tagRoutes)
```

1. Додайте модель в `prisma/schema.prisma`:

```prisma
model Tag {
  id        Int      @id @default(autoincrement())
  name      String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

1. Створіть та застосуйте міграцію:

```bash
npm run prisma:migrate
npm run prisma:generate
```

### Відправка запиту

Приклад запиту за допомогою curl:

```bash
# Отримати всі теги
curl http://localhost:3000/api/tags

# Отримати тег за ID
curl http://localhost:3000/api/tags/1
```

## Корисні поради

1. **Використовуйте `npm run dev`** під час розробки для автоматичного перезапуску сервера
2. **Перевіряйте документацию** на `/api-docs` для тестування API без написання коду
3. **Створюйте валідатори** для всіх вхідних даних для забезпечення безпеки
4. **Дотримуйтесь структури проекту** для підтримки чистого коду
5. **Коментуйте зміни** у `schema.prisma` перед створенням міграції

## Ресурси для навчання

- [Документація Express.js](https://expressjs.com/)
- [Документація Prisma](https://www.prisma.io/docs)
- [Документація Joi (валідація)](https://joi.dev/api/)
- [Документація OpenAPI/Swagger](https://swagger.io/specification/)

## Ліцензія

ISC

## Контакти

Для питань та підтримки звертайтеся до викладача та ментора курсу.
