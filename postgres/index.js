const { Sequelize, DataTypes } = require('sequelize');
const express = require('express');
const { generateUsers, measureMemory, calculateStats } = require('./shared/benchmark');

const app = express();

const sequelize = new Sequelize('testdb', 'user', 'pass', {
  host: 'postgres',
  dialect: 'postgres',
});

const User = sequelize.define('User', {
  name: DataTypes.STRING,
  email: DataTypes.STRING,
  age: DataTypes.INTEGER,
});

(async () => {
  await sequelize.sync({ force: true });
})();

app.get('/benchmark', async (req, res) => {
  const count = parseInt(req.query.count) || 1000;
  const results = {};
  
  // Clear table
  await User.destroy({ where: {} });
  
  // Insert Benchmark
  const users = generateUsers(count);
  const memoryBefore = measureMemory();
  const insertStart = Date.now();
  await User.bulkCreate(users);
  const insertEnd = Date.now();
  const memoryAfter = measureMemory();
  
  results.insert = {
    count,
    time: insertEnd - insertStart,
    throughput: Math.round(count / ((insertEnd - insertStart) / 1000)),
    memoryUsed: memoryAfter.heapUsed - memoryBefore.heapUsed,
  };
  
  // Read Benchmark
  const readStart = Date.now();
  const allUsers = await User.findAll();
  const readEnd = Date.now();
  
  results.read = {
    count: allUsers.length,
    time: readEnd - readStart,
    throughput: Math.round(allUsers.length / ((readEnd - readStart) / 1000)),
  };
  
  // Query Benchmarks
  const queries = {};
  
  // Age range query
  const ageQueryStart = Date.now();
  const adultUsers = await User.findAll({ where: { age: { [Sequelize.Op.gte]: 30 } } });
  const ageQueryEnd = Date.now();
  queries.ageRange = {
    count: adultUsers.length,
    time: ageQueryEnd - ageQueryStart,
    throughput: Math.round(adultUsers.length / ((ageQueryEnd - ageQueryStart) / 1000)),
  };
  
  // Email domain query
  const emailQueryStart = Date.now();
  const gmailUsers = await User.findAll({ where: { email: { [Sequelize.Op.like]: '%@gmail.com' } } });
  const emailQueryEnd = Date.now();
  queries.emailDomain = {
    count: gmailUsers.length,
    time: emailQueryEnd - emailQueryStart,
    throughput: Math.round(gmailUsers.length / ((emailQueryEnd - emailQueryStart) / 1000)),
  };
  
  // Complex query with multiple conditions
  const complexQueryStart = Date.now();
  const complexUsers = await User.findAll({
    where: {
      [Sequelize.Op.and]: [
        { age: { [Sequelize.Op.between]: [25, 50] } },
        { email: { [Sequelize.Op.or]: [
          { [Sequelize.Op.like]: '%@gmail.com' },
          { [Sequelize.Op.like]: '%@yahoo.com' }
        ] } }
      ]
    }
  });
  const complexQueryEnd = Date.now();
  queries.complexQuery = {
    count: complexUsers.length,
    time: complexQueryEnd - complexQueryStart,
    throughput: Math.round(complexUsers.length / ((complexQueryEnd - complexQueryStart) / 1000)),
  };
  
  // Sorting query
  const sortQueryStart = Date.now();
  const sortedUsers = await User.findAll({
    order: [['age', 'ASC'], ['name', 'ASC']],
    limit: 100
  });
  const sortQueryEnd = Date.now();
  queries.sortQuery = {
    count: sortedUsers.length,
    time: sortQueryEnd - sortQueryStart,
    throughput: Math.round(sortedUsers.length / ((sortQueryEnd - sortQueryStart) / 1000)),
  };
  
  // Aggregation query
  const aggregationStart = Date.now();
  const ageStats = await User.findAll({
    attributes: [
      [Sequelize.fn('AVG', Sequelize.col('age')), 'avgAge'],
      [Sequelize.fn('MIN', Sequelize.col('age')), 'minAge'],
      [Sequelize.fn('MAX', Sequelize.col('age')), 'maxAge'],
      [Sequelize.fn('COUNT', Sequelize.col('id')), 'totalUsers']
    ],
    raw: true
  });
  const aggregationEnd = Date.now();
  queries.aggregation = {
    result: ageStats[0],
    time: aggregationEnd - aggregationStart,
  };
  
  // Pagination query
  const paginationStart = Date.now();
  const paginatedUsers = await User.findAll({ offset: 50, limit: 50 });
  const paginationEnd = Date.now();
  queries.pagination = {
    count: paginatedUsers.length,
    time: paginationEnd - paginationStart,
    throughput: Math.round(paginatedUsers.length / ((paginationEnd - paginationStart) / 1000)),
  };
  
  // Count query
  const countStart = Date.now();
  const userCount = await User.count({ where: { age: { [Sequelize.Op.gte]: 30 } } });
  const countEnd = Date.now();
  queries.count = {
    count: userCount,
    time: countEnd - countStart,
  };
  
  results.queries = queries;
  
  // Update Benchmark
  const updateStart = Date.now();
  await User.update({ age: 25 }, { where: { age: { [Sequelize.Op.lt]: 25 } } });
  const updateEnd = Date.now();
  
  results.update = {
    time: updateEnd - updateStart,
  };
  
  // Delete Benchmark
  const deleteStart = Date.now();
  await User.destroy({ where: { age: { [Sequelize.Op.gte]: 65 } } });
  const deleteEnd = Date.now();
  
  results.delete = {
    time: deleteEnd - deleteStart,
  };
  
  results.database = 'PostgreSQL';
  results.totalTime = insertEnd - insertStart + readEnd - readStart + Object.values(queries).reduce((sum, q) => sum + q.time, 0) + updateEnd - updateStart + deleteEnd - deleteStart;
  
  res.json(results);
});

app.get('/benchmark/stress', async (req, res) => {
  const iterations = parseInt(req.query.iterations) || 10;
  const batchSize = parseInt(req.query.batch) || 100;
  
  const insertTimes = [];
  const readTimes = [];
  
  for (let i = 0; i < iterations; i++) {
    await User.destroy({ where: {} });
    
    const users = generateUsers(batchSize);
    const insertStart = Date.now();
    await User.bulkCreate(users);
    const insertEnd = Date.now();
    insertTimes.push(insertEnd - insertStart);
    
    const readStart = Date.now();
    await User.findAll();
    const readEnd = Date.now();
    readTimes.push(readEnd - readStart);
  }
  
  res.json({
    database: 'PostgreSQL',
    iterations,
    batchSize,
    insertStats: calculateStats(insertTimes),
    readStats: calculateStats(readTimes),
  });
});

app.listen(3000, () => console.log('PostgreSQL app running on port 3002'));
