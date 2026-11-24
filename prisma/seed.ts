import bcrypt from 'bcryptjs';
import { prisma } from '../src/config/database';

type BookSeed = {
  title: string;
  slug: string;
  author: string;
  isbn: string;
  description: string;
  price: number;
  stock: number;
  coverColor: string;
  publisher: string;
  publishedYear: number;
  pages: number;
  weight: number;
  dimensions: string;
  categorySlug: string;
};

type CategorySeed = {
  name: string;
  slug: string;
  description: string;
};

const categories: CategorySeed[] = [
  { name: 'Fiksi', slug: 'fiksi', description: 'Novel dan cerita yang membawa kita ke dunia lain.' },
  { name: 'Sastra', slug: 'sastra', description: 'Karya klasik dan sastra Indonesia pilihan.' },
  { name: 'Non-Fiksi', slug: 'non-fiksi', description: 'Sejarah, gagasan, dan pengetahuan untuk berpikir lebih luas.' },
  { name: 'Pengembangan Diri', slug: 'pengembangan-diri', description: 'Kebiasaan, pola pikir, dan cara hidup yang lebih baik.' },
  { name: 'Bisnis', slug: 'bisnis', description: 'Strategi, keuangan, dan cara membangun usaha.' },
  { name: 'Anak', slug: 'anak', description: 'Cerita dan buku pengetahuan untuk pembaca muda.' },
];

const books: BookSeed[] = [
  {
    title: 'Laskar Pelangi',
    slug: 'laskar-pelangi',
    author: 'Andrea Hirata',
    isbn: '9789793062792',
    description:
      'Sepuluh anak dari keluarga sederhana di Belitung berjuang menempuh pendidikan di bawah bimbingan Bu Muslimah. Kisah persahabatan, keberanian, dan mimpi ini tetap terasa hangat setelah bertahun-tahun.',
    price: 89000,
    stock: 25,
    coverColor: '#B3173B',
    publisher: 'Bentang Pustaka',
    publishedYear: 2005,
    pages: 529,
    weight: 450,
    dimensions: '20 x 13,5 x 3 cm',
    categorySlug: 'fiksi',
  },
  {
    title: 'Hujan',
    slug: 'hujan',
    author: 'Tere Liye',
    isbn: '9786020324784',
    description:
      'Di dunia yang bisa menghapus ingatan, Lail berusaha menyimpan satu hal yang paling berharga: pertemuannya dengan Esok. Sebuah kisah tentang kehilangan, keteguhan, dan cinta yang memilih untuk tetap tinggal.',
    price: 92000,
    stock: 30,
    coverColor: '#14213D',
    publisher: 'Gramedia Pustaka Utama',
    publishedYear: 2016,
    pages: 320,
    weight: 300,
    dimensions: '20 x 13,5 x 2 cm',
    categorySlug: 'fiksi',
  },
  {
    title: 'Perahu Kertas',
    slug: 'perahu-kertas',
    author: 'Dee Lestari',
    isbn: '9789791227385',
    description:
      'Kugy percaya bahwa tulisan adalah jalan hidupnya, sementara Keenan ingin menjadi pelukis. Dua mimpi yang bertemu di kota yang sama, lalu dipisahkan oleh waktu dan pilihan.',
    price: 105000,
    stock: 22,
    coverColor: '#D9A404',
    publisher: 'Bentang Pustaka',
    publishedYear: 2009,
    pages: 444,
    weight: 380,
    dimensions: '20 x 13,5 x 2,5 cm',
    categorySlug: 'fiksi',
  },
  {
    title: 'The Architecture of Love',
    slug: 'the-architecture-of-love',
    author: 'Ika Natassa',
    isbn: '9786020322995',
    description:
      'Raia dan River bertemu di New York, dua orang yang sama-sama sedang menghindari masa lalu. Di antara jalan-jalan kota dan percakapan tengah malam, mereka belajar merancang ulang arti rumah.',
    price: 99000,
    stock: 8,
    coverColor: '#C97B63',
    publisher: 'Gramedia Pustaka Utama',
    publishedYear: 2016,
    pages: 280,
    weight: 280,
    dimensions: '20 x 13,5 x 1,8 cm',
    categorySlug: 'fiksi',
  },
  {
    title: 'Pulang',
    slug: 'pulang',
    author: 'Leila S. Chudori',
    isbn: '9786024244798',
    description:
      'Dimas Suryo meninggalkan Indonesia setelah peristiwa 1965 dan menghabiskan puluhan tahun di Paris. Ketika tanah air memanggil kembali, ia harus berhadapan dengan sejarah keluarga yang belum selesai.',
    price: 148000,
    stock: 12,
    coverColor: '#2F5D50',
    publisher: 'Kepik',
    publishedYear: 2012,
    pages: 462,
    weight: 420,
    dimensions: '20 x 14 x 2,8 cm',
    categorySlug: 'fiksi',
  },
  {
    title: 'Bumi Manusia',
    slug: 'bumi-manusia',
    author: 'Pramoedya Ananta Toer',
    isbn: '9789799731234',
    description:
      'Minke adalah pemuda terpelajar di akhir era Hindia Belanda yang jatuh cinta pada Annelies. Melalui kisah mereka, Pramoedya membuka luka kolonialisme, kelas sosial, dan perjuangan menjadi manusia.',
    price: 135000,
    stock: 18,
    coverColor: '#8B5E3C',
    publisher: 'Lentera Dipantara',
    publishedYear: 1980,
    pages: 535,
    weight: 500,
    dimensions: '21 x 14 x 3 cm',
    categorySlug: 'sastra',
  },
  {
    title: 'Cantik Itu Luka',
    slug: 'cantik-itu-luka',
    author: 'Eka Kurniawan',
    isbn: '9789793062945',
    description:
      'Dewi Ayu bangkit dari kubur dan mendapati kota serta keluarganya porak-poranda. Sebuah saga kelam yang memikat tentang kecantikan, kekerasan, dan sejarah Indonesia.',
    price: 125000,
    stock: 6,
    coverColor: '#5E3A5D',
    publisher: 'Gramedia Pustaka Utama',
    publishedYear: 2002,
    pages: 522,
    weight: 480,
    dimensions: '20 x 13,5 x 2,8 cm',
    categorySlug: 'sastra',
  },
  {
    title: 'Laut Bercerita',
    slug: 'laut-bercerita',
    author: 'Leila S. Chudori',
    isbn: '9786024246945',
    description:
      'Bir Laut dan kawan-kawannya diculik pada masa Orde Baru. Bertahun-tahun kemudian, adiknya mencari kebenaran di antara ingatan, surat, dan laut yang menyimpan banyak rahasia.',
    price: 165000,
    stock: 9,
    coverColor: '#1F5F63',
    publisher: 'Kepik',
    publishedYear: 2017,
    pages: 379,
    weight: 400,
    dimensions: '20 x 14 x 2,4 cm',
    categorySlug: 'sastra',
  },
  {
    title: 'Para Priyayi',
    slug: 'para-priyayi',
    author: 'Umar Kayam',
    isbn: '9789794073179',
    description:
      'Perjalanan Sastrodarsono dari guru desa menjadi priyayi membuka potret perubahan sosial Jawa pada awal abad ke-20. Sebuah novel yang tenang, cerdas, dan penuh ingatan.',
    price: 118000,
    stock: 11,
    coverColor: '#8B5E3C',
    publisher: 'Pustaka Utama Grafiti',
    publishedYear: 1992,
    pages: 376,
    weight: 360,
    dimensions: '20 x 13,5 x 2,3 cm',
    categorySlug: 'sastra',
  },
  {
    title: 'Rumah Kaca',
    slug: 'rumah-kaca',
    author: 'Pramoedya Ananta Toer',
    isbn: '9789794073650',
    description:
      'Pangemanann, seorang pribumi yang bekerja untuk pemerintah kolonial, mengawasi pergerakan kaum terpelajar. Novel penutup Tetralogi Buru ini adalah potret kekuasaan dan pengkhianatan.',
    price: 128000,
    stock: 7,
    coverColor: '#14213D',
    publisher: 'Hasta Mitra',
    publishedYear: 1988,
    pages: 480,
    weight: 430,
    dimensions: '21 x 14 x 2,7 cm',
    categorySlug: 'sastra',
  },
  {
    title: 'Filosofi Teras',
    slug: 'filosofi-teras',
    author: 'Henry Manampiring',
    isbn: '9786024125189',
    description:
      'Stoisisme kuno Romawi diterjemahkan ke dalam bahasa sehari-hari untuk membantu kita menghadapi kekhawatiran, emosi negatif, dan tekanan hidup modern. Praktis, hangat, dan mudah diterapkan.',
    price: 98000,
    stock: 40,
    coverColor: '#D9A404',
    publisher: 'Kompas',
    publishedYear: 2018,
    pages: 346,
    weight: 350,
    dimensions: '20 x 13 x 2 cm',
    categorySlug: 'non-fiksi',
  },
  {
    title: 'Sapiens: Riwayat Singkat Umat Manusia',
    slug: 'sapiens',
    author: 'Yuval Noah Harari',
    isbn: '9786024241886',
    description:
      'Dari revolusi kognitif hingga revolusi sains, Harari menelusuri bagaimana Homo sapiens menguasai bumi. Sebuah sejarah besar yang membuat kita mempertanyakan masa depan manusia.',
    price: 189000,
    stock: 7,
    coverColor: '#1B1B1F',
    publisher: 'Kepustakaan Populer Gramedia',
    publishedYear: 2011,
    pages: 528,
    weight: 650,
    dimensions: '23 x 15 x 3,2 cm',
    categorySlug: 'non-fiksi',
  },
  {
    title: 'Indonesia Menggugat',
    slug: 'indonesia-menggugat',
    author: 'Soekarno',
    isbn: '9789794614563',
    description:
      'Pledoi Soekarno di Landraad Bandung pada 1930 yang membongkar kolonialisme dan menegaskan hak bangsa Indonesia untuk merdeka. Sebuah dokumen sejarah yang masih menggema.',
    price: 115000,
    stock: 10,
    coverColor: '#B3173B',
    publisher: 'Yayasan Obor Indonesia',
    publishedYear: 2001,
    pages: 280,
    weight: 330,
    dimensions: '21 x 14 x 1,8 cm',
    categorySlug: 'non-fiksi',
  },
  {
    title: 'Sejarah Indonesia Modern 1200-2008',
    slug: 'sejarah-indonesia-modern',
    author: 'M.C. Ricklefs',
    isbn: '9789791112323',
    description:
      'Rujukan lengkap tentang perjalanan Indonesia dari kerajaan-kerajaan awal hingga era reformasi. Ditulis dengan teliti, buku ini membantu memahami akar dari banyak persoalan hari ini.',
    price: 210000,
    stock: 4,
    coverColor: '#2F5D50',
    publisher: 'Serambi',
    publishedYear: 2008,
    pages: 720,
    weight: 900,
    dimensions: '24 x 16 x 3,8 cm',
    categorySlug: 'non-fiksi',
  },
  {
    title: 'Atomic Habits',
    slug: 'atomic-habits',
    author: 'James Clear',
    isbn: '9786020633183',
    description:
      'Perubahan besar lahir dari kebiasaan-kebiasaan kecil yang dilakukan konsisten. James Clear menawarkan kerangka praktis untuk membangun kebiasaan baik dan melepaskan kebiasaan buruk.',
    price: 125000,
    stock: 32,
    coverColor: '#EFE4D2',
    publisher: 'Gramedia Pustaka Utama',
    publishedYear: 2018,
    pages: 340,
    weight: 380,
    dimensions: '20 x 13,5 x 2,2 cm',
    categorySlug: 'pengembangan-diri',
  },
  {
    title: 'Berani Tidak Disukai',
    slug: 'berani-tidak-disukai',
    author: 'Ichiro Kishimi & Fumitake Koga',
    isbn: '9786020333267',
    description:
      'Melalui percakapan antara seorang filsuf dan pemuda, buku ini memperkenalkan psikologi Adler untuk membebaskan diri dari pengakuan orang lain. Menantang, tetapi membebaskan.',
    price: 108000,
    stock: 20,
    coverColor: '#6B8CAE',
    publisher: 'Gramedia Pustaka Utama',
    publishedYear: 2017,
    pages: 340,
    weight: 360,
    dimensions: '20 x 13,5 x 2,1 cm',
    categorySlug: 'pengembangan-diri',
  },
  {
    title: 'Seni Bersikap Bodo Amat',
    slug: 'seni-bersikap-bodo-amat',
    author: 'Mark Manson',
    isbn: '9786020333687',
    description:
      'Tidak semua hal layak dipedulikan. Dengan bahasa blak-blakan dan humor, Mark Manson mengajak kita memilih nilai yang benar-benar penting dan berhenti menghabiskan energi pada hal yang salah.',
    price: 88000,
    stock: 0,
    coverColor: '#B4532A',
    publisher: 'Gramedia Pustaka Utama',
    publishedYear: 2017,
    pages: 240,
    weight: 260,
    dimensions: '20 x 13,5 x 1,5 cm',
    categorySlug: 'pengembangan-diri',
  },
  {
    title: 'The Psychology of Money',
    slug: 'psychology-of-money',
    author: 'Morgan Housel',
    isbn: '9786020635583',
    description:
      'Mengelola uang bukan sekadar hitungan, tetapi juga perilaku. Lewat cerita-cerita pendek, Housel menunjukkan bagaimana kesabaran, rasa cukup, dan keberuntungan membentuk keputusan finansial kita.',
    price: 112000,
    stock: 14,
    coverColor: '#A7B79A',
    publisher: 'Gramedia Pustaka Utama',
    publishedYear: 2020,
    pages: 256,
    weight: 300,
    dimensions: '20 x 13,5 x 1,7 cm',
    categorySlug: 'pengembangan-diri',
  },
  {
    title: 'Rahasia Magnet Rezeki',
    slug: 'rahasia-magnet-rezeki',
    author: 'Nasrullah',
    isbn: '9786020483283',
    description:
      'Buku ini membahas cara membangun pola pikir kelimpahan, memperbaiki kebiasaan finansial, dan membuka jalan rezeki melalui usaha yang terarah. Ditulis dengan bahasa ringan dan religius.',
    price: 99000,
    stock: 5,
    coverColor: '#5E3A5D',
    publisher: 'Elex Media Komputindo',
    publishedYear: 2019,
    pages: 320,
    weight: 340,
    dimensions: '20 x 13,5 x 2 cm',
    categorySlug: 'pengembangan-diri',
  },
  {
    title: 'Rich Dad Poor Dad',
    slug: 'rich-dad-poor-dad',
    author: 'Robert T. Kiyosaki',
    isbn: '9789792242387',
    description:
      'Dua sosok ayah dengan cara pandang berbeda tentang uang membentuk pemahaman Kiyosaki tentang aset, liabilitas, dan kebebasan finansial. Buku klasik yang mengubah cara banyak orang melihat penghasilan.',
    price: 85000,
    stock: 27,
    coverColor: '#2F5D50',
    publisher: 'Gramedia Pustaka Utama',
    publishedYear: 1997,
    pages: 240,
    weight: 280,
    dimensions: '20 x 13,5 x 1,5 cm',
    categorySlug: 'bisnis',
  },
  {
    title: 'Zero to One',
    slug: 'zero-to-one',
    author: 'Peter Thiel',
    isbn: '9786022917512',
    description:
      'Membangun masa depan berarti menciptakan sesuatu yang benar-benar baru, bukan meniru. Peter Thiel membagikan cara berpikir tentang inovasi, monopoli, dan perusahaan rintisan yang bertahan lama.',
    price: 119000,
    stock: 11,
    coverColor: '#14213D',
    publisher: 'Bentang Pustaka',
    publishedYear: 2014,
    pages: 224,
    weight: 280,
    dimensions: '20 x 13,5 x 1,5 cm',
    categorySlug: 'bisnis',
  },
  {
    title: 'The Personal MBA',
    slug: 'personal-mba',
    author: 'Josh Kaufman',
    isbn: '9786022917475',
    description:
      'Rangkuman konsep bisnis penting tanpa harus menempuh sekolah mahal: nilai, pemasaran, penjualan, keuangan, dan pengelolaan orang. Padat, praktis, dan langsung bisa dipakai.',
    price: 159000,
    stock: 6,
    coverColor: '#D9A404',
    publisher: 'Bentang Pustaka',
    publishedYear: 2010,
    pages: 448,
    weight: 500,
    dimensions: '21 x 14 x 2,6 cm',
    categorySlug: 'bisnis',
  },
  {
    title: 'Si Kancil dan Kawan-Kawan',
    slug: 'si-kancil',
    author: 'Tim Buku Nusantara',
    isbn: '9786023944867',
    description:
      'Kumpulan cerita Si Kancil yang cerdik bersama sahabat-sahabat hutan. Cerita pendek penuh pesan moral, cocok untuk dibacakan sebelum tidur atau untuk pembaca awal.',
    price: 65000,
    stock: 45,
    coverColor: '#E0A526',
    publisher: 'Bhuana Ilmu Populer',
    publishedYear: 2020,
    pages: 96,
    weight: 220,
    dimensions: '24 x 17 x 0,6 cm',
    categorySlug: 'anak',
  },
  {
    title: 'Petualangan ke Negeri Awan',
    slug: 'petualangan-negeri-awan',
    author: 'Clara Ng',
    isbn: '9786020323268',
    description:
      'Nara menemukan pintu rahasia menuju negeri di atas awan. Bersama makhluk-makhluk kecil yang tinggal di sana, ia harus menyelamatkan cahaya pagi sebelum negeri itu menghilang.',
    price: 78000,
    stock: 16,
    coverColor: '#6B8CAE',
    publisher: 'Gramedia Pustaka Utama',
    publishedYear: 2015,
    pages: 120,
    weight: 250,
    dimensions: '23 x 16 x 0,8 cm',
    categorySlug: 'anak',
  },
  {
    title: 'Seri Sains Ceria: Tata Surya',
    slug: 'seri-sains-ceria',
    author: 'Tim Edukasi',
    isbn: '9786020480510',
    description:
      'Kenali matahari, planet-planet, bulan, dan bintang melalui gambar berwarna serta penjelasan sederhana. Buku pengantar astronomi yang membuat rasa ingin tahu anak tumbuh.',
    price: 72000,
    stock: 21,
    coverColor: '#1F5F63',
    publisher: 'Elex Media Komputindo',
    publishedYear: 2021,
    pages: 80,
    weight: 200,
    dimensions: '24 x 17 x 0,5 cm',
    categorySlug: 'anak',
  },
  {
    title: 'Dongeng Nusantara: 33 Cerita',
    slug: 'dongeng-nusantara',
    author: 'Ari Kurniawan',
    isbn: '9786023942952',
    description:
      'Tiga puluh tiga dongeng dari berbagai daerah di Indonesia dikumpulkan dalam satu buku. Mulai dari Malin Kundang hingga Danau Toba, setiap cerita disertai ilustrasi hangat.',
    price: 89000,
    stock: 19,
    coverColor: '#B4532A',
    publisher: 'Bhuana Ilmu Populer',
    publishedYear: 2019,
    pages: 180,
    weight: 300,
    dimensions: '23 x 16 x 1 cm',
    categorySlug: 'anak',
  },
];

const demoUsers = [
  { name: 'Budi Santoso', email: 'budi@gmail.com' },
  { name: 'Sinta Maharani', email: 'sinta@gmail.com' },
  { name: 'Raka Pratama', email: 'raka@gmail.com' },
  { name: 'Maya Lestari', email: 'maya@gmail.com' },
  { name: 'Dimas Saputra', email: 'dimas@gmail.com' },
  { name: 'Ayu Wulandari', email: 'ayu@gmail.com' },
  { name: 'Fajar Nugroho', email: 'fajar@gmail.com' },
];

const reviewComments = [
  'Buku datang dalam kondisi mulus, pengiriman cepat. Isinya benar-benar menyentuh.',
  'Sampulnya cantik dan kertasnya nyaman. Ceritanya bikin susah berhenti membaca.',
  'Sudah lama ingin baca buku ini, akhirnya kebeli juga. Tidak menyesal.',
  'Bahasa Indonesia terjemahannya enak dibaca. Cocok untuk hadiah.',
  'Packing rapi, ada bubble wrap. Buku original, halaman lengkap.',
  'Cerita yang sederhana tapi meninggalkan kesan mendalam.',
  'Banyak insight yang bisa langsung diterapkan. Recommended.',
  'Bab awalnya agak lambat, tapi pertengahan sampai akhir memuaskan.',
  'Untuk harga segini, kualitas cetakannya sangat baik.',
  'Salah satu buku favorit tahun ini. Akan baca ulang.',
  'Pengiriman sedikit terlambat, tapi bukunya tetap sampai dengan selamat.',
  'Isinya padat, perlu dibaca pelan-pelan sambil direnungkan.',
  'Anak saya suka sekali, gambarnya penuh warna dan ceritanya lucu.',
  'Buku klasik yang wajib ada di rak. Edisi ini bagus.',
  'Tema besarnya relevan dengan kehidupan sehari-hari.',
  'Saya beli karena rekomendasi teman, ternyata memang bagus.',
];

const ratingPatterns = [
  [5, 5, 4],
  [5, 4, 4],
  [5, 5, 5],
  [4, 4, 5],
  [5, 5, 4],
  [4, 5, 4],
];

const daysAgo = (days: number, hour = 10) => {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date;
};

async function main() {
  console.log('Seeding Rak Kata demo data...');

  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@tokobuku.com' },
    update: { name: 'Admin Rak Kata', emailVerified: true },
    create: {
      name: 'Admin Rak Kata',
      email: 'admin@tokobuku.com',
      passwordHash,
      role: 'ADMIN',
      emailVerified: true,
    },
  });

  const users = [];
  for (const user of demoUsers) {
    const record = await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, emailVerified: true },
      create: {
        name: user.name,
        email: user.email,
        passwordHash,
        role: 'USER',
        emailVerified: true,
      },
    });
    users.push(record);
  }

  const categoryBySlug = new Map<string, { id: string; name: string; slug: string }>();

  for (const category of categories) {
    const record = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, description: category.description },
      create: category,
    });
    categoryBySlug.set(record.slug, record);
  }

  for (const book of books) {
    const category = categoryBySlug.get(book.categorySlug);
    if (!category) throw new Error(`Kategori ${book.categorySlug} tidak ditemukan`);
    const { categorySlug: _categorySlug, ...bookData } = book;

    await prisma.book.upsert({
      where: { slug: book.slug },
      update: {
        coverImage: null,
        coverColor: book.coverColor,
        description: book.description,
        stock: book.stock,
      },
      create: {
        ...bookData,
        categoryId: category.id,
        coverImage: null,
        language: 'Indonesian',
        isActive: true,
      },
    });
  }

  // Seed addresses for the main demo customer.
  const budi = users[0];
  const addressSeeds = [
    {
      label: 'Rumah',
      recipient: 'Budi Santoso',
      phone: '081234567890',
      address: 'Jl. Cendana No. 17, RT 04/RW 02, Menteng',
      province: 'DKI Jakarta',
      provinceId: '6',
      city: 'Jakarta Pusat',
      cityId: '152',
      subdistrict: 'Menteng',
      postalCode: '10310',
      isDefault: true,
    },
    {
      label: 'Kantor',
      recipient: 'Budi Santoso',
      phone: '081234567890',
      address: 'Jl. Jend. Sudirman Kav. 52-53, SCBD, Kebayoran Baru',
      province: 'DKI Jakarta',
      provinceId: '6',
      city: 'Jakarta Selatan',
      cityId: '153',
      subdistrict: 'Kebayoran Baru',
      postalCode: '12190',
      isDefault: false,
    },
  ];

  for (const address of addressSeeds) {
    const existing = await prisma.address.findFirst({
      where: { userId: budi.id, label: address.label },
    });
    if (existing) {
      await prisma.address.update({ where: { id: existing.id }, data: address });
    } else {
      await prisma.address.create({ data: { ...address, userId: budi.id } });
    }
  }

  // Coupons
  const couponSeeds = [
    {
      code: 'RAKKATA10',
      description: 'Diskon 10% untuk pembelian pertama',
      type: 'PERCENTAGE' as const,
      value: 10,
      minSpend: 100000,
      maxDiscount: 25000,
      maxUsage: 200,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90),
    },
    {
      code: 'ONGKIRGRATIS',
      description: 'Potongan ongkir Rp 15.000',
      type: 'FIXED' as const,
      value: 15000,
      minSpend: 150000,
      maxUsage: 100,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
    },
  ];

  for (const coupon of couponSeeds) {
    await prisma.coupon.upsert({
      where: { code: coupon.code },
      update: { description: coupon.description, expiresAt: coupon.expiresAt },
      create: coupon,
    });
  }

  // Remove previous demo orders before recreating them with fresh dates.
  const existingOrders = await prisma.order.findMany({
    select: { id: true, billingAddress: true },
  });
  const demoOrderIds = existingOrders
    .filter(order => (order.billingAddress as any)?.seed === true)
    .map(order => order.id);
  if (demoOrderIds.length > 0) {
    await prisma.order.deleteMany({ where: { id: { in: demoOrderIds } } });
  }

  const bookBySlug = new Map<string, { id: string; title: string; price: number }>();
  const allBooks = await prisma.book.findMany({
    select: { id: true, title: true, price: true, slug: true },
  });
  for (const book of allBooks) bookBySlug.set(book.slug, book);

  const shippingAddress = {
    recipient: 'Budi Santoso',
    phone: '081234567890',
    address: 'Jl. Cendana No. 17, RT 04/RW 02, Menteng',
    city: 'Jakarta Pusat',
    province: 'DKI Jakarta',
    postalCode: '10310',
    cityId: '152',
    provinceId: '6',
  };

  const orderSeeds = [
    {
      user: users[0],
      status: 'DELIVERED' as const,
      days: 38,
      items: [
        { slug: 'laskar-pelangi', qty: 1 },
        { slug: 'filosofi-teras', qty: 2 },
      ],
      shippingCost: 15000,
      paymentStatus: 'SUCCESS' as const,
      courier: 'JNE',
      trackingNumber: 'JNE1234567890',
      notes: 'Tolong bungkus rapi, ini hadiah.',
    },
    {
      user: users[1],
      status: 'DELIVERED' as const,
      days: 22,
      items: [
        { slug: 'bumi-manusia', qty: 1 },
        { slug: 'laut-bercerita', qty: 1 },
      ],
      shippingCost: 15000,
      paymentStatus: 'SUCCESS' as const,
      courier: 'SiCepat',
      trackingNumber: 'SC9876543210',
      notes: null,
    },
    {
      user: users[2],
      status: 'SHIPPED' as const,
      days: 5,
      items: [
        { slug: 'atomic-habits', qty: 1 },
        { slug: 'psychology-of-money', qty: 1 },
      ],
      shippingCost: 15000,
      paymentStatus: 'SUCCESS' as const,
      courier: 'JNE',
      trackingNumber: 'JNE0098765432',
      notes: null,
    },
    {
      user: users[3],
      status: 'PROCESSING' as const,
      days: 2,
      items: [
        { slug: 'hujan', qty: 1 },
        { slug: 'perahu-kertas', qty: 1 },
      ],
      shippingCost: 15000,
      paymentStatus: 'SUCCESS' as const,
      courier: 'J&T',
      trackingNumber: null,
      notes: 'Mohon kirim setelah jam 15.00.',
    },
    {
      user: users[4],
      status: 'PAID' as const,
      days: 1,
      items: [{ slug: 'zero-to-one', qty: 1 }],
      shippingCost: 15000,
      paymentStatus: 'SUCCESS' as const,
      courier: 'JNE',
      trackingNumber: null,
      notes: null,
    },
    {
      user: users[0],
      status: 'PENDING' as const,
      days: 0,
      items: [{ slug: 'berani-tidak-disukai', qty: 1 }],
      shippingCost: 15000,
      paymentStatus: 'PENDING' as const,
      courier: 'JNE',
      trackingNumber: null,
      notes: null,
    },
    {
      user: users[5],
      status: 'CANCELLED' as const,
      days: 12,
      items: [{ slug: 'personal-mba', qty: 1 }],
      shippingCost: 15000,
      paymentStatus: 'EXPIRED' as const,
      courier: 'SiCepat',
      trackingNumber: null,
      notes: null,
    },
    {
      user: users[6],
      status: 'DELIVERED' as const,
      days: 60,
      items: [
        { slug: 'rich-dad-poor-dad', qty: 1 },
        { slug: 'zero-to-one', qty: 1 },
      ],
      shippingCost: 15000,
      paymentStatus: 'SUCCESS' as const,
      courier: 'JNE',
      trackingNumber: 'JNE5556667778',
      notes: null,
    },
  ];

  const verifiedPairs = new Set<string>();

  for (let index = 0; index < orderSeeds.length; index += 1) {
    const seed = orderSeeds[index];
    const createdAt = daysAgo(seed.days, 9 + index);
    const orderNumber = `ORD-${createdAt.toISOString().slice(0, 10).replace(/-/g, '')}-D${String(index + 1).padStart(2, '0')}`;

    const items = seed.items.map(item => {
      const book = bookBySlug.get(item.slug);
      if (!book) throw new Error(`Buku ${item.slug} tidak ditemukan`);
      return {
        bookId: book.id,
        qty: item.qty,
        price: book.price,
        bookTitle: book.title,
        bookCover: '',
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const total = subtotal + seed.shippingCost;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: seed.user.id,
        status: seed.status,
        subtotal,
        shippingCost: seed.shippingCost,
        discount: 0,
        total,
        shippingAddress: {
          ...shippingAddress,
          recipient: seed.user.name,
          phone: seed.user.email === 'budi@gmail.com' ? shippingAddress.phone : '081298765432',
        } as any,
        billingAddress: { seed: true } as any,
        notes: seed.notes,
        courier: seed.courier,
        trackingNumber: seed.trackingNumber,
        createdAt,
        paidAt: seed.paymentStatus === 'SUCCESS' ? createdAt : null,
        shippedAt: seed.status === 'SHIPPED' || seed.status === 'DELIVERED' ? daysAgo(seed.days - 2, 14) : null,
        deliveredAt: seed.status === 'DELIVERED' ? daysAgo(seed.days - 5, 16) : null,
        cancelledAt: seed.status === 'CANCELLED' ? daysAgo(seed.days - 1, 12) : null,
        cancelReason: seed.status === 'CANCELLED' ? 'Pembayaran kedaluwarsa' : null,
        items: { create: items },
      },
    });

    await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: 'xendit',
        providerRef: `seed-invoice-${index + 1}-${Date.now()}`,
        status: seed.paymentStatus,
        amount: total,
        currency: 'IDR',
        paymentMethod: seed.paymentStatus === 'SUCCESS' ? 'EWALLET' : 'VA',
        paymentChannel: seed.paymentStatus === 'SUCCESS' ? 'OVO' : 'BCA',
        paidAt: seed.paymentStatus === 'SUCCESS' ? createdAt : null,
        expiredAt: daysAgo(seed.days - 1, 23),
        invoiceUrl: null,
      },
    });

    if (seed.status === 'DELIVERED') {
      for (const item of items) {
        verifiedPairs.add(`${seed.user.id}:${item.bookId}`);
      }
    }
  }

  // Reviews: 2-3 per book from the demo readers.
  for (let bookIndex = 0; bookIndex < books.length; bookIndex += 1) {
    const seed = books[bookIndex];
    const book = await prisma.book.findUnique({ where: { slug: seed.slug } });
    if (!book) continue;

    const pattern = ratingPatterns[bookIndex % ratingPatterns.length];
    const reviewCount = 2 + (bookIndex % 2);

    for (let i = 0; i < reviewCount; i += 1) {
      const user = users[(bookIndex + i + 1) % users.length];
      if (!user) continue;
      if (user.id === admin.id) continue;

      const rating = pattern[i % pattern.length];
      const comment = reviewComments[(bookIndex * 2 + i) % reviewComments.length];
      const createdAt = daysAgo(70 - bookIndex * 2 - i * 3, 20);

      const existing = await prisma.review.findFirst({
        where: { userId: user.id, bookId: book.id },
      });

      const data = {
        userId: user.id,
        bookId: book.id,
        rating,
        comment,
        verifiedPurchase: verifiedPairs.has(`${user.id}:${book.id}`),
        createdAt,
      };

      if (existing) {
        await prisma.review.update({ where: { id: existing.id }, data });
      } else {
        await prisma.review.create({ data });
      }
    }
  }

  const stats = await prisma.review.groupBy({
    by: ['bookId'],
    _avg: { rating: true },
    _count: { _all: true },
  });

  for (const stat of stats) {
    await prisma.book.update({
      where: { id: stat.bookId },
      data: {
        averageRating: Math.round((stat._avg.rating || 0) * 10) / 10,
        reviewCount: stat._count._all,
      },
    });
  }

  console.log('Seed selesai:');
  console.log(`- ${categories.length} kategori`);
  console.log(`- ${books.length} buku`);
  console.log(`- ${demoUsers.length + 1} pengguna demo`);
  console.log(`- ${orderSeeds.length} pesanan demo`);
  console.log('Login admin : admin@tokobuku.com / password123');
  console.log('Login pembeli: budi@gmail.com / password123');
}

main()
  .catch(error => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
