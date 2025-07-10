const { faker } = require('@faker-js/faker');

function generateUsers(count) {
  const users = [];
  for (let i = 0; i < count; i++) {
    users.push({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      age: faker.number.int({ min: 18, max: 70 }),
    });
  }
  return users;
}

function measureMemory() {
  const used = process.memoryUsage();
  return {
    heapUsed: Math.round(used.heapUsed / 1024 / 1024 * 100) / 100,
    heapTotal: Math.round(used.heapTotal / 1024 / 1024 * 100) / 100,
    external: Math.round(used.external / 1024 / 1024 * 100) / 100,
  };
}

function calculateStats(times) {
  const sorted = times.sort((a, b) => a - b);
  const sum = times.reduce((a, b) => a + b, 0);
  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    avg: Math.round(sum / times.length * 100) / 100,
    median: sorted[Math.floor(sorted.length / 2)],
  };
}

module.exports = { generateUsers, measureMemory, calculateStats };
