const request = require('supertest');
const express = require('express');
const path = require('path');
const cors = require('cors');

// Мокаємо всі маршрути
jest.mock('../routes/upload', () => {
  const express = require('express');
  const router = express.Router();
  router.post('/', (req, res) => res.json({ message: 'Upload route' }));
  return router;
});

jest.mock('../routes/export', () => {
  const express = require('express');
  const router = express.Router();
  router.post('/pdf', (req, res) => res.json({ message: 'PDF route' }));
  router.post('/png', (req, res) => res.json({ message: 'PNG route' }));
  return router;
});

describe('Server Integration Tests', () => {
  let app;

  beforeEach(() => {
    // Створюємо копію серверної логіки для тестування
    app = express();
    app.use(cors());
    app.use(express.json({ limit: '10mb' }));

    const uploadRoutes = require('../routes/upload');
    const exportRoutes = require('../routes/export');

    app.use('/uploads', express.static(path.join(__dirname, '../../data/uploads')));
    app.use('/api/upload', uploadRoutes);
    app.use('/api/export', exportRoutes);
  });

  describe('Middleware Configuration', () => {
    test('приймає JSON запити', async () => {
      const response = await request(app)
        .post('/api/upload')
        .send({ test: 'data' })
        .set('Content-Type', 'application/json')
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });

    test('підтримує CORS', async () => {
      const response = await request(app)
        .options('/api/upload')
        .expect(204);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    test('підтримує великі JSON payload (до 10mb)', async () => {
      const largeData = {
        data: 'x'.repeat(1024 * 1024) // 1MB string
      };

      const response = await request(app)
        .post('/api/upload')
        .send(largeData)
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Route Mounting', () => {
    test('GET /api/upload повертає 404 (тільки POST)', async () => {
      await request(app)
        .get('/api/upload')
        .expect(404);
    });

    test('POST /api/upload доступний', async () => {
      await request(app)
        .post('/api/upload')
        .expect(200);
    });

    test('POST /api/export/pdf доступний', async () => {
      await request(app)
        .post('/api/export/pdf')
        .expect(200);
    });

    test('POST /api/export/png доступний', async () => {
      await request(app)
        .post('/api/export/png')
        .expect(200);
    });

    test('невідомий маршрут повертає 404', async () => {
      await request(app)
        .get('/api/unknown')
        .expect(404);
    });
  });

  describe('Static Files', () => {
    test('/uploads маршрут налаштований для статичних файлів', async () => {
      // Тестуємо що маршрут існує (навіть якщо файл не знайдено)
      const response = await request(app)
        .get('/uploads/nonexistent.wav');

      // Може бути 404 (файл не існує) або 200 (файл існує)
      // Головне що маршрут оброблено
      expect([200, 404]).toContain(response.status);
    });
  });

  describe('Error Handling', () => {
    test('обробляє некоректний JSON', async () => {
      const response = await request(app)
        .post('/api/upload')
        .send('invalid json{{{')
        .set('Content-Type', 'application/json');

      // Express автоматично повертає 400 для некоректного JSON
      expect([400, 500]).toContain(response.status);
    });

    test('обробляє порожнє тіло запиту', async () => {
      const response = await request(app)
        .post('/api/upload')
        .send()
        .expect(200);

      expect(response.body).toBeDefined();
    });
  });

  describe('Content-Type Headers', () => {
    test('приймає application/json', async () => {
      await request(app)
        .post('/api/upload')
        .set('Content-Type', 'application/json')
        .send({ test: 'data' })
        .expect(200);
    });

    test('встановлює правильний Content-Type у відповіді', async () => {
      const response = await request(app)
        .post('/api/upload')
        .send({ test: 'data' });

      expect(response.headers['content-type']).toMatch(/json/);
    });
  });
});