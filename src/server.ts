import './app';

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
}
